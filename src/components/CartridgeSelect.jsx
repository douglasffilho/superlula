import React, { useEffect, useState } from 'react';

export function CartridgeSelect({ onSelectCartridge }) {
  const [selectedIdx, setSelectedIdx] = useState(2); // Default to Super Lula World!
  const [isLulaCompleted, setIsLulaCompleted] = useState(false);

  useEffect(() => {
    try {
      const doneMask = parseInt(localStorage.getItem('slw-done') || '0', 10);
      setIsLulaCompleted(doneMask === 127);
    } catch (e) {}

    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') {
        setSelectedIdx((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        setSelectedIdx((prev) => Math.min(2, prev + 1));
      } else if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onSelectCartridge(selectedIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, onSelectCartridge]);

  return (
    <div className="carts px">
      <h1 className="carts-title">Escolha o Cartucho</h1>

      <div className="cart-row">
        {/* Cartucho 1: Super Flávio World I */}
        <button
          className={`cart c1 ${selectedIdx === 0 ? 'on' : ''}`}
          onMouseEnter={() => setSelectedIdx(0)}
          onClick={() => onSelectCartridge(0)}
          title="Super Flávio World I"
        >
          <span className="shell">
            <span className="lbl">
              <span className="cs">Super</span>
              <span className="cf">Flávio</span>
              <span className="cw">World</span>
              <span className="ct">
                A ficha corrida<br />2000–2026
              </span>
            </span>
          </span>
        </button>

        {/* Cartucho 2: Super Flávio World II */}
        <button
          className={`cart c2 ${selectedIdx === 1 ? 'on' : ''}`}
          onMouseEnter={() => setSelectedIdx(1)}
          onClick={() => onSelectCartridge(1)}
          title="Super Flávio World II"
        >
          <span className="shell">
            <span className="lbl">
              <span className="cs">Super</span>
              <span className="cf">Flávio</span>
              <span className="cw">World II</span>
              <span className="ct">
                O pesadelo<br />Continua
              </span>
            </span>
          </span>
        </button>

        {/* Cartucho 3: Super Lula World */}
        <button
          className={`cart c3 ${selectedIdx === 2 ? 'on' : ''}`}
          onMouseEnter={() => setSelectedIdx(2)}
          onClick={() => onSelectCartridge(2)}
          title="Super Lula World"
        >
          <span className="shell">
            <span className="lbl">
              <span className="cs">Super</span>
              <span className="cf clula">Lula</span>
              <span className="cw cstar">★ World ★</span>
              <span className="ct">
                A caravana<br />1980–2026
              </span>
            </span>
          </span>
          {isLulaCompleted && <span className="seal">ZERADO</span>}
        </button>
      </div>

      <div className="cart-hint">
        {selectedIdx === 2
          ? '🎮 Cartucho 3: Super Lula World — 7 fases checadas com fatos e fontes reais!'
          : selectedIdx === 0
          ? '🔗 Abrir Super Flávio World (superflavio.com/#1)'
          : '🔗 Abrir Super Flávio World II (superflavio.com/#2)'}
      </div>

      <div className="legend">
        <b>◀ ▶</b> escolher cartucho &nbsp;·&nbsp;
        <b>Z / Enter</b> iniciar jogo
      </div>
    </div>
  );
}

