import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faFileLines, 
  faEnvelope, 
  faShoppingBag,
  faUser,
  faSignInAlt,
  faUserPlus,
  faChevronDown,
  faSignOutAlt,
  faCog,
  faClipboardList,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';
import SideMenu from './SideMenu';
import CartPreview from './CartPreview';
import heirloomLogo from '../assets/images/heirloomlogo.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { getCartCount, isCartOpen, setIsCartOpen, toggleCart } = useCart();
  const { user, logout, updateUser } = useAuth();
  const accountMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    navigate('/');
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

  useEffect(() => {
    // LocalStorage'dan kullanıcı bilgilerini kontrol et
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      if (userData && !user) {
        // AuthContext'i güncelle
        updateUser(userData);
      }
    }
  }, []);

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

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
              <span className="button-text">
                {user?.name || 'HESABIM'}
              </span>
              <FontAwesomeIcon icon={faChevronDown} className="chevron-icon" />
            </button>
            {isAccountMenuOpen && (
              <div className="account-dropdown">
                {user ? (
                  <>
                    <div className="account-info">
                      <span className="user-name">{user?.name}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                    <Link to="/profile/edit" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                      <span>Bilgilerim</span>
                    </Link>
                    <Link to="/addresses" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="dropdown-icon" />
                      <span>Adres Bilgilerim</span>
                    </Link>
                    <Link to="/orders" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faClipboardList} className="dropdown-icon" />
                      <span>Siparişlerim</span>
                    </Link>
                    <Link to="/settings" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faCog} className="dropdown-icon" />
                      <span>Ayarlar</span>
                    </Link>
                    <button onClick={handleLogout} className="account-dropdown-item logout-button">
                      <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                      <span>Çıkış Yap</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faSignInAlt} className="dropdown-icon" />
                      <span>Üye Girişi</span>
                    </Link>
                    <Link to="/register" className="account-dropdown-item">
                      <FontAwesomeIcon icon={faUserPlus} className="dropdown-icon" />
                      <span>Üye Ol</span>
                    </Link>
                  </>
                )}
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