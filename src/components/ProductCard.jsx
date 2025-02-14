import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faStar as faStarSolid,
  faStarHalfAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { useCart } from '../context/CartContext';
import ProductDetail from './ProductDetail';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showDetail, setShowDetail] = useState(false);

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return formatPrice(price * (1 - discount / 100));
  };

  const handleAddToCart = () => {
    addToCart(product);
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

  return (
    <>
      <div className="product-card" onClick={() => setShowDetail(true)}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          {product.isNew && <span className="new-tag">Yeni</span>}
          {product.discount && <span className="discount-tag">-{product.discount}%</span>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            <div className="stars">
              {renderStars(averageRating)}
            </div>
            <span className="rating-count">
              ({product.reviews?.length || 0} değerlendirme)
            </span>
          </div>
          <p className="product-description">{product.description}</p>
          <div className="product-price">
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
          <button 
            className="add-to-cart" 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            <span>Sepete Ekle</span>
          </button>
        </div>
      </div>

      {showDetail && (
        <ProductDetail 
          product={product} 
          onClose={() => setShowDetail(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard; 