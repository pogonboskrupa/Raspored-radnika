// ─── MAPA ODJELA — RASPORED VOZILA (integracija sa "Raspored kamiona") ─────────
// Novo, samostalno od 18-karta-odjela.jsx (koji ostaje neizmijenjen) — čita
// window.__mapaOdjelaInternal (aditivni export iz karta-odjela.jsx) da poveže
// truckRows (Raspored kamiona, ovaj repo) sa istim geojson poligonima/key-matching
// logikom koju karta već koristi za primke/otpreme. Za svaki odjel koji ima
// zakazan kamion na odabrani dan: nacrta OSRM rutu Šumarija→odjel (udaljenost +
// vrijeme) i istakne poligon odjela na mapi.
(function () {
  'use strict';

  const ROUTE_COLORS = ['#ea580c', '#0891b2', '#7c3aed', '#be123c', '#059669', '#ca8a04', '#4338ca', '#c2410c'];
  const HIGHLIGHT_COLOR = '#ea580c';

  let _routeLayerGroup = null;
  let _highlightedLayers = [];

  function _clearHighlights() {
    const internal = window.__mapaOdjelaInternal;
    const layerGroup = internal && internal.getLayerGroup();
    _highlightedLayers.forEach(lyr => { if (layerGroup) layerGroup.resetStyle(lyr); });
    _highlightedLayers = [];
  }

  window.clearMapaVozilaRute = function () {
    const internal = window.__mapaOdjelaInternal;
    const map = internal && internal.getMap();
    if (_routeLayerGroup && map) map.removeLayer(_routeLayerGroup);
    _routeLayerGroup = null;
    _clearHighlights();
  };

  // Svi geojson poligoni (mogu biti više dijelova za isti odjel) koji odgovaraju
  // slobodnom tekstu odjela iz Raspored kamiona (npr. "RISOVAC KRUPA 54") — ISTA
  // normalizacija (labelKey precizno → normKey fallback) kao karta-odjela.js.
  function _findFeaturesForOdjel(rawOdjel, features, internal) {
    const label = internal.labelKey(rawOdjel);
    let matches = features.filter(lyr => {
      const p = lyr._kartaProps || {};
      return internal.labelKey((p.gj || '') + ' ' + (p.odjel || p.name || '')) === label;
    });
    if (matches.length) return matches;
    const norm = internal.normKey(rawOdjel);
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
      durMin: Math.round(route.duration / 60),
    };
  }

  const _sleep = ms => new Promise(r => setTimeout(r, ms));

  // Grupiši truckRows za dati datum po normalizovanom odjelu, spoji sa geojson
  // poligonom (ako postoji), nacrtaj OSRM rutu Šumarija→odjel + istakni poligon.
  // Vraća { matched:[{odjel,kamioni,distKm,durMin,color,error?}], unmatched:[odjel,...] }
  // za React prikaz liste (rute/highlight ostaju u Leafletu, van React-a).
  window.showMapaVozilaRute = async function (dateStr, truckRows) {
    const internal = window.__mapaOdjelaInternal;
    if (!internal) return { matched: [], unmatched: [], error: 'Karta nije inicijalizovana.' };
    const map = internal.getMap();
    const features = internal.getAllFeatures();
    if (!map || !features || !features.length) return { matched: [], unmatched: [], error: 'Poligoni odjela još nisu učitani — sačekajte da se karta učita.' };

    window.clearMapaVozilaRute();

    const dayRows = (truckRows || []).filter(r => r.date === dateStr && (r.odjel || '').trim());
    if (!dayRows.length) return { matched: [], unmatched: [] };

    const groups = new Map(); // normKey → { odjelRaw, kamioni:[] }
    dayRows.forEach(r => {
      const k = internal.normKey(r.odjel);
      if (!groups.has(k)) groups.set(k, { odjelRaw: r.odjel.trim(), kamioni: [] });
      groups.get(k).kamioni.push({ sortiment: r.sortiment, kupac: r.kupac });
    });

    _routeLayerGroup = L.layerGroup().addTo(map);
    const matched = [];
    const unmatched = [];
    let colorIdx = 0;
    const boundsAcc = [];

    for (const [, g] of groups) {
      const lyrs = _findFeaturesForOdjel(g.odjelRaw, features, internal);
      const centroid = lyrs.length ? _combinedCentroid(lyrs) : null;
      if (!lyrs.length || !centroid) { unmatched.push(g.odjelRaw); continue; }

      const color = ROUTE_COLORS[colorIdx % ROUTE_COLORS.length];
      colorIdx++;

      lyrs.forEach(lyr => {
        lyr.setStyle({ color: HIGHLIGHT_COLOR, weight: 5, opacity: 1, dashArray: null });
        _highlightedLayers.push(lyr);
      });

      try {
        const route = await _fetchRoute(internal.SUMARIJA_LATLNG, centroid, internal);
        L.polyline(route.coords, { color, weight: 4, opacity: 0.85, dashArray: '8 4' })
          .bindTooltip(`${g.odjelRaw}: ${route.distKm.toFixed(1)} km · ~${route.durMin} min`, { permanent: false, direction: 'center', className: 'karta-tooltip' })
          .addTo(_routeLayerGroup);
        route.coords.forEach(c => boundsAcc.push(c));
        matched.push({ odjel: g.odjelRaw, kamioni: g.kamioni, distKm: route.distKm, durMin: route.durMin, color });
      } catch (e) {
        matched.push({ odjel: g.odjelRaw, kamioni: g.kamioni, distKm: null, durMin: null, color, error: e.message });
      }
      // Blaga pauza između poziva — javni OSRM demo server zna throttle-ovati brze uzastopne pozive.
      await _sleep(300);
    }

    if (boundsAcc.length) {
      try { map.fitBounds(boundsAcc, { padding: [40, 40] }); } catch (e) {}
    }

    return { matched, unmatched };
  };

})();
