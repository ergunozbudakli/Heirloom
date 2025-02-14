import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faFileLines, 
  faEnvelope, 
  faShoppingBag,
  faUser,
  faSignInAlt,
  faUserPlus,
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import '../styles/Header.css';
import SideMenu from './SideMenu';
import CartPreview from './CartPreview';
import heirloomLogo from '../assets/images/heirloomlogo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { getCartCount, isCartOpen, setIsCartOpen, toggleCart } = useCart();
  const accountMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cartCount = getCartCount();

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="menu-button" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Link to="/" className="header-logo">
            <img src={heirloomLogo} alt="Heirloom" className="header-logo-image" />
          </Link>
        </div>
        
        <div className="header-right">
          <button className="header-button">
            <FontAwesomeIcon icon={faFileLines} className="button-icon" />
            <span className="button-text">SİPARİŞ</span>
          </button>
          <button className="header-button">
            <FontAwesomeIcon icon={faEnvelope} className="button-icon" />
            <span className="button-text">İLETİŞİM</span>
          </button>
          <div className="account-menu-container" ref={accountMenuRef}>
            <button className="header-button" onClick={toggleAccountMenu}>
              <FontAwesomeIcon icon={faUser} className="button-icon" />
              <span className="button-text">HESABIM</span>
              <FontAwesomeIcon icon={faChevronDown} className="chevron-icon" />
            </button>
            {isAccountMenuOpen && (
              <div className="account-dropdown">
                <Link to="/login" className="account-dropdown-item">
                  <FontAwesomeIcon icon={faSignInAlt} className="dropdown-icon" />
                  <span>Üye Girişi</span>
                </Link>
                <Link to="/register" className="account-dropdown-item">
                  <FontAwesomeIcon icon={faUserPlus} className="dropdown-icon" />
                  <span>Üye Ol</span>
                </Link>
              </div>
            )}
          </div>
          <button 
            className="header-button cart-button" 
            onClick={toggleCart}
            data-count={cartCount}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="button-icon" />
            <span className="button-text">SEPET {cartCount > 0 && `(${cartCount})`}</span>
          </button>
        </div>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={toggleMenu} />
      <CartPreview isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header; 