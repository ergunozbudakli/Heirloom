import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Sayfa yüklendiğinde sepeti yükle
  useEffect(() => {
    loadCart();
  }, [user]); // user değiştiğinde sepeti yeniden yükle

  // Sepeti yükle (localStorage veya veritabanından)
  const loadCart = async () => {
    try {
      if (user) {
        // Kullanıcı girişi varsa veritabanından sepeti çek
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/cart/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            setCart(Array.isArray(data.cart) ? data.cart : []);
          }
        } else {
          // API hatası durumunda localStorage'dan yükle
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } else {
        // Kullanıcı girişi yoksa localStorage'dan yükle
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      // Hata durumunda localStorage'dan yükle
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  };

  // Sepeti kaydet (localStorage ve veritabanına)
  const saveCart = async (newCart) => {
    try {
      // Her durumda localStorage'a kaydet
      localStorage.setItem('cart', JSON.stringify(newCart));

      if (user) {
        // Kullanıcı girişi varsa veritabanına da kaydet
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/cart/${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cart: newCart })
        });

        if (!response.ok) {
          console.error('Sepet veritabanına kaydedilemedi');
        }
      }
    } catch (error) {
      console.error('Sepet kaydedilirken hata:', error);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      
      const newCart = existingProduct
        ? prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];

      saveCart(newCart);
      return newCart;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      saveCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('cart');
    
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/cart/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Sepet temizlenirken hata:', error);
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toggleCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 