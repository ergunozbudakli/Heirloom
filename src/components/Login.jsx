import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://192.168.50.33:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Kullanıcı bilgilerini düzenle
        const userData = {
          ...data.user,
          name: data.user.name || `${data.user.firstName} ${data.user.lastName}`,
        };

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        
        // AuthContext'e kullanıcı bilgilerini kaydet
        login(userData);
        
        // Ana sayfaya yönlendir
        navigate('/');
      } else {
        setError(data.message || 'Giriş yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Sunucu ile bağlantı kurulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>Üye Girişi</h1>
        <p className="login-subtitle">Hesabınıza giriş yapın</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Şifre</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="form-actions">
            <div className="remember-forgot">
              <label className="remember-me">
                <input type="checkbox" /> Beni hatırla
              </label>
              <a href="/forgot-password" className="forgot-password">
                Şifremi unuttum
              </a>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            Giriş Yap
          </button>

          <p className="register-link">
            Hesabınız yok mu? <a href="/register">Üye olun</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login; 