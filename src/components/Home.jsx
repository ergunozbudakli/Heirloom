import React, { useRef, useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';
import '../styles/Home.css';
import heirloomLogo from '../assets/images/heirloomlogo.png';

const Home = () => {
  const sections = ['hero', 'products', 'features'];
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [allowScroll, setAllowScroll] = useState(true);

  const heroRef = useRef(null);
  const productsRef = useRef(null);
  const featuresRef = useRef(null);

  const sectionRefs = {
    hero: heroRef,
    products: productsRef,
    features: featuresRef
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (currentSection === 1) {
      setAllowScroll(true);
      const productsSection = productsRef.current;
      if (!productsSection) return;

      const scrollTop = Math.ceil(productsSection.scrollTop);
      const scrollHeight = productsSection.scrollHeight;
      const clientHeight = productsSection.clientHeight;
      
      if (scrollTop > 0 && scrollTop + clientHeight < scrollHeight) {
        setAllowScroll(false);
      }
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !allowScroll) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (!isSwipe || isScrolling) return;

    // Ürünler bölümündeyken scroll kontrolü
    if (currentSection === 1) {
      const productsSection = productsRef.current;
      if (!productsSection) return;

      const scrollTop = Math.ceil(productsSection.scrollTop);
      const scrollHeight = productsSection.scrollHeight;
      const clientHeight = productsSection.clientHeight;
      
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((distance < 0 && !isAtTop) || (distance > 0 && !isAtBottom)) {
        return;
      }
    }
    
    setIsScrolling(true);
    
    if (distance > 0 && currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      sectionRefs[sections[currentSection + 1]].current?.scrollIntoView({ behavior: 'smooth' });
    } else if (distance < 0 && currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      sectionRefs[sections[currentSection - 1]].current?.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (currentSection === 1) {
        const productsSection = productsRef.current;
        if (!productsSection) return;

        const scrollTop = Math.ceil(productsSection.scrollTop);
        const scrollHeight = productsSection.scrollHeight;
        const clientHeight = productsSection.clientHeight;
        
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
          return;
        }
      }

      e.preventDefault();
      
      if (isScrolling) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        sectionRefs[sections[currentSection + 1]].current?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
        sectionRefs[sections[currentSection - 1]].current?.scrollIntoView({ behavior: 'smooth' });
      }

      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSection, isScrolling]);

  return (
    <div className="home" 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <img src={heirloomLogo} alt="Heirloom" className="hero-logo" />
          <div className="hero-subtitle">El Yapımı Lüks Mumlar</div>
        </div>
      </section>

      <section className="products-section" ref={productsRef}>
        <div className="section-header mobile-only">
          <h2>Ürünlerimiz</h2>
          <p>Özenle seçilmiş kokular, el yapımı özel tasarımlar</p>
        </div>
        <div className="products-container">
          <div className="section-header desktop-only">
            <h2>Ürünlerimiz</h2>
            <p>Özenle seçilmiş kokular, el yapımı özel tasarımlar</p>
          </div>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-grid-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section" ref={featuresRef}>
        <div className="features-grid">
          <div className="feature">
            <h3>%100 Doğal</h3>
            <p>Tamamen doğal malzemelerden üretilmiştir</p>
          </div>
          <div className="feature">
            <h3>El Yapımı</h3>
            <p>Her bir mum özenle elde üretilmektedir</p>
          </div>
          <div className="feature">
            <h3>Uzun Ömürlü</h3>
            <p>Ortalama 40-50 saat yanma süresi</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 