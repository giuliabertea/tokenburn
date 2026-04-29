import { useState } from 'react';
import { useSessionData } from '../hooks/useSessionData.js';
import type { Template } from '../types.js';
import './Templates.css';

export function Templates() {
  const { data: templates, loading } = useSessionData<Template[]>('/api/templates');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (name: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="templates-view animate-in">
      <div className="templates-view__header">
        <h2>Templates</h2>
        <p>Lean spec templates to reduce token waste from the start.</p>
      </div>

      {loading && <div className="loading">Loading…</div>}

      <div className="template-list">
        {(templates ?? []).map((t) => (
          <div key={t.name} className="template-card">
            <div className="template-card__header">
              <div>
                <div className="template-card__name">{t.name}</div>
                <div className="template-card__tokens">{t.tokenCount} tokens</div>
              </div>
              <button
                className={`copy-btn${copied === t.name ? ' copy-btn--done' : ''}`}
                onClick={() => copy(t.name, t.content)}
              >
                {copied === t.name ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="template-card__preview">{t.content.slice(0, 300)}{t.content.length > 300 ? '…' : ''}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
