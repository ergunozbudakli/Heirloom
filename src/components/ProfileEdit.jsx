import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faCheck, 
    faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfileEdit.css';

const ProfileEdit = () => {
    const { updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Kullanıcı bilgilerini yükle
    useEffect(() => {
        const loadUserData = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;

            const userData = JSON.parse(userStr);
            console.log('Kullanıcı bilgileri yükleniyor:', userData);
            
            const newFormData = {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || ''
            };
            
            console.log('Form verisi güncelleniyor:', newFormData);
            setFormData(newFormData);
        };

        loadUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://192.168.50.33:5000/api/users/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                updateUser(data);
                setMessage({
                    type: 'success',
                    text: 'Profil bilgileriniz başarıyla güncellendi!'
                });
                localStorage.setItem('user', JSON.stringify(data));
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Profil güncellenirken bir hata oluştu'
                });
            }
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            setMessage({
                type: 'error',
                text: 'Sunucu ile bağlantı kurulamadı'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-edit-container">
            <div className="form-header">
                <FontAwesomeIcon icon={faUser} className="form-header-icon" />
                <h2 className="form-section-title">Profil Bilgilerini Düzenle</h2>
            </div>

            <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-group">
                    <label htmlFor="name">Ad Soyad</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ad Soyad giriniz"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">E-posta</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="E-posta adresinizi giriniz"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Telefon numaranızı giriniz"
                    />
                </div>

                {message.type && (
                    <div className={`${message.type}-message`}>
                        <FontAwesomeIcon 
                            icon={message.type === 'success' ? faCheck : faExclamationTriangle} 
                        />
                        {message.text}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="update-button"
                    disabled={loading}
                >
                    {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
                </button>
            </form>
        </div>
    );
};

export default ProfileEdit; 