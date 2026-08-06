import { useState } from 'react';
import DuelGame from './DuelGame';
import AdminPanel from './AdminPanel';
import './styles.css';

type View = 'play' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('play');

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden>⚔️</span>
          <div>
            <h1>Ordduellen</h1>
            <p className="tagline">Vilket ord besegrar motståndaren? Domaren avgör.</p>
          </div>
        </div>
        <nav className="nav" aria-label="Huvudmeny">
          <button
            className={`nav-btn ${view === 'play' ? 'active' : ''}`}
            onClick={() => setView('play')}
            aria-current={view === 'play'}
          >
            Spela
          </button>
          <button
            className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
            aria-current={view === 'admin'}
          >
            Databas
          </button>
        </nav>
      </header>

      <main>{view === 'play' ? <DuelGame /> : <AdminPanel />}</main>

      <footer className="footer">
        Ordduellen · en svensk resonemangsduell med tusentals sammanlänkade ord
      </footer>
    </div>
  );
}
