// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary uhvatio grešku:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',background:'linear-gradient(135deg, #fde8e8 0%, #fff5f5 100%)',padding:'1rem'}}>
          <div style={{background:'white',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.12)',padding:'2rem',maxWidth:480,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>⚠️</div>
            <h2 style={{margin:'0 0 0.5rem',color:'#c53030',fontSize:'1.1rem',fontFamily:'var(--mono)'}}>
              Došlo je do greške
            </h2>
            <p style={{color:'#666',fontSize:'0.85rem',margin:'0 0 1rem',lineHeight:1.5}}>
              Aplikacija je naišla na neočekivanu grešku. Vaši podaci su sigurni.
            </p>

            {/* Error details (collapsible) */}
            <details style={{textAlign:'left',marginBottom:'1rem',background:'#f8f8f8',borderRadius:8,padding:'0.5rem 0.75rem',fontSize:'0.72rem'}}>
              <summary style={{cursor:'pointer',fontWeight:600,color:'#888',marginBottom:'0.25rem'}}>Tehnički detalji</summary>
              <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',color:'#c53030',margin:'0.25rem 0',maxHeight:200,overflow:'auto'}}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>

            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{padding:'0.6rem 1.2rem',background:'var(--green, #2d5a27)',color:'white',border:'none',borderRadius:8,fontSize:'0.85rem',fontWeight:700,cursor:'pointer'}}>
                Pokušaj ponovo
              </button>
              <button onClick={() => window.location.reload()}
                style={{padding:'0.6rem 1.2rem',background:'#e2e8f0',color:'#4a5568',border:'none',borderRadius:8,fontSize:'0.85rem',fontWeight:700,cursor:'pointer'}}>
                Osvježi stranicu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
