import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faStar, 
    faPen, 
    faTrash, 
    faPhone, 
    faMapMarkerAlt,
    faCheckCircle,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import AddressForm from './AddressForm';
import '../styles/AddressList.css';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const showMessage = (title, text, icon) => {
        Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#3b82f6'
        });
    };

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token bulunamadı');
            }

            const response = await fetch('http://192.168.50.33:5000/api/addresses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Adresler getirilemedi');
            }

            const data = await response.json();
            if (data.success) {
                setAddresses(data.data);
            } else {
                throw new Error(data.message || 'Adresler yüklenirken bir hata oluştu');
            }
        } catch (error) {
            showMessage('Hata', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (addressId) => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: 'Bu adresi silmek istediğinizden emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://192.168.50.33:5000/api/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setAddresses(addresses.filter(address => address.id !== addressId));
                    showMessage('Başarılı', 'Adres başarıyla silindi', 'success');
                } else {
                    throw new Error(data.message || 'Adres silinirken bir hata oluştu');
                }
            } catch (error) {
                showMessage('Hata', error.message, 'error');
            }
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await fetch(`http://192.168.50.33:5000/api/addresses/${addressId}/set-default`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                await fetchAddresses();
                showMessage('Başarılı', 'Varsayılan adres güncellendi', 'success');
            } else {
                throw new Error(data.message || 'Varsayılan adres güncellenirken bir hata oluştu');
            }
        } catch (error) {
            showMessage('Hata', error.message, 'error');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    return (
        <div className="address-list-container">
            <div className="address-list-header">
                <h2>Adres Bilgilerim</h2>
                <button 
                    className="add-address-button"
                    onClick={() => setShowForm(true)}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Yeni Adres Ekle
                </button>
            </div>

            {loading ? (
                <div className="loading">Yükleniyor...</div>
            ) : addresses.length === 0 ? (
                <div className="no-address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '0.5rem' }} />
                    Henüz kayıtlı adresiniz bulunmamaktadır.
                </div>
            ) : (
                <div className="address-grid">
                    {addresses.map(address => (
                        <div key={address.id} className="address-card">
                            <div className="address-card-header">
                                <h3>
                                    {address.title}
                                    {address.isDefault && (
                                        <FontAwesomeIcon icon={faStar} className="default-star" style={{ marginLeft: '0.5rem' }} />
                                    )}
                                </h3>
                                <div className="address-actions">
                                    <button 
                                        className="action-button default-button"
                                        onClick={() => handleSetDefault(address.id)}
                                        disabled={address.isDefault}
                                        title={address.isDefault ? 'Varsayılan Adres' : 'Varsayılan Yap'}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faStar}
                                            className={address.isDefault ? 'default-star' : ''}
                                        />
                                    </button>
                                    <button 
                                        className="action-button edit-button"
                                        onClick={() => {
                                            setEditingAddress(address);
                                            setShowForm(true);
                                        }}
                                        title="Düzenle"
                                    >
                                        <FontAwesomeIcon icon={faPen} />
                                    </button>
                                    <button 
                                        className="action-button delete-button"
                                        onClick={() => handleDelete(address.id)}
                                        title="Sil"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                            <div className="address-card-content">
                                <p className="name">{address.firstName} {address.lastName}</p>
                                <p className="phone">
                                    <FontAwesomeIcon icon={faPhone} />
                                    {address.phone}
                                </p>
                                <p className="address">
                                    {address.addressText}<br />
                                    {address.neighborhood} Mah. {address.district}/{address.city}<br />
                                    {address.postalCode}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" onClick={handleFormClose}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <AddressForm 
                            onClose={handleFormClose}
                            editingAddress={editingAddress}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressList; 