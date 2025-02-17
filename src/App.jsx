import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Checkout from './components/Checkout';
import Register from './components/Register';
import Login from './components/Login';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import ProfileEdit from './components/ProfileEdit';
import AddressList from './components/AddressList';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
            <Route path="/addresses" element={<PrivateRoute><AddressList /></PrivateRoute>} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
