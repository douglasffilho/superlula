import React from 'react';
import { sources } from '../data/sources.js';

export function DialogModal({ dialog, onAdvance }) {
  if (!dialog) return null;

  const curPage = dialog.pages[dialog.index];
  if (!curPage) return null;

  const bodyText = curPage.body || '';
  const visibleChars = Math.floor(dialog.charCount || 0);
  const displayedBody = bodyText.slice(0, visibleChars);
  const isTypingDone = visibleChars >= bodyText.length;

  return (
    <div
      className="dlg px"
      role="dialog"
      aria-live="polite"
      onClick={onAdvance}
    >
      {curPage.tag && (
        <div className={`tag ${curPage.tag.includes('Concluída') ? 'tag-end' : ''}`}>
          {curPage.tag}
        </div>
      )}

      {curPage.title && <h2>{curPage.title}</h2>}

      <p className="dlg-body">
        {displayedBody}
        {!isTypingDone && <span className="cursor-blink">▌</span>}
      </p>

      {isTypingDone && curPage.note && (
        <p className="note">{curPage.note}</p>
      )}

      {isTypingDone && curPage.src && curPage.src.length > 0 && (
        <div className="src">
          <span className="src-title">Fontes checadas: </span>
          {curPage.src.map((srcKey, idx) => {
            const item = sources[srcKey];
            if (!item) return null;
            return (
              <span key={srcKey}>
                {idx > 0 && ' · '}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.label} ↗
                </a>
              </span>
            );
          })}
        </div>
      )}

      <div className="next" id="dlgNext">
        {isTypingDone ? 'Aperte Z ou toque para continuar ▾' : 'Toque para avançar texto'}
      </div>
    </div>
  );
}

