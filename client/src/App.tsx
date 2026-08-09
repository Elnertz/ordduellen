import { useState } from 'react';
import DuelGame from './DuelGame';
import AdminPanel from './AdminPanel';
import OnlineGame from './OnlineGame';
import Leaderboard from './Leaderboard';
import './styles.css';

type View = 'play' | 'online' | 'leaderboard' | 'admin';

export default function App() {
  const [view, setView] = useState<View>(() =>
    new URLSearchParams(location.search).has('rum') ? 'online' : 'play',
  );

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
          {([
            ['play', 'Spela'],
            ['online', 'Online'],
            ['leaderboard', 'Topplista'],
            ['admin', 'Databas'],
          ] as Array<[View, string]>).map(([id, label]) => (
            <button
              key={id}
              className={`nav-btn ${view === id ? 'active' : ''}`}
              onClick={() => setView(id)}
              aria-current={view === id}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {view === 'play' && <DuelGame />}
        {view === 'online' && <OnlineGame />}
        {view === 'leaderboard' && <Leaderboard />}
        {view === 'admin' && <AdminPanel />}
      </main>

      <footer className="footer">
        Ordduellen · en svensk resonemangsduell med tusentals sammanlänkade ord
      </footer>
    </div>
  );
}
