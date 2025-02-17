import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faExclamationTriangle,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../styles/AddressForm.css';
import Swal from 'sweetalert2';

const AddressForm = ({ onClose, editingAddress }) => {
    const [formData, setFormData] = useState({
        addressTitle: '',
        firstName: '',
        lastName: '',
        phone: '',
        province: '',
        district: '',
        neighborhood: '',
        postalCode: '',
        addressText: '',
        isDefault: false
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    // İlleri getir
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://192.168.50.33:5000/api/locations/provinces');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'İller yüklenirken bir hata oluştu');
                }

                if (!data.success) {
                    throw new Error(data.message);
                }

                setProvinces(data.data);
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: error.message
                });
            }
        };

        fetchProvinces();
    }, []);

    // Düzenleme modunda ise mevcut adresi yükle
    useEffect(() => {
        if (editingAddress) {
            setFormData({
                addressTitle: editingAddress.title || '',
                firstName: editingAddress.firstName || '',
                lastName: editingAddress.lastName || '',
                phone: editingAddress.phone || '',
                province: editingAddress.city || '',
                district: editingAddress.district || '',
                neighborhood: editingAddress.neighborhood || '',
                postalCode: editingAddress.postalCode || '',
                addressText: editingAddress.addressText || '',
                isDefault: editingAddress.isDefault || false
            });

            // İlçe ve mahalleleri yükle
            if (editingAddress.city) {
                const province = provinces.find(p => p.name === editingAddress.city);
                if (province) {
                    fetchDistricts(province.id).then(() => {
                        if (editingAddress.district) {
                            const district = districts.find(d => d.name === editingAddress.district);
                            if (district) {
                                fetchNeighborhoods(district.id);
                            }
                        }
                    });
                }
            }
        }
    }, [editingAddress, provinces]);

    // İlçeleri getir
    const fetchDistricts = async (provinceId) => {
        if (!provinceId) return;
        
        setLoadingDistricts(true);
        setDistricts([]);

        try {
            const response = await fetch(`http://192.168.50.33:5000/api/locations/districts/${provinceId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'İlçeler yüklenirken bir hata oluştu');
            }

            if (!data.success) {
                throw new Error(data.message);
            }

            setDistricts(data.data);
            return data.data; // Veriyi döndür
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'İlçeler yüklenirken bir hata oluştu: ' + error.message
            });
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // Mahalleleri getir
    const fetchNeighborhoods = async (districtId) => {
        if (!districtId) return;
        
        setLoadingNeighborhoods(true);
        setNeighborhoods([]);

        try {
            const response = await fetch(`http://192.168.50.33:5000/api/locations/neighborhoods/${districtId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Mahalleler yüklenirken bir hata oluştu');
            }

            if (!data.success) {
                throw new Error(data.message);
            }

            setNeighborhoods(data.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message
            });
            setNeighborhoods([]);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    // Form değişikliklerini işle
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        // Telefon numarası için özel kontrol
        if (name === 'phone') {
            // Sadece rakamları al
            const numbersOnly = value.replace(/[^0-9]/g, '');
            // Maksimum 11 karakter (0 ile başlayan 11 haneli telefon numarası)
            if (numbersOnly.length <= 11) {
                // Telefon numarası formatı: 0(5XX) XXX XX XX
                let formattedNumber = numbersOnly;
                if (numbersOnly.length >= 4) {
                    formattedNumber = `${numbersOnly.slice(0, 4)}${numbersOnly.slice(4)}`;
                }
                setFormData(prev => ({
                    ...prev,
                    [name]: formattedNumber
                }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (name === 'province') {
            setFormData(prev => ({
                ...prev,
                district: '',
                neighborhood: '',
                postalCode: ''
            }));
            
            const province = provinces.find(p => p.name === value);
            if (province) {
                fetchDistricts(province.id);
            }
        } else if (name === 'district') {
            setFormData(prev => ({
                ...prev,
                neighborhood: '',
                postalCode: ''
            }));
            
            const district = districts.find(d => d.name === value);
            if (district) {
                fetchNeighborhoods(district.id);
            }
        } else if (name === 'neighborhood') {
            const selectedNeighborhood = neighborhoods.find(n => n.name === value);
            if (selectedNeighborhood && selectedNeighborhood.postalCode) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    postalCode: selectedNeighborhood.postalCode
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        }
    };

    const showMessage = (title, text, icon) => {
        return Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#3b82f6'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingAddress
                ? `http://192.168.50.33:5000/api/addresses/${editingAddress.id}`
                : 'http://192.168.50.33:5000/api/addresses';

            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    addressTitle: formData.addressTitle,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    city: formData.province,
                    district: formData.district,
                    neighborhood: formData.neighborhood,
                    postalCode: formData.postalCode,
                    addressText: formData.addressText,
                    isDefault: formData.isDefault
                })
            });

            const data = await response.json();

            if (response.ok) {
                await showMessage(
                    'Başarılı',
                    editingAddress 
                        ? 'Adres başarıyla güncellendi'
                        : 'Yeni adres başarıyla eklendi',
                    'success'
                );
                onClose();
            } else {
                throw new Error(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            showMessage('Hata', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="address-form">
            <div className="form-header">
                <h2>{editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>
                <button className="close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {message.type && (
                <div className={`${message.type}-message`}>
                    <FontAwesomeIcon 
                        icon={message.type === 'success' ? faCheck : faExclamationTriangle} 
                    />
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="addressTitle">Adres Başlığı</label>
                    <input
                        type="text"
                        id="addressTitle"
                        name="addressTitle"
                        value={formData.addressTitle}
                        onChange={handleChange}
                        placeholder="Örn: Ev, İş"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">Ad</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Soyad</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="05XX XXX XX XX"
                        maxLength="11"
                        pattern="[0-9]*"
                        required
                    />
                    <small className="input-info">Örnek: 05XX XXX XX XX</small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="province">İl</label>
                        <select
                            id="province"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                        >
                            <option value="">İl seçiniz</option>
                            {provinces.map(province => (
                                <option 
                                    key={province.id} 
                                    value={province.name}
                                >
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="district">İlçe</label>
                        <select
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            disabled={!formData.province || loadingDistricts}
                            required
                        >
                            <option value="">İlçe seçiniz</option>
                            {districts.map(district => (
                                <option 
                                    key={district.id} 
                                    value={district.name}
                                >
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="neighborhood">Mahalle</label>
                        <select
                            id="neighborhood"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleChange}
                            disabled={!formData.district || loadingNeighborhoods}
                            required
                        >
                            <option value="">Mahalle seçiniz</option>
                            {neighborhoods.map(neighborhood => (
                                <option 
                                    key={neighborhood.id} 
                                    value={neighborhood.name}
                                >
                                    {neighborhood.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postalCode">Posta Kodu</label>
                        <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="addressText">Açık Adres</label>
                    <textarea
                        id="addressText"
                        name="addressText"
                        value={formData.addressText}
                        onChange={handleChange}
                        rows="3"
                        required
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                        />
                        Varsayılan adres olarak kaydet
                    </label>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={onClose}
                    >
                        İptal
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Kaydediliyor...' : (editingAddress ? 'Güncelle' : 'Kaydet')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm; 