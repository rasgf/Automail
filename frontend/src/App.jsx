import { useState, useEffect, useRef } from 'react';
import { FiSend, FiCopy, FiUploadCloud, FiSun, FiMoon, FiChevronLeft, FiChevronRight, FiVideo, FiVideoOff, FiTrash2, FiInbox, FiAlertCircle, FiMenu, FiX, FiFile, FiFileText } from 'react-icons/fi';
import './index.css';


const VideoBackground = ({ videoSrc, isStatic }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleVideoError = (e) => {
    console.error("Erro ao carregar o vídeo:", videoSrc, e);
  };

  useEffect(() => {
    setIsVisible(false);
    if (videoRef.current) {
      if (isStatic) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Erro ao tentar tocar o vídeo:", error);
          });
        }
      }
    }
  }, [isStatic, videoSrc]);

  return (
    <video
      ref={videoRef}
      key={videoSrc}
      className={`video-background ${isVisible ? 'visible' : ''}`}
      autoPlay={!isStatic}
      loop
      muted
      playsInline
      onError={handleVideoError}
      onCanPlay={() => setIsVisible(true)}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
};

const BackgroundControls = ({ onPrev, onNext, isStatic, onToggleStatic }) => {
  return (
    <div className="background-controls">
      <p>Tema de Fundo</p>
      <div className="controls-row">
        <button onClick={onPrev} aria-label="Vídeo anterior"><FiChevronLeft /></button>
        <button onClick={onNext} aria-label="Próximo vídeo"><FiChevronRight /></button>
        <button onClick={onToggleStatic} aria-label="Ativar/desativar vídeo">
          {isStatic ? <FiVideoOff /> : <FiVideo />}
        </button>
      </div>
    </div>
  );
};

const ThemeSwitch = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="theme-switch-wrapper">
      <span>Tema</span>
      <label className="theme-switch" htmlFor="theme-toggle">
        <input type="checkbox" id="theme-toggle" onChange={toggleTheme} checked={theme === 'light'} />
        <span className="slider">
          <FiSun className="slider-icon sun" />
          <FiMoon className="slider-icon moon" />
        </span>
      </label>
    </div>
  );
};


