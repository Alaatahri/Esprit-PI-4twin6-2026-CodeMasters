import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [mailMode, setMailMode] = useState<'smtp'|'ethereal'|'none'|null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSubmit = async () => {
    if (!email) { setErrorMsg('Veuillez saisir votre email.'); setStatus('error'); return; }
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMailMode(data?.mailMode ?? null);
        setStatus('success');
      } else {
        const msg =
          typeof data?.message === 'string'
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(' ')
              : 'Une erreur est survenue.';
        setErrorMsg(msg);
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Une erreur est survenue.');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f1a', display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#1a1a2e', padding:'40px', borderRadius:'12px',
        width:'100%', maxWidth:'420px', color:'#fff' }}>
        <h2 style={{ color:'#F5A623', marginBottom:'8px' }}>Mot de passe oublié</h2>
        <p style={{ color:'#aaa', fontSize:'14px', marginBottom:'24px' }}>
          Entrez votre email administrateur.
        </p>
        {status === 'success' ? (
          <div style={{ background:'#1e3a2f', border:'1px solid #2ecc71',
            borderRadius:'8px', padding:'20px', textAlign:'center' }}>
            <p style={{ fontSize:'32px', margin:'0 0 12px' }}>📧</p>
            <p>Lien envoyé à <strong>{email}</strong>.<br/>
            {mailMode === 'none' ? (
              <>Aucun e-mail n’est configuré sur le serveur (MAIL_* manquantes).</>
            ) : mailMode === 'ethereal' ? (
              <>Mode dev : e-mail simulé via Ethereal (prévisualisation dans la console backend).</>
            ) : (
              <>Vérifiez votre boîte mail (et les indésirables).</>
            )}
            </p>
            <a href="/login" style={{ color:'#F5A623', marginTop:'12px',
              display:'inline-block', fontSize:'13px' }}>
              ← Retour à la connexion
            </a>
          </div>
        ) : (
          <>
            <label style={{ fontSize:'13px', color:'#ccc' }}>E-mail</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
              placeholder="admin@bmp.tn"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width:'100%', padding:'12px', margin:'8px 0 16px',
                background:'#2a2a3e', border:'1px solid #3a3a5e',
                borderRadius:'8px', color:'#fff', boxSizing:'border-box' }} />
            {status === 'error' && (
              <p style={{ color:'#e74c3c', fontSize:'13px', marginBottom:'12px' }}>
                {errorMsg}
              </p>
            )}
            <button onClick={handleSubmit} disabled={status === 'loading'}
              style={{ width:'100%', padding:'13px', background:'#F5A623',
                border:'none', borderRadius:'8px', color:'#fff', fontWeight:'bold',
                cursor:'pointer', fontSize:'15px',
                opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            <div style={{ textAlign:'center', marginTop:'16px' }}>
              <a href="/login" style={{ color:'#F5A623', fontSize:'13px' }}>
                ← Retour à la connexion
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

