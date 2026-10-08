import React, { useState, useEffect } from 'react';
import { GameStage } from './components/GameStage.jsx';
import { CartridgeSelect } from './components/CartridgeSelect.jsx';

export default function App() {
  const [activeCartridge, setActiveCartridge] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#lula' || hash === '#3') return 2;
    if (hash === '#1') return 0;
    if (hash === '#2') return 1;
    return 2; // Default to Super Lula World directly for seamless testing, or menu
  });

  const [inMenu, setInMenu] = useState(() => {
    return window.location.hash === '#menu';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#menu') {
        setInMenu(true);
      } else if (hash === '#lula' || hash === '#3') {
        setInMenu(false);
        setActiveCartridge(2);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectCartridge = (idx) => {
    if (idx === 0) {
      window.open('https://www.superflavio.com/#1', '_blank');
      return;
    }
    if (idx === 1) {
      window.open('https://www.superflavio.com/#2', '_blank');
      return;
    }
    setActiveCartridge(2);
    setInMenu(false);
    window.location.hash = '#lula';
  };

  const handleExitToMenu = () => {
    setInMenu(true);
    window.location.hash = '#menu';
  };

  return (
    <main className="app-container">
      {inMenu ? (
        <CartridgeSelect onSelectCartridge={handleSelectCartridge} />
      ) : (
        <GameStage onExit={handleExitToMenu} />
      )}
    </main>
  );
}

