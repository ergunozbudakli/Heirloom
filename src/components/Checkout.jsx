import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faLock, faMapMarkerAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/Checkout.css';
import AddressForm from './AddressForm';

const CARD_TYPES = {
  visa: {
    pattern: /^4/,
    banks: {
      '402277': 'Garanti BBVA',
      '411156': 'İş Bankası',
      '413182': 'Yapı Kredi',
      '425669': 'Akbank',
      '428220': 'Ziraat Bankası',
      '431373': 'Halkbank',
      '440293': 'Denizbank',
      '447504': 'QNB Finansbank',
      '447505': 'QNB Finansbank',
      '450803': 'Vakıfbank',
      '469884': 'TEB',
      '476619': 'Şekerbank',
      '479227': 'ING Bank',
      '483703': 'HSBC',
      '492094': 'Alternatifbank',
      '494084': 'Odeabank',
      '496004': 'Burgan Bank',
      '498749': 'Fibabanka'
    }
  },
  mastercard: {
    pattern: /^5[1-5]/,
    banks: {
      '510152': 'Garanti BBVA',
      '520195': 'İş Bankası', 
      '526910': 'Enpara',
      '532913': 'Yapı Kredi',
      '540668': 'Akbank',
      '521378': 'Ziraat Bankası',
      '525339': 'Halkbank',
      '535280': 'QNB Finansbank',
      '535281': 'QNB Finansbank',
      '537563': 'Vakıfbank',
      '542030': 'TEB',
      '547564': 'Şekerbank',
      '552879': 'ING Bank',
      '557945': 'HSBC',
      '548237': 'Alternatifbank',
      '558699': 'Odeabank',
      '549220': 'Burgan Bank',
      '547800': 'Fibabanka'
    }
  },
  amex: {
    pattern: /^3[47]/,
    banks: {
      '374622': 'American Express',
      '375622': 'American Express'
    }
  },
  troy: {
    pattern: /^9792/,
    banks: {
      '979203': 'Ziraat Bankası',
      '979205': 'Vakıfbank',
      '979206': 'İş Bankası',
      '979208': 'Halkbank',
      '979209': 'Garanti BBVA',
      '979210': 'Yapı Kredi',
      '979211': 'Akbank',
      '979212': 'QNB Finansbank',
      '979213': 'Denizbank',
      '979214': 'TEB',
      '979215': 'HSBC'
    }
  },
  discover: {
    pattern: /^6(?:011|5)/,
    banks: {
      '601100': 'Discover'
    }
  },
  diners: {
    pattern: /^3(?:0[0-5]|[68])/,
    banks: {
      '300000': 'Diners Club'
    }
  },
  jcb: {
    pattern: /^35/,
    banks: {
      '350000': 'JCB'
    }
  },
  unionpay: {
    pattern: /^62/,
    banks: {
      '620000': 'UnionPay'
    }
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [step, setStep] = useState(1);
  const [cardType, setCardType] = useState('');
  const [bankName, setBankName] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`http://192.168.50.33:5000/api/addresses`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setAddresses(data.data || []); // data.data'yı kullan veya boş dizi döndür
          // Varsayılan adresi seç
          const defaultAddress = data.data?.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          }
        } else {
          console.error('Adresler yüklenirken hata:', data.message);
          setAddresses([]); // Hata durumunda boş dizi
        }
      } catch (error) {
        console.error('Adresler yüklenirken hata:', error);
        setAddresses([]); // Hata durumunda boş dizi
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const detectCardTypeAndBank = (number) => {
    // Boşlukları kaldır
    const cleanNumber = number.replace(/\s/g, '');
    
    // Kart tipini belirle
    let detectedType = null;
    let detectedBank = null;

    for (const [type, typeInfo] of Object.entries(CARD_TYPES)) {
      if (typeInfo.pattern.test(cleanNumber)) {
        detectedType = type;
        // İlk 6 haneye göre banka kontrolü
        const bin = cleanNumber.slice(0, 6);
        if (typeInfo.banks[bin]) {
          detectedBank = typeInfo.banks[bin];
        }
        break;
      }
    }

    setCardType(detectedType);
    setBankName(detectedBank);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      // Sadece rakamları al
      formattedValue = value.replace(/\D/g, '');
      
      // Kart tipine göre maksimum uzunluk kontrolü
      let maxLength = 16; // Varsayılan uzunluk
      if (cardType === 'amex') {
        maxLength = 15;
      } else if (cardType === 'troy') {
        maxLength = 16;
      }
      
      formattedValue = formattedValue.slice(0, maxLength);
      
      // Kart tipine göre boşluk formatı
      if (cardType === 'amex') {
        // American Express için 4-6-5 formatı
        formattedValue = formattedValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
      } else {
        // Diğer kartlar için 4-4-4-4 formatı
        formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
      }
      
      // Kart tipini belirle
      const numericValue = formattedValue.replace(/\s/g, '');
      let detectedType = null;
      let detectedBank = null;

      for (const [type, typeInfo] of Object.entries(CARD_TYPES)) {
        if (typeInfo.pattern.test(numericValue)) {
          detectedType = type;
          // İlk 6 haneye göre banka kontrolü
          const bin = numericValue.slice(0, 6);
          if (typeInfo.banks[bin]) {
            detectedBank = typeInfo.banks[bin];
          }
          break;
        }
      }

      setCardType(detectedType);
      setBankName(detectedBank);
    } 
    else if (name === 'expiryDate') {
      // Sadece rakamları al
      formattedValue = value.replace(/\D/g, '');
      
      // MM/YY formatına dönüştür
      if (formattedValue.length >= 2) {
        // Ay kontrolü (01-12)
        let month = formattedValue.slice(0, 2);
        if (month > 12) month = '12';
        if (month < 1) month = '01';
        
        formattedValue = month + (formattedValue.length > 2 ? '/' + formattedValue.slice(2, 4) : '');
      }
    }
    else if (name === 'cvv') {
      // Sadece rakamları al
      formattedValue = value.replace(/\D/g, '');
      
      // Kart tipine göre CVV uzunluğu
      const maxCvvLength = cardType === 'amex' ? 4 : 3;
      formattedValue = formattedValue.slice(0, maxCvvLength);
    }
    else if (name === 'cardName') {
      // Sadece harfleri ve boşlukları kabul et
      formattedValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleCvvFocus = () => {
    setIsCardFlipped(true);
  };

  const handleCvvBlur = () => {
    setIsCardFlipped(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!selectedAddress) {
        alert('Lütfen bir teslimat adresi seçin');
        return;
      }
      setStep(2);
    } else {
      // Burada ödeme işlemi gerçekleştirilecek
      alert('Siparişiniz başarıyla alındı!');
      navigate('/');
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const formatCardNumber = (number) => {
    return number || '•••• •••• •••• ••••';
  };

  const formatCardName = (name) => {
    return name || 'AD SOYAD';
  };

  const formatExpiryDate = (date) => {
    return date || 'AA/YY';
  };

  const handleViewCart = () => {
    setIsCartOpen(true);
  };

  // Adres ekleme formunu kapatma ve adresleri yenileme
  const handleAddressFormClose = async () => {
    setShowAddressForm(false);
    // Adresleri yeniden yükle
    try {
      const response = await fetch(`http://192.168.50.33:5000/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAddresses(data.data || []);
        // En son eklenen adresi seç
        const defaultAddress = data.data?.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-steps">
          <div className={`step ${step === 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-text">Teslimat Bilgileri</span>
          </div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-text">Ödeme Bilgileri</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {step === 1 ? (
            <div className="form-section">
              <h2>Teslimat Bilgileri</h2>
              
              {loading ? (
                <div className="loading">Adresler yükleniyor...</div>
              ) : addresses.length === 0 ? (
                <div className="no-address">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <p>Kayıtlı adresiniz bulunmamaktadır.</p>
                  <button
                    type="button"
                    className="add-address-button"
                    onClick={() => setShowAddressForm(true)}
                  >
                    Yeni Adres Ekle
                  </button>
                </div>
              ) : (
                <div className="address-selection">
                  <div className="address-list">
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="address-card-header">
                          <h3>
                            {address.title}
                            {address.isDefault && (
                              <span className="default-badge">Varsayılan</span>
                            )}
                          </h3>
                        </div>
                        <div className="address-card-content">
                          <p className="name">{address.firstName} {address.lastName}</p>
                          <p className="phone">{address.phone}</p>
                          <p className="address">
                            {address.addressText}<br />
                            {address.neighborhood} Mah. {address.district}/{address.city}<br />
                            {address.postalCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="add-address-button"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Yeni Adres Ekle
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="form-section">
              <h2>Ödeme Bilgileri</h2>
              
              <div className="credit-card-container">
                <div 
                  className={`credit-card ${isCardFlipped ? 'flipped' : ''}`}
                  data-bank={bankName}
                >
                  <div 
                    className="card-front"
                    data-type={cardType}
                  >
                    <div className="card-content">
                      <div className="card-number">
                        {formData.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="card-info">
                        <div className="card-holder">
                          {formData.cardName || 'AD SOYAD'}
                        </div>
                        <div className="card-expires">
                          {formData.expiryDate || 'AA/YY'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-back">
                    <div className="card-stripe"></div>
                    <div className="card-cvv">
                      {formData.cvv || '•••'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Kart Numarası</label>
                <div className="card-input">
                  <FontAwesomeIcon icon={faCreditCard} className="card-icon" />
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Son Kullanma Tarihi</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="AA/YY"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <div className="cvv-input">
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength="4"
                      onFocus={handleCvvFocus}
                      onBlur={handleCvvBlur}
                      required
                    />
                    <FontAwesomeIcon icon={faLock} className="cvv-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="order-summary">
            <h3>Sipariş Özeti</h3>
            <div className="order-items">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Adet: {item.quantity}</p>
                    <p className="item-price">{formatPrice(item.price * item.quantity)} TL</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Toplam:</span>
              <span>{formatPrice(getCartTotal())} TL</span>
            </div>
          </div>

          <div className="form-actions">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="back-button"
              >
                Geri
              </button>
            )}
            <div className="action-buttons">
              <button
                type="button"
                onClick={handleViewCart}
                className="view-cart-button"
              >
                Sepeti Görüntüle
              </button>
              <button type="submit" className="submit-button">
                {step === 1 ? 'Devam Et' : 'Siparişi Tamamla'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Adres Ekleme Modal */}
      {showAddressForm && (
        <div className="modal-overlay" onClick={() => setShowAddressForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <AddressForm 
              onClose={handleAddressFormClose}
              editingAddress={null}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout; 