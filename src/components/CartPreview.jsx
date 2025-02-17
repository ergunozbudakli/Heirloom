import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import '../styles/CartPreview.css';

const CartPreview = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const calculateItemPrice = (item) => {
    const price = item.discount 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return price * item.quantity;
  };

  const handleCheckout = () => {
    onClose();
    setIsModalOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const SHIPPING_FEE = 29.90;
  const FREE_SHIPPING_THRESHOLD = 500;
  
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shouldApplyShipping = subtotal < FREE_SHIPPING_THRESHOLD;
  const total = shouldApplyShipping ? subtotal + SHIPPING_FEE : subtotal;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <>
      <div className={`cart-preview ${isOpen ? 'open' : ''}`}>
        <div className="cart-preview-header">
          <h3>Sepetim ({cart.length})</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Sepetiniz boş</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div className="item-price">
                    {formatPrice(calculateItemPrice(item))} TL
                  </div>
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-button"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-button"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span>Ara Toplam:</span>
            <span>{subtotal.toFixed(2)} TL</span>
          </div>
          
          <div className="cart-shipping">
            <span>Kargo Ücreti:</span>
            {shouldApplyShipping ? (
              <span className="shipping-price">{SHIPPING_FEE.toFixed(2)} TL</span>
            ) : (
              <div className="shipping-free">
                <span className="shipping-original">{SHIPPING_FEE.toFixed(2)} TL</span>
                <span className="shipping-free-text">Ücretsiz</span>
              </div>
            )}
          </div>

          {shouldApplyShipping && (
            <div className="free-shipping-info">
              <span>{Math.ceil(remainingForFreeShipping)} TL</span> daha ürün ekleyerek ücretsiz kargo fırsatından yararlanabilirsiniz!
            </div>
          )}
          
          <div className="cart-total cart-grand-total">
            <span>Genel Toplam:</span>
            <span>{total.toFixed(2)} TL</span>
          </div>
        </div>

        <div className="cart-actions">
          <button className="view-cart-button" onClick={handleViewCart}>
            Sepeti Görüntüle
          </button>
          <button className="checkout-button" onClick={handleCheckout}>
            Sepeti Onayla
          </button>
        </div>
      </div>

      <div 
        className={`cart-preview-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />

      {/* Sepet Detay Modal */}
      <div className={`cart-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
        <div className={`cart-modal ${isModalOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="cart-modal-header">
            <h2>Sepet Detayı</h2>
            <button className="cart-modal-close" onClick={closeModal}>✕</button>
          </div>
          
          <div className="cart-modal-content">
            {cart.map(item => (
              <div key={item.id} className="cart-modal-item">
                <img src={item.image} alt={item.name} className="modal-item-image" />
                <div className="modal-item-details">
                  <h3 className="modal-item-name">{item.name}</h3>
                  <div className="modal-item-price">
                    {formatPrice(calculateItemPrice(item))} TL
                  </div>
                  <div className="modal-item-controls">
                    <div className="modal-quantity-controls">
                      <button 
                        className="modal-quantity-button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="modal-quantity-value">{item.quantity}</span>
                      <button 
                        className="modal-quantity-button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <button 
                      className="modal-remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Kaldır</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-modal-footer">
            <div className="modal-total">
              <span className="modal-total-label">Ara Toplam:</span>
              <span className="modal-total-amount">{subtotal.toFixed(2)} TL</span>
            </div>
            
            <div className="modal-shipping">
              <span>Kargo Ücreti:</span>
              {shouldApplyShipping ? (
                <span className="shipping-price">{SHIPPING_FEE.toFixed(2)} TL</span>
              ) : (
                <div className="shipping-free">
                  <span className="shipping-original">{SHIPPING_FEE.toFixed(2)} TL</span>
                  <span className="shipping-free-text">Ücretsiz</span>
                </div>
              )}
            </div>

            {shouldApplyShipping && (
              <div className="free-shipping-info">
                <span>{Math.ceil(remainingForFreeShipping)} TL</span> daha ürün ekleyerek ücretsiz kargo fırsatından yararlanabilirsiniz!
              </div>
            )}

            <div className="modal-total modal-grand-total">
              <span className="modal-total-label">Genel Toplam:</span>
              <span className="modal-total-amount">{total.toFixed(2)} TL</span>
            </div>
            
            <div className="cart-buttons">
              <button className="view-cart-button" onClick={closeModal}>
                Alışverişe Devam Et
              </button>
              <button className="checkout-button" onClick={handleCheckout}>
                Sepeti Onayla
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPreview; 