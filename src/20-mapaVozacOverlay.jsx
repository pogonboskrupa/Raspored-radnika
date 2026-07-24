// ─── MAPA ODJELA — RASPORED VOZAČA (integracija sa glavnim Rasporedom radnika) ─
// Novo, samostalno od 18-karta-odjela.jsx (koji ostaje neizmijenjen) — čita
// window.__mapaOdjelaInternal (aditivni export iz karta-odjela.jsx) da poveže
// vozače (workers sa category:'vozac', zakazane na odjel u glavnom Rasporedu) sa
// istim geojson poligonima/key-matching logikom koju karta već koristi za
// primke/otpreme. Za svaki odjel koji ima zakazanog vozača tog dana: nacrta OSRM
// rutu Šumarija→odjel (udaljenost + vrijeme) i istakne poligon odjela na mapi.
//
// NAMJERNO nije vezano za "Raspored kamiona" — ti kamioni su kupčevi, kreću sa
// svoje lokacije, ne od Šumarije, pa im ruta Šumarija→odjel nije relevantna.
// Ovdje su u pitanju VLASTITI vozači firme (radnici kategorije 'vozac' ili
// row.otherDriverId) koji stvarno kreću iz Šumarije.
(function () {
  'use strict';

  const ROUTE_COLORS = ['#ea580c', '#0891b2', '#7c3aed', '#be123c', '#059669', '#ca8a04', '#4338ca', '#c2410c'];
  const HIGHLIGHT_COLOR = '#ea580c';

  // OSRM (javni demo server) računa vrijeme vožnje po opštem "car" profilu i za
  // makadamske/šumske puteve (dio ovih ruta) pretpostavlja prespore brzine — u praksi
  // stvarno vrijeme je oko 55% OSRM procjene. Empirijski faktor, ne mijenja distancu
  // (ta je geometrijski tačna preko stvarne putne mreže), samo prikazano trajanje.
  const ROUTE_DURATION_FACTOR = 0.55;

  // Udaljenost Šumarija→odjel se praktično ne mijenja (putna mreža je stabilna) — keširaj
  // izračunatu OSRM rutu po odjelu u localStorage da se ne pogađa javni OSRM demo server
  // (spor, rate-limituje) svaki put iznova. Ključ je labelKey(gj+odjel) poligona sa kojim je
  // odjel matchovan (stabilan identitet), ne slobodni tekst koji korisnik unese.
  // v2 (ne v1): stari keš je čuvao NEKORIGOVANO trajanje (prije ROUTE_DURATION_FACTOR) —
  // bump verzije ključa da se stare, prespore procjene ne serviraju zauvijek iz keša.
  const ROUTE_CACHE_KEY = 'mapa_ruta_cache_v2';
  function _loadRouteCache() {
    try { return JSON.parse(localStorage.getItem(ROUTE_CACHE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function _saveRouteCache(cache) {
    try { localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
  }
  window.clearMapaRutaCache = function () {
    try { localStorage.removeItem(ROUTE_CACHE_KEY); } catch (e) {}
  };

  let _routeLayerGroup = null;
  let _highlightedLayers = [];

  function _clearHighlights() {
    const internal = window.__mapaOdjelaInternal;
    const layerGroup = internal && internal.getLayerGroup();
    _highlightedLayers.forEach(lyr => { if (layerGroup) layerGroup.resetStyle(lyr); });
    _highlightedLayers = [];
  }

  window.clearMapaVozacRute = function () {
    const internal = window.__mapaOdjelaInternal;
    const map = internal && internal.getMap();
    if (_routeLayerGroup && map) map.removeLayer(_routeLayerGroup);
    _routeLayerGroup = null;
    _clearHighlights();
  };

  // Svi geojson poligoni (mogu biti više dijelova za isti odjel) koji odgovaraju
  // datom "GJ ODJEL" labelu — ISTA normalizacija (labelKey precizno → normKey
  // fallback) kao karta-odjela.js koristi za primke/otpreme.
  function _findFeaturesForOdjel(rawLabel, features, internal) {
    const label = internal.labelKey(rawLabel);
    let matches = features.filter(lyr => {
      const p = lyr._kartaProps || {};
      return internal.labelKey((p.gj || '') + ' ' + (p.odjel || p.name || '')) === label;
    });
    if (matches.length) return matches;
    const norm = internal.normKey(rawLabel);
    return features.filter(lyr => {
      const p = lyr._kartaProps || {};
      return internal.normKey((p.gj || '') + ' ' + (p.odjel || p.name || '')) === norm;
    });
  }

  function _combinedCentroid(layers) {
    try {
      const bounds = L.latLngBounds([]);
      layers.forEach(l => bounds.extend(l.getBounds()));
      return bounds.isValid() ? bounds.getCenter() : null;
    } catch (e) { return null; }
  }

  async function _fetchRoute(fromLatLng, toLatLng, internal) {
    const url = `${internal.OSRM_URL}/${fromLatLng[1]},${fromLatLng[0]};${toLatLng.lng},${toLatLng.lat}?overview=full&geometries=geojson`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (data.code !== 'Ok' || !data.routes.length) throw new Error('Nema rute');
    const route = data.routes[0];
    return {
      coords: route.geometry.coordinates.map(c => [c[1], c[0]]),
      distKm: route.distance / 1000,
      durMin: Math.round(route.duration / 60 * ROUTE_DURATION_FACTOR),
    };
  }

  const _sleep = ms => new Promise(r => setTimeout(r, ms));

  // groups: [{ key, label, drivers:[imena], jobTypes:[...] }] — pripremljeno u
  // React sloju (19-MapaOdjelaView.jsx) iz schedules+departments+workers, jer taj
  // sloj zna poslovnu logiku (ko je vozač, koji red ima dodijeljen odjel). Ovaj
  // fajl je namjerno "glup" — samo matchuje label→poligon, crta rutu, highlightuje.
  // Vraća { matched:[{odjel,drivers,jobTypes,distKm,durMin,color,cached,error?}],
  // unmatched:[label,...] } za React prikaz liste.
  window.showMapaVozacRute = async function (groups) {
    const internal = window.__mapaOdjelaInternal;
    if (!internal) return { matched: [], unmatched: [], error: 'Karta nije inicijalizovana.' };
    const map = internal.getMap();
    const features = internal.getAllFeatures();
    if (!map || !features || !features.length) return { matched: [], unmatched: [], error: 'Poligoni odjela još nisu učitani — sačekajte da se karta učita.' };

    window.clearMapaVozacRute();

    if (!groups || !groups.length) return { matched: [], unmatched: [] };

    _routeLayerGroup = L.layerGroup().addTo(map);
    const matched = [];
    const unmatched = [];
    let colorIdx = 0;
    const boundsAcc = [];
    const routeCache = _loadRouteCache();

    for (const g of groups) {
      const lyrs = _findFeaturesForOdjel(g.label, features, internal);
      const centroid = lyrs.length ? _combinedCentroid(lyrs) : null;
      if (!lyrs.length || !centroid) { unmatched.push(g.label); continue; }

      const color = ROUTE_COLORS[colorIdx % ROUTE_COLORS.length];
      colorIdx++;

      lyrs.forEach(lyr => {
        lyr.setStyle({ color: HIGHLIGHT_COLOR, weight: 5, opacity: 1, dashArray: null });
        _highlightedLayers.push(lyr);
      });

      const p0 = lyrs[0]._kartaProps || {};
      const cacheKey = internal.labelKey((p0.gj || '') + ' ' + (p0.odjel || p0.name || g.label));
      let route = routeCache[cacheKey];
      const fromCache = !!route;

      try {
        if (!route) {
          route = await _fetchRoute(internal.SUMARIJA_LATLNG, centroid, internal);
          routeCache[cacheKey] = route;
          _saveRouteCache(routeCache);
        }
        L.polyline(route.coords, { color, weight: 4, opacity: 0.85, dashArray: '8 4' })
          .bindTooltip(`${g.label}: ${route.distKm.toFixed(1)} km · ~${route.durMin} min${fromCache ? ' · keš' : ''}`, { permanent: false, direction: 'center', className: 'karta-tooltip' })
          .addTo(_routeLayerGroup);
        route.coords.forEach(c => boundsAcc.push(c));
        matched.push({ odjel: g.label, drivers: g.drivers, jobTypes: g.jobTypes, distKm: route.distKm, durMin: route.durMin, color, cached: fromCache });
      } catch (e) {
        matched.push({ odjel: g.label, drivers: g.drivers, jobTypes: g.jobTypes, distKm: null, durMin: null, color, error: e.message });
      }
      // Blaga pauza između poziva — javni OSRM demo server zna throttle-ovati brze uzastopne pozive.
      // Preskoči je za keš-pogotke (nema mrežnog poziva, nema šta throttle-ovati).
      if (!fromCache) await _sleep(300);
    }

    if (boundsAcc.length) {
      try { map.fitBounds(boundsAcc, { padding: [40, 40] }); } catch (e) {}
    }

    return { matched, unmatched };
  };

})();
