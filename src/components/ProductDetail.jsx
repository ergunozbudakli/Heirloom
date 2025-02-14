import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faStar as faStarSolid,
  faStarHalfAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import '../styles/ProductDetail.css';

const ProductDetail = ({ product, onClose, onAddToCart }) => {
  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return formatPrice(price * (1 - discount / 100));
  };

  const calculateAverageRating = () => {
    if (!product.reviews?.length) return 0;
    const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / product.reviews.length;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarSolid} className="star-filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="star-filled" />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStarRegular} className="star-empty" />);
      }
    }

    return stars;
  };

  const averageRating = calculateAverageRating();

  // Detaylı açıklamayı satırlara böl
  const descriptionLines = product.detailedDescription?.split('\n').filter(line => line.trim());

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="detail-content">
          <div className="detail-image">
            <img src={product.image} alt={product.name} />
            {product.isNew && <span className="new-tag">Yeni</span>}
            {product.discount && <span className="discount-tag">-{product.discount}%</span>}
          </div>
          
          <div className="detail-info">
            <h2 className="detail-name">{product.name}</h2>
            
            <div className="detail-rating">
              <div className="stars">
                {renderStars(averageRating)}
              </div>
              <span className="rating-count">
                ({product.reviews?.length || 0} değerlendirme)
              </span>
            </div>
            
            <div className="detail-price">
              {product.discount ? (
                <>
                  <span className="original-price">{formatPrice(product.price)} TL</span>
                  <span className="discounted-price">
                    {calculateDiscountedPrice(product.price, product.discount)} TL
                  </span>
                </>
              ) : (
                <span className="price">{formatPrice(product.price)} TL</span>
              )}
            </div>
            
            <div className="detail-description">
              <h3>Ürün Açıklaması</h3>
              {descriptionLines?.map((line, index) => (
                <p key={index} className="description-line">{line}</p>
              ))}
            </div>
            
            {product.specifications && (
              <div className="detail-specifications">
                <h3>Özellikler</h3>
                <ul>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button className="add-to-cart" onClick={onAddToCart}>
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>Sepete Ekle</span>
            </button>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <div className="detail-reviews">
            <h3>Değerlendirmeler</h3>
            <div className="reviews-list">
              {product.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-author">{review.user}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 