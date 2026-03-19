
// ─── RENDER ───────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
    <ToastContainer />
  </ErrorBoundary>
);