function App() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  
  const [videos, setVideos] = useState(['/videos/video1.mp4', '/videos/video2.mp4', '/videos/video3.mp4', '/videos/video4.mp4', '/videos/video5.mp4']); 
  
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isStatic, setIsStatic] = useState(false);

  const [view, setView] = useState('form'); 
  const [productiveEmails, setProductiveEmails] = useState([]);
  const [unproductiveEmails, setUnproductiveEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartPoint, setTouchStartPoint] = useState(null);
  const [touchCurrentPoint, setTouchCurrentPoint] = useState(null);
  const [isSwipingDetail, setIsSwipingDetail] = useState(false);
  const [isDetailExiting, setIsDetailExiting] = useState(false);


  useEffect(() => {
    document.body.className = '';
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', onKeyDown);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const originalText = text;
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text.trim()) {
      formData.append('text', text);
    } else {
      setError('Por favor, insira um texto ou selecione um arquivo.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!response.ok) { const errData = await response.json().catch(() => null); throw new Error(errData?.detail || `HTTP error! status: ${response.status}`); }
      const data = await response.json();
      
      const fallbackFileType = file ? (file.type || (file.name && file.name.includes('.') ? `.${file.name.split('.').pop()}` : 'desconhecido')) : null;
      const originalBody = file ? `Arquivo enviado: ${file.name} (${fallbackFileType})` : originalText;

      const subject = originalText?.trim() ? (originalText.substring(0, 50) + '...') : (file ? file.name : 'Sem assunto');
      const newEmail = {
        id: Date.now(),
        subject,
        body: originalBody,
        originalFileName: file ? file.name : null,
        originalFileType: file ? (file.type || fallbackFileType) : null,
        ...data
      };

      if (data.category.toLowerCase() === 'produtivo') {
        setProductiveEmails(prev => [newEmail, ...prev]);
        setView('produtivos');
      } else {
        setUnproductiveEmails(prev => [newEmail, ...prev]);
        setView('improdutivos');
      }
      setSelectedEmail(newEmail);
      setText('');
      setFile(null);
      document.getElementById('file-input').value = '';

    } catch (err) { setError(err.message); console.error("Fetch error:", err); } finally { setIsLoading(false); }
  };

  const handleCopy = () => { if (selectedEmail?.suggested_response) navigator.clipboard.writeText(selectedEmail.suggested_response); };
  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) { setFile(f); } };
  const handleTextChange = (e) => { setText(e.target.value); };
  const handleNextVideo = () => { setCurrentVideoIndex((prev) => (prev + 1) % videos.length); };
  const handlePrevVideo = () => { setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length); };

  const handleDelete = (emailId) => {
    setUnproductiveEmails(prev => prev.filter(email => email.id !== emailId));
    setProductiveEmails(prev => prev.filter(email => email.id !== emailId));
    setSelectedEmail(null);
  };

  const handleSend = () => {
    setSelectedEmail(null);
  };

  const handleBackFromDetail = () => {
    if (!isMobile) { setSelectedEmail(null); return; }
    setIsDetailExiting(true);
    setTimeout(() => {
      setSelectedEmail(null);
      setIsDetailExiting(false);
    }, 220);
  };

  const handleDetailTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    setTouchStartPoint({ x: touch.clientX, y: touch.clientY });
    setTouchCurrentPoint({ x: touch.clientX, y: touch.clientY });
    setIsSwipingDetail(true);
  };

  const handleDetailTouchMove = (e) => {
    if (!isMobile || !isSwipingDetail || !touchStartPoint) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartPoint.x;
    const deltaY = touch.clientY - touchStartPoint.y;
    if (Math.abs(deltaY) > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsSwipingDetail(false);
      setTouchStartPoint(null);
      setTouchCurrentPoint(null);
      return;
    }
    setTouchCurrentPoint({ x: touch.clientX, y: touch.clientY });
  };

  const handleDetailTouchEnd = () => {
    if (!isMobile || !isSwipingDetail || !touchStartPoint) return;
    const totalDeltaX = (touchCurrentPoint ? touchCurrentPoint.x : touchStartPoint.x) - touchStartPoint.x;
    if (totalDeltaX > 80) {
      setSelectedEmail(null);
    }
    setIsSwipingDetail(false);
    setTouchStartPoint(null);
    setTouchCurrentPoint(null);
  };

  const renderContent = () => {
    let emailList = [];
    if (view === 'produtivos') emailList = productiveEmails;
    if (view === 'improdutivos') emailList = unproductiveEmails;

    if (view === 'form') {
      return (
        <>
          <h1>Filtre o Ruído. Responda o Essencial.</h1>
          <p className="subtitle">Poupe o tempo da sua equipe. Cole um e-mail e nossa IA irá identificar se ele é <strong>produtivo</strong> (requer uma ação) ou <strong>improdutivo</strong> (apenas informativo), sugerindo a resposta ideal para cada caso.</p>
          <form id="analyzeForm" onSubmit={handleSubmit}>
            <textarea id="text" name="text" rows="10" placeholder='Ex: "Olá, gostaria de saber o status do chamado 12345. Poderiam verificar, por favor?"' value={text} onChange={handleTextChange} disabled={isLoading} />
            <div className="form-actions">
              <label htmlFor="file-input" className="file-label"><FiUploadCloud /><span>{file ? file.name : 'Ou faça upload de um arquivo'}</span></label>
              <input type="file" id="file-input" name="file" accept=".txt,.pdf" onChange={handleFileChange} disabled={isLoading} />
              <button id="submit" type="submit" disabled={isLoading || (!text && !file)}><FiSend />{isLoading ? 'Analisando...' : 'Gerar Resposta com IA'}</button>
            </div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </>
      );
    }

    if (isMobile) {
      if (!selectedEmail) {
        return (
          <div className="email-list">
            <h2>{view === 'produtivos' ? 'Produtivos' : 'Improdutivos'} ({emailList.length})</h2>
            {emailList.length > 0 ? emailList.map(email => (
              <div key={email.id} className={`email-item`} onClick={() => setSelectedEmail(email)}>
                <p className="email-subject">{email.subject}</p>
              </div>
            )) : <p className="empty-list">Nenhum e-mail aqui.</p>}
          </div>
        );
      }
      const swipeOffset = isSwipingDetail && touchStartPoint && touchCurrentPoint ? Math.max(0, Math.min(120, touchCurrentPoint.x - touchStartPoint.x)) : 0;
      const boxShadowStrength = Math.min(0.45, 0.25 + swipeOffset / 400);
      const detailStyle = {
        transform: swipeOffset ? `translateX(${swipeOffset}px)` : 'translateX(0)',
        transition: isSwipingDetail ? 'none' : 'transform .22s ease',
        boxShadow: swipeOffset ? `0 8px 18px rgba(0,0,0,${boxShadowStrength})` : undefined,
        willChange: 'transform',
      };
      const detailAnimClass = !isSwipingDetail ? (isDetailExiting ? 'animate-slide-out' : 'animate-slide-in') : '';
      return (
        <div className={`email-detail mobile-single ${detailAnimClass}`} onTouchStart={handleDetailTouchStart} onTouchMove={handleDetailTouchMove} onTouchEnd={handleDetailTouchEnd} style={detailStyle}>
          <section id="result">
            <button className="back-button" onClick={handleBackFromDetail}>
              <FiChevronLeft /> Voltar
            </button>
            <h2>Resultado da Análise</h2>
            <div className="result-content">
              <p><strong>E-mail Original:</strong></p>
              {selectedEmail.originalFileName ? (
                (() => {
                  const type = (selectedEmail.originalFileType || '').toLowerCase();
                  const name = (selectedEmail.originalFileName || '').toLowerCase();
                  const isText = type.includes('text') || name.endsWith('.txt');
                  const Icon = isText ? FiFileText : FiFile;
                  return (
                    <div className="file-icon-preview" aria-label={`Arquivo ${selectedEmail.originalFileType || 'desconhecido'}`}>
                      <Icon size={48} />
                    </div>
                  );
                })()
              ) : (
                <pre className="original-email-body">{selectedEmail.body}</pre>
              )}
              <hr />
              <p><strong>Categoria:</strong>{' '}<span className={`tag ${selectedEmail.category}`}>{selectedEmail.category}</span></p>
              <p><strong>Resposta Sugerida:</strong></p>
              <pre id="suggested_response">{selectedEmail.suggested_response}</pre>
              <div className="result-actions">
                {view === 'improdutivos' && <button id="copyBtn" onClick={handleCopy}><FiCopy />Copiar Resposta</button>}
                <button id="sendBtn" onClick={handleSend}><FiSend />Enviar Resposta</button>
                <button id="deleteBtn" onClick={() => handleDelete(selectedEmail.id)}><FiTrash2 />Apagar</button>
              </div>
            </div>
          </section>
        </div>
      );
    }
    return (
      <div className={`email-view-container ${selectedEmail ? 'detail-view-active' : ''}`}>
        <div className="email-list">
          <h2>{view === 'produtivos' ? 'Produtivos' : 'Improdutivos'} ({emailList.length})</h2>
          {emailList.length > 0 ? emailList.map(email => (
            <div key={email.id} className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''}`} onClick={() => setSelectedEmail(email)}>
              <p className="email-subject">{email.subject}</p>
            </div>
          )) : <p className="empty-list">Nenhum e-mail aqui.</p>}
        </div>
        <div className="email-detail">
          {selectedEmail ? (
            <section id="result">
               <button className="back-button" onClick={() => setSelectedEmail(null)}>
                <FiChevronLeft /> Voltar
              </button>
              <h2>Resultado da Análise</h2>
              <div className="result-content">
                <p><strong>E-mail Original:</strong></p>
                {selectedEmail.originalFileName ? (
                  (() => {
                    const type = (selectedEmail.originalFileType || '').toLowerCase();
                    const name = (selectedEmail.originalFileName || '').toLowerCase();
                    const isText = type.includes('text') || name.endsWith('.txt');
                    const Icon = isText ? FiFileText : FiFile;
                    return (
                      <div className="file-icon-preview" aria-label={`Arquivo ${selectedEmail.originalFileType || 'desconhecido'}`}>
                        <Icon size={48} />
                      </div>
                    );
                  })()
                ) : (
                  <pre className="original-email-body">{selectedEmail.body}</pre>
                )}
                <hr />
                <p><strong>Categoria:</strong>{' '}<span className={`tag ${selectedEmail.category}`}>{selectedEmail.category}</span></p>
                <p><strong>Resposta Sugerida:</strong></p>
                <pre id="suggested_response">{selectedEmail.suggested_response}</pre>
                <div className="result-actions">
                  {view === 'improdutivos' && <button id="copyBtn" onClick={handleCopy}><FiCopy />Copiar Resposta</button>}
                  <button id="sendBtn" onClick={handleSend}><FiSend />Enviar Resposta</button>
                  <button id="deleteBtn" onClick={() => handleDelete(selectedEmail.id)}><FiTrash2 />Apagar</button>
                </div>
              </div>
            </section>
          ) : (
            <div className="no-email-selected">
              <FiInbox size={48} />
              <p>Selecione um e-mail para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {videos.length > 0 && <VideoBackground videoSrc={videos[currentVideoIndex]} isStatic={isStatic} />}
      {}
      <div className="liquid-blobs" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      
      <div id="mobile-drawer" className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button onClick={() => setIsMobileMenuOpen(false)}><FiX /></button>
        </div>
        <nav className="main-nav">
              <button onClick={() => { setView('form'); setSelectedEmail(null); setIsMobileMenuOpen(false); }} className={view === 'form' ? 'active' : ''}>
                <FiSend /> Nova Análise
              </button>
              <button onClick={() => { setView('produtivos'); setSelectedEmail(null); setIsMobileMenuOpen(false); }} className={view === 'produtivos' ? 'active' : ''}>
                <FiInbox /> Produtivos
              </button>
              <button onClick={() => { setView('improdutivos'); setSelectedEmail(null); setIsMobileMenuOpen(false); }} className={view === 'improdutivos' ? 'active' : ''}>
                <FiAlertCircle /> Improdutivos
              </button>
        </nav>
        <div className="mobile-menu-controls">
            <BackgroundControls 
                onPrev={handlePrevVideo}
                onNext={handleNextVideo}
                isStatic={isStatic}
                onToggleStatic={() => setIsStatic(p => !p)}
            />
            <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className={`mobile-backdrop ${isMobileMenuOpen ? 'visible' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      <div className="container">
        <aside className="sidebar">
          <div>
            <div className="logo">
              <h2>Automail</h2>
              <p>AI Email Assistant</p>
            </div>
             <button className="mobile-menu-toggle" aria-controls="mobile-drawer" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)}>
              <FiMenu />
            </button>
            <nav className="main-nav">
              <button onClick={() => { setView('form'); setSelectedEmail(null); }} className={view === 'form' ? 'active' : ''}>
                <FiSend /> Nova Análise
              </button>
              <button onClick={() => { setView('produtivos'); setSelectedEmail(null); }} className={view === 'produtivos' ? 'active' : ''}>
                <FiInbox /> Produtivos
              </button>
              <button onClick={() => { setView('improdutivos'); setSelectedEmail(null); }} className={view === 'improdutivos' ? 'active' : ''}>
                <FiAlertCircle /> Improdutivos
              </button>
            </nav>
            <div className="desktop-controls">
                <BackgroundControls 
                onPrev={handlePrevVideo}
                onNext={handleNextVideo}
                isStatic={isStatic}
                onToggleStatic={() => setIsStatic(p => !p)}
                />
            </div>
          </div>
          <div className="desktop-controls">
            <ThemeSwitch theme={theme} setTheme={setTheme} />
          </div>
        </aside>

        <main className="content">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;
