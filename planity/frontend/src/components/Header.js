import React from 'react';
import '../css/header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">💅 Rendez-vous Ongles</h1>
        <p className="header-subtitle">Votre beauté, notre passion</p>
      </div>
      <div className="header-decoration-1"></div>
      <div className="header-decoration-2"></div>
    </header>
  );
}

export default Header;