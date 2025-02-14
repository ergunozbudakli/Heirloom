import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SideMenu.css';

const menuItems = [
  { title: 'YENİLER', path: '/yeniler' },
  { title: 'HEDİYE ÖNERİLERİ', path: '/hediye-onerileri', isNew: true },
  { title: 'ÖZEL KOLEKSİYON', path: '/ozel-koleksiyon' },
  { title: 'KLASİK KOLEKSİYON', path: '/klasik-koleksiyon' },
  { title: 'KOKULAR', path: '/kokular' },
  { title: 'AKSESUARLAR', path: '/aksesuarlar' },
  { title: 'EV DEKORASYON', path: '/ev-dekorasyon' },
  { title: 'LIFESTYLE', path: '/lifestyle' },
  { title: 'İNDİRİM', path: '/indirim', isHighlighted: true },
];

const footerLinks = [
  { title: 'ÜRÜN GERİ ÇAĞIRMA', path: '/urun-geri-cagirma' },
  { title: 'JOIN LIFE', path: '/join-life' },
  { title: '+INFO', path: '/info' },
];

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="side-menu-logo">
          <h1 className="menu-logo-text">HEIRLOOM</h1>
          <p className="menu-logo-subtext">candles</p>
        </div>
        
        <nav className="side-menu-nav">
          <ul className="menu-items">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <Link 
                  to={item.path} 
                  className={`menu-link ${item.isHighlighted ? 'highlighted' : ''}`}
                  onClick={onClose}
                >
                  {item.title}
                  {item.isNew && <span className="new-badge">NEW</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="side-menu-footer">
          <ul className="footer-links">
            {footerLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.path} className="footer-link" onClick={onClose}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isOpen && <div className="menu-overlay" onClick={onClose} />}
    </>
  );
};

export default SideMenu; 