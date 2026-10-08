import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../engine/game.js';
import { audio } from '../engine/audio.js';
import { DialogModal } from './DialogModal.jsx';

export function GameStage({ onExit }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [gameState, setGameState] = useState('title');
  const [hud, setHud] = useState({
    lives: 5,
    levelName: 'Super Lula World',
    score: 0,
    brasil: 0,
    hero: 'lula'
  });
  const [dialog, setDialog] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Active state for screen buttons to show real-time pressed feedback
  const [activeInputs, setActiveInputs] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    action: false
  });

  const keyInputs = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    action: false
  });

  const pointerInputs = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    action: false
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  // Synchronize both keyboard and mouse/touch inputs into engine
  const syncInput = useCallback((action) => {
    const isDown = Boolean(keyInputs.current[action] || pointerInputs.current[action]);
    engineRef.current?.setInput(action, isDown);
    setActiveInputs((prev) => (prev[action] === isDown ? prev : { ...prev, [action]: isDown }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onHudUpdate = (hudData) => {
      setHud((prev) => ({ ...prev, ...hudData }));
    };

    engine.onDialog = (dlgData) => {
      setDialog(dlgData ? { ...dlgData } : null);
    };

    engine.start();

    // Keyboard mappings (WASD, Arrows, Space, Z, X, Shift, Enter)
    const keyMap = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
      KeyZ: 'jump',
      Space: 'jump',
      Enter: 'jump',
      KeyX: 'action',
      KeyC: 'action',
      ShiftLeft: 'action',
      ShiftRight: 'action'
    };

    const handleKeyDown = (e) => {
      audio.init();

      if (e.code === 'KeyM') {
        const muted = audio.toggleMute();
        setIsMuted(muted);
        showToast(muted ? 'Som desligado' : 'Som ligado');
        return;
      }

      if (e.code === 'Escape') {
        if (engine.state === 'play') {
          engine.state = 'pause';
          setGameState('pause');
        } else if (engine.state === 'pause') {
          engine.state = 'play';
          setGameState('play');
        }
        return;
      }

      const action = keyMap[e.code];
      if (action) {
        e.preventDefault();
        if (engine.state === 'dialog' && action === 'jump') {
          engine.advanceDialog();
        } else if (engine.state === 'pause') {
          if (action === 'jump') {
            engine.state = 'play';
            setGameState('play');
          } else if (action === 'action') {
            engine.state = 'map';
            setGameState('map');
          }
        } else {
          keyInputs.current[action] = true;
          syncInput(action);
        }
      }
    };

    const handleKeyUp = (e) => {
      const action = keyMap[e.code];
      if (action) {
        e.preventDefault();
        keyInputs.current[action] = false;
        syncInput(action);
      }
    };

    // Global release to guarantee buttons never get stuck when mouse released outside
    const handleGlobalPointerUp = () => {
      let changed = false;
      for (const act in pointerInputs.current) {
        if (pointerInputs.current[act]) {
          pointerInputs.current[act] = false;
          syncInput(act);
          changed = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      engine.stop();
    };
  }, [syncInput]);

  // Pointer event handlers for on-screen buttons (mouse click or touch)
  const handlePointerDown = (action, e) => {
    audio.init();
    if (e) {
      e.preventDefault();
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    }

    const engine = engineRef.current;
    if (!engine) return;

    if (engine.state === 'dialog') {
      engine.advanceDialog();
      return;
    }

    if (engine.state === 'pause') {
      if (action === 'jump') {
        engine.state = 'play';
        setGameState('play');
      } else if (action === 'action') {
        engine.state = 'map';
        setGameState('map');
      }
      return;
    }

    pointerInputs.current[action] = true;
    syncInput(action);
  };

  const handlePointerUp = (action, e) => {
    if (e) {
      e.preventDefault();
      try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    pointerInputs.current[action] = false;
    syncInput(action);
  };

  // Direct click on retro canvas
  const handleCanvasClick = (e) => {
    audio.init();
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 336 / rect.width;
    const scaleY = 192 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    engineRef.current.handleCanvasClick(clickX, clickY);
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Som desligado' : 'Som ligado');
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (engine.state === 'play') {
      engine.state = 'pause';
      setGameState('pause');
    } else if (engine.state === 'pause') {
      engine.state = 'play';
      setGameState('play');
    }
  };

  const showHud = gameState === 'play' || gameState === 'pause';

  return (
    <div className="stage-wrapper">
      <div className="stage" id="stage">
        {/* Retro Canvas (336x192) */}
        <canvas
          ref={canvasRef}
          id="game"
          width="336"
          height="192"
          aria-label="Super Lula World Game"
          onPointerDown={handleCanvasClick}
        />

        {/* In-Game HUD */}
        {showHud && (
          <div id="hud" className="px">
            <div id="hLives">♥ x {hud.lives}</div>
            <div id="hLevel">{hud.levelName}</div>
            <div id="hSpecial">🇧🇷 x {hud.brasil}</div>
            <div id="hCoins">{String(hud.score).padStart(6, '0')}</div>
          </div>
        )}

        {/* Quick Actions (Sound, Pause, Switch Cartridge) */}
        <div className="top-bar">
          <button
            className="ctrl-btn"
            onClick={handleToggleMute}
            title="Ligar/Desligar Som (M)"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="ctrl-btn"
            onClick={handleTogglePause}
            title="Pausar Jogo (Esc)"
          >
            ⏸
          </button>
          {onExit && (
            <button
              className="ctrl-btn exit-btn"
              onClick={onExit}
              title="Trocar Cartucho"
            >
              ◂ Cartuchos
            </button>
          )}
        </div>

        {/* Pause Overlay */}
        {gameState === 'pause' && (
          <div id="pause" className="ov center px">
            <div className="go-head">PAUSA</div>
            <div className="go-hint">
              Clique em Continuar ou use o teclado (Z para continuar / X para mapa)
            </div>
            <div className="pause-actions">
              <button
                className="modal-btn"
                onClick={() => {
                  engineRef.current.state = 'play';
                  setGameState('play');
                }}
              >
                Continuar
              </button>
              <button
                className="modal-btn secondary"
                onClick={() => {
                  engineRef.current.state = 'map';
                  setGameState('map');
                }}
              >
                Voltar ao Mapa
              </button>
            </div>
          </div>
        )}

        {/* Dialog Modal (Story Intros & Fact Sources) */}
        {gameState === 'dialog' && (
          <DialogModal
            dialog={dialog}
            onAdvance={() => engineRef.current?.advanceDialog()}
          />
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div id="toast" className="px">
            {toastMsg}
          </div>
        )}
      </div>

      {/* CONTROLE COMPLETO NA TELA (Botões virtuais para Mouse e Touch) */}
      <div id="screen-controls" className="screen-controls-panel">
        {/* D-Pad Direcional */}
        <div className="dpad-box">
          <div className="dpad">
            <button
              type="button"
              className={`d-btn d-up ${activeInputs.up ? 'active' : ''}`}
              title="Cima (W / Seta Cima)"
              onPointerDown={(e) => handlePointerDown('up', e)}
              onPointerUp={(e) => handlePointerUp('up', e)}
              onPointerCancel={(e) => handlePointerUp('up', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="btn-glyph">▲</span>
              <span className="btn-sub">W</span>
            </button>

            <button
              type="button"
              className={`d-btn d-left ${activeInputs.left ? 'active' : ''}`}
              title="Esquerda (A / Seta Esquerda)"
              onPointerDown={(e) => handlePointerDown('left', e)}
              onPointerUp={(e) => handlePointerUp('left', e)}
              onPointerCancel={(e) => handlePointerUp('left', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="btn-glyph">◀</span>
              <span className="btn-sub">A</span>
            </button>

            <button
              type="button"
              className={`d-btn d-right ${activeInputs.right ? 'active' : ''}`}
              title="Direita (D / Seta Direita)"
              onPointerDown={(e) => handlePointerDown('right', e)}
              onPointerUp={(e) => handlePointerUp('right', e)}
              onPointerCancel={(e) => handlePointerUp('right', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="btn-glyph">▶</span>
              <span className="btn-sub">D</span>
            </button>

            <button
              type="button"
              className={`d-btn d-down ${activeInputs.down ? 'active' : ''}`}
              title="Baixo (S / Seta Baixo)"
              onPointerDown={(e) => handlePointerDown('down', e)}
              onPointerUp={(e) => handlePointerUp('down', e)}
              onPointerCancel={(e) => handlePointerUp('down', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="btn-glyph">▼</span>
              <span className="btn-sub">S</span>
            </button>
          </div>
        </div>

        {/* Botões de Ação Arcade */}
        <div className="action-box">
          {/* Botão X: Ação / Correr */}
          <button
            type="button"
            className={`action-btn btn-x ${activeInputs.action ? 'active' : ''}`}
            title="Ação / Correr (X ou Shift)"
            onPointerDown={(e) => handlePointerDown('action', e)}
            onPointerUp={(e) => handlePointerUp('action', e)}
            onPointerCancel={(e) => handlePointerUp('action', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="btn-glyph">X</span>
            <span className="btn-label">AÇÃO</span>
            <span className="btn-sub">[Shift/X]</span>
          </button>

          {/* Botão Z: Pular / Confirmar */}
          <button
            type="button"
            className={`action-btn btn-z ${activeInputs.jump ? 'active' : ''}`}
            title="Pular / Confirmar (Z ou Espaço)"
            onPointerDown={(e) => handlePointerDown('jump', e)}
            onPointerUp={(e) => handlePointerUp('jump', e)}
            onPointerCancel={(e) => handlePointerUp('jump', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="btn-glyph">Z</span>
            <span className="btn-label">PULAR</span>
            <span className="btn-sub">[Espaço/Z]</span>
          </button>
        </div>
      </div>

      {/* Legenda Informativa para Computador e Teclado */}
      <div className="legend">
        <div className="legend-row">
          <span><b>Teclado</b>: <b>A / D</b> ou <b>◀ ▶</b> mover &nbsp;|&nbsp; <b>Z / Espaço</b> pular &nbsp;|&nbsp; <b>X / Shift</b> correr &nbsp;|&nbsp; <b>Esc</b> pausa</span>
        </div>
        <div className="legend-row sub">
          <span>💡 Você também pode <b>clicar e segurar</b> nos botões da tela com o mouse para jogar!</span>
        </div>
      </div>
    </div>
  );
}
