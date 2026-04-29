import { useState } from 'react';
import { Sessions } from './views/Sessions.js';
import { Patterns } from './views/Patterns.js';
import { Templates } from './views/Templates.js';
import './design-tokens.css';
import './App.css';

type Tab = 'sessions' | 'patterns' | 'templates';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'sessions', label: 'Sessions' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'templates', label: 'Templates' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('sessions');

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">TokenBurn · Spec Intelligence</div>
        <nav className="app-header__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? ' tab-btn--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {tab === 'sessions' && <Sessions />}
        {tab === 'patterns' && <Patterns />}
        {tab === 'templates' && <Templates />}
      </main>
    </div>
  );
}
