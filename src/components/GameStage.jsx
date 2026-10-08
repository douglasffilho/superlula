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
  const [isPortrait, setIsPortrait] = useState(false);

  // Active inputs state for visual feedback on buttons
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

  const syncInput = useCallback((action) => {
    const isDown = Boolean(keyInputs.current[action] || pointerInputs.current[action]);
    engineRef.current?.setInput(action, isDown);
    setActiveInputs((prev) => (prev[action] === isDown ? prev : { ...prev, [action]: isDown }));
  }, []);

  useEffect(() => {
    // Check screen orientation (Landscape vs Portrait)
    const checkOrientation = () => {
      const isPort = window.innerHeight > window.innerWidth && window.innerWidth <= 900;
      setIsPortrait(isPort);
      document.documentElement.classList.toggle('touch-on', true);
      document.documentElement.classList.toggle('full', window.innerWidth <= 900 || window.innerHeight <= 520);

      if (isPort && engineRef.current?.state === 'play') {
        engineRef.current.state = 'pause';
        setGameState('pause');
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

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

    // Unlock Web Audio immediately on ANY user interaction on mobile or desktop
    const handleUserGesture = () => {
      audio.unlock();
    };

    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('click', handleUserGesture, { passive: true });

    // Keyboard controls
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
      audio.unlock();

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

    const handleGlobalPointerUp = () => {
      for (const act in pointerInputs.current) {
        if (pointerInputs.current[act]) {
          pointerInputs.current[act] = false;
          syncInput(act);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      engine.stop();
    };
  }, [syncInput]);

  // Pointer event handlers for floating retro buttons
  const handlePointerDown = (action, e) => {
    audio.unlock();
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

  const handleCanvasClick = (e) => {
    audio.unlock();
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 336 / rect.width;
    const scaleY = 192 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    engineRef.current.handleCanvasClick(clickX, clickY);
  };

  const handleToggleMute = (e) => {
    e?.stopPropagation();
    audio.unlock();
    const muted = audio.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Som desligado' : 'Som ligado');
  };

  const handleTogglePause = (e) => {
    e?.stopPropagation();
    audio.unlock();
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

        {/* In-Game HUD Bar */}
        {showHud && (
          <div id="hud" className="px">
            <div id="hLives">♥ x {hud.lives}</div>
            <div id="hLevel">{hud.levelName}</div>
            <div id="hSpecial">🇧🇷 x {hud.brasil}</div>
            <div id="hCoins">{String(hud.score).padStart(6, '0')}</div>
          </div>
        )}

        {/* Top Floating Action Buttons (Cartuchos, Som, Pausa) */}
        {onExit && (
          <button
            type="button"
            className="tcart"
            onClick={onExit}
            title="Trocar Cartucho"
          >
            ◂ TROCAR CARTUCHO
          </button>
        )}

        <button
          type="button"
          className="tmute"
          onClick={handleToggleMute}
          title="Ligar/Desligar Som (M)"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          type="button"
          className="tpause"
          onClick={handleTogglePause}
          title="Pausar Jogo (Esc)"
        >
          II
        </button>

        {/* Floating Translucent On-Screen Controls Overlay (Matching Print 3) */}
        <div id="touch" className="touch">
          {/* Bottom Left: Direction Buttons ◀ ▶ */}
          <div className="dpad">
            <button
              type="button"
              className={`tbtn d-left ${activeInputs.left ? 'on' : ''}`}
              aria-label="Esquerda"
              onPointerDown={(e) => handlePointerDown('left', e)}
              onPointerUp={(e) => handlePointerUp('left', e)}
              onPointerCancel={(e) => handlePointerUp('left', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              ◀
            </button>
            <button
              type="button"
              className={`tbtn d-right ${activeInputs.right ? 'on' : ''}`}
              aria-label="Direita"
              onPointerDown={(e) => handlePointerDown('right', e)}
              onPointerUp={(e) => handlePointerUp('right', e)}
              onPointerCancel={(e) => handlePointerUp('right', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              ▶
            </button>
          </div>

          {/* Bottom Right: Action Buttons B and A (Staggered Diagonal) */}
          <div className="btns">
            <button
              type="button"
              className={`tbtn b ${activeInputs.action ? 'on' : ''}`}
              aria-label="Ação / Correr"
              onPointerDown={(e) => handlePointerDown('action', e)}
              onPointerUp={(e) => handlePointerUp('action', e)}
              onPointerCancel={(e) => handlePointerUp('action', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              B
            </button>
            <button
              type="button"
              className={`tbtn a ${activeInputs.jump ? 'on' : ''}`}
              aria-label="Pular / Confirmar"
              onPointerDown={(e) => handlePointerDown('jump', e)}
              onPointerUp={(e) => handlePointerUp('jump', e)}
              onPointerCancel={(e) => handlePointerUp('jump', e)}
              onContextMenu={(e) => e.preventDefault()}
            >
              A
            </button>
          </div>
        </div>

        {/* Pause Overlay */}
        {gameState === 'pause' && (
          <div id="pause" className="ov center px">
            <div className="go-head">PAUSA</div>
            <div className="go-hint">
              Z continua · X volta ao mapa
            </div>
            <div className="pause-actions">
              <button
                type="button"
                className="modal-btn"
                onClick={() => {
                  engineRef.current.state = 'play';
                  setGameState('play');
                }}
              >
                Continuar
              </button>
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => {
                  engineRef.current.state = 'map';
                  setGameState('map');
                }}
              >
                Mapa
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

      {/* Rotate Screen Prompt for Mobile Portrait (Matching Print 1) */}
      <div id="rotate" hidden={!isPortrait} role="dialog" aria-label="Gire o celular">
        <div className="rlogo" aria-label="Super Lula World">
          <div className="s">SUPER</div>
          <div className="f">
            <span className="l1">L</span>
            <span className="l2">U</span>
            <span className="l3">L</span>
            <span className="l4">A</span>
          </div>
          <div className="w">WORLD</div>
        </div>
        <div className="phone" aria-hidden="true" />
        <h2>GIRE O CELULAR PARA COMEÇAR</h2>
        <p>O jogo é na horizontal, com os controles na tela.</p>
        <small>Esse jogo é uma paródia baseada em fatos reais. Fontes checadas e exibidas após cada fase.</small>
      </div>

      {/* Desktop Keyboard Instructions Legend */}
      <div className="legend">
        <b>◀ ▶</b> andam &nbsp;·&nbsp;
        <b>Z</b> pula / confirma &nbsp;·&nbsp;
        <b>X</b> corre / ação &nbsp;·&nbsp;
        <b>Esc</b> pausa &nbsp;·&nbsp;
        <b>M</b> som
      </div>
    </div>
  );
}
