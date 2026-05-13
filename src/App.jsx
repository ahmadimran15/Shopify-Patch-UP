import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, ChevronDown, ChevronUp, ArrowRight, ShoppingCart, Menu, Trash2, Plus, Minus, Image as ImageIcon, Info, LayoutDashboard, Tag, LogOut, Package, RefreshCcw, X, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, MoreVertical, Eye, CreditCard, Bell, Check, BarChart2, TrendingUp, Calendar, DollarSign, Layers } from 'lucide-react';
import { supabase } from './supabase';

// --- Shared Components --- //

const NotificationToast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-toast ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <ChevronDown size={16} strokeWidth={2} />
      </div>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

// --- Cart Page Component --- //

const CartPage = ({ cart, onUpdateQty, onRemove, onNavigate, productInfo }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-page-bg">
      <div className="cart-mobile-wrap">

        {/* Header */}
        <div className="cart-header">
          <h1>Cart</h1>
          <div className="cart-count-bubble">{totalQty}</div>
        </div>

        {cart.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 20px'}}>
            <p style={{marginBottom:'20px', color:'#666'}}>Your cart is empty</p>
            <button className="cart-checkout-btn" onClick={() => onNavigate('home')}>Continue shopping</button>
          </div>
        ) : (
          <>
            {/* Cart Items Card */}
            <div className="cart-items-card">
              {cart.map((item, index) => (
                <div className="cart-item-row" key={index}>
                  <div className="cart-item-img">
                    <img src={item.imageUrls?.[0] || '/product.png'} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">
                      {item.name}
                      <span className="cart-item-bundle"> ({item.bundleName})</span>
                    </div>
                    {item.compareAtPrice > item.price && (
                      <div className="cart-item-save">
                        Save {Math.round((1 - item.price / item.compareAtPrice) * 100)}%
                      </div>
                    )}
                    <div className="cart-item-prices">
                      <span className="cart-item-price">Rs.{item.price.toFixed(2)}</span>
                      {item.compareAtPrice > item.price && (
                        <span className="cart-item-compare">Rs.{item.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="cart-item-bottom">
                      <div className="qty-selector">
                        <button className="qty-btn" onClick={() => onUpdateQty(index, -1)}><Minus size={13}/></button>
                        <span className="qty-input">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => onUpdateQty(index, 1)}><Plus size={13}/></button>
                      </div>
                      <button className="cart-item-remove" onClick={() => onRemove(index)}><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <div className="cart-item-total">Rs.{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Discount Row */}
            <div className="cart-discount-row">
              <span>Discount</span>
              <Plus size={16} />
            </div>

            {/* Summary */}
            <div className="cart-summary-card">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Estimated total</span>
                <span className="cart-summary-value">Rs.{subtotal.toFixed(2)} PKR</span>
              </div>
              <div className="cart-summary-note">Taxes and shipping calculated at checkout.</div>
              <button className="cart-checkout-btn" onClick={() => onNavigate('checkout')}>Check out</button>
            </div>

            {/* You may also like */}
            <div className="cart-upsell">
              <h3 className="cart-upsell-title">You may also like</h3>
              <div className="cart-upsell-card" onClick={() => onNavigate('product')}>
                <div className="cart-upsell-img">
                  <img src={productInfo?.imageUrls?.[0] || '/product.png'} alt="Product" />
                  <div className="cart-upsell-badge">Sale</div>
                  <div className="cart-upsell-cart-btn"><ShoppingCart size={14} color="#fff" /></div>
                </div>
                <div className="cart-upsell-name">{productInfo?.name || '30 Day Acne Emergency Kit'}</div>
                <div className="cart-upsell-prices">
                  <span>Rs.{productInfo?.price?.toFixed(2)}</span>
                  <span className="cart-upsell-compare">Rs.{productInfo?.compareAtPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


// --- Product Page Components --- //

const BundleOption = ({ count, price, originalPrice, savings, badge, badgeType, selected, onSelect }) => {
  return (
    <div 
      className={`bpo-option ${selected ? 'bpo-option--active' : ''}`}
      onClick={onSelect}
    >
      {badge && <div className={`bpo-badge ${badgeType === 'best' ? 'yellow' : ''}`}>{badge}</div>}
      
      <div className="bpo-radio">
        {selected && <div style={{width: '6px', height: '6px', background: '#fff', borderRadius: '50%'}}></div>}
      </div>
      
      <div className="bpo-qty-tag">× {count}</div>
      
      <div className="bpo-info">
        <div className="bpo-info-top">
          Buy {count} 
          {savings && <span className={`bpo-save-pill ${badgeType === 'best' ? 'yellow' : ''}`}>Save {savings}</span>}
        </div>
        <div className="bpo-info-sub">
          {count === 1 ? 'Single pack' : `You save Rs.${(originalPrice - price).toFixed(2)}`}
        </div>
      </div>
      
      <div className="bpo-prices">
        {originalPrice > price && <div className="bpo-price-old">Rs.{originalPrice.toFixed(2)}</div>}
        <div className={`bpo-price-new ${originalPrice > price ? 'red' : ''}`}>Rs.{price.toFixed(2)}</div>
      </div>
    </div>
  );
};

const ProductPage = ({ onAddToCart, productInfo }) => {
  const [selectedBundle, setSelectedBundle] = useState(2);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mobileTrackRef = useRef(null);
  
  const images = productInfo.imageUrls?.length > 0 ? productInfo.imageUrls : ["/product.png"];

  const bundles = [
    { id: 1, count: 1, name: "Single Pack", price: productInfo.price, originalPrice: productInfo.compareAtPrice, savings: null },
    { id: 2, count: 2, name: "Buy 2", price: productInfo.price * 2 * 0.9, originalPrice: productInfo.price * 2, savings: '22%', badge: 'POPULAR' },
    { id: 3, count: 3, name: "Buy 3", price: productInfo.price * 3 * 0.8, originalPrice: productInfo.price * 3, savings: '33%', badge: 'BEST VALUE', badgeType: 'best' },
  ];

  const currentBundle = bundles.find(b => b.id === selectedBundle);

  // Synchronize mobile scroll with active index
  useEffect(() => {
    if (mobileTrackRef.current) {
      const container = mobileTrackRef.current;
      const scrollPos = activeImageIndex * container.offsetWidth;
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [activeImageIndex]);

  const handleMobileScroll = (e) => {
    const container = e.target;
    const scrollPos = container.scrollLeft;
    const index = Math.round(scrollPos / container.offsetWidth);
    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div>
      <main className="product-split">
        <div className="product-media-container">
          {/* Desktop Slider */}
          <div className="desktop-gallery-container">
            <div className="gallery-main">
              <button className="gallery-nav-btn prev" onClick={handlePrevImage}><ChevronLeft size={24} /></button>
              <div className="gallery-main-image">
                <img src={images[activeImageIndex]} alt={`Product image ${activeImageIndex + 1}`} />
              </div>
              <button className="gallery-nav-btn next" onClick={handleNextImage}><ChevronRight size={24} /></button>
            </div>
            <div className="gallery-thumbnails">
              {images.map((url, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-item ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - slider with arrows, thumbnails and TOUCH swipe support */}
          <section className="mobile-gallery-wrapper">
            <div className="mobile-gallery-main">
              <button className="mobile-gallery-nav prev" onClick={handlePrevImage}><ChevronLeft size={20} /></button>
              
              <div className="mobile-gallery-track" ref={mobileTrackRef} onScroll={handleMobileScroll}>
                {images.map((url, idx) => (
                  <div key={idx} className="mobile-slide-item">
                    <img src={url} alt={`Product ${idx + 1}`} />
                  </div>
                ))}
              </div>

              <button className="mobile-gallery-nav next" onClick={handleNextImage}><ChevronRight size={20} /></button>
            </div>
            
            <div className="mobile-gallery-thumbs">
              {images.map((url, idx) => (
                <div 
                  key={idx} 
                  className={`mobile-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="product-split__info">
          <h1 className="product-title">{productInfo.name || "30 Day Acne Emergency Kit"}</h1>
          
          <div className="product-price-row">
            <span className="product-price">Rs.{productInfo.price.toFixed(2)}</span>
            <span className="product-price-compare">Rs.{productInfo.compareAtPrice.toFixed(2)}</span>
          </div>

          <div className="bpo-wrapper">
            <div className="bpo-top-tag">🔥 BUNDLE & SAVE</div>
            <div className="bpo-header">Buy More, Save More</div>
            
            <div>
              {bundles.map(bundle => (
                <BundleOption 
                  key={bundle.id}
                  {...bundle}
                  selected={selectedBundle === bundle.id}
                  onSelect={() => setSelectedBundle(bundle.id)}
                />
              ))}
            </div>

            <button className="bpo-add-btn" onClick={() => onAddToCart(currentBundle)}>
              <ShoppingCart size={20} />
              <span style={{flex: 1, textAlign: 'center'}}>Add to Cart</span>
              <span className="bpo-add-btn-price">Rs.{currentBundle.price.toFixed(2)}</span>
            </button>
          </div>

          <p className="product-desc-text">
            Our 36-count hydrocolloid pimple patches deliver fast, effective blemish relief with advanced technology that draws out impurities and flattens spots overnight. Perfect for acne emergencies, these patches work discreetly under makeup or while you sleep. Choose our 2 or 3 packs bundle option and save up to 33% on products plus shipping. Get clearer skin without the wait.
          </p>
        </section>
      </main>

      {/* Customer Results Section — Mobile Only */}
      <section className="customer-results-section">
        {/* Video Placeholder */}
        <div className="video-placeholder">
          <div className="video-placeholder__inner">
            <div className="video-play-btn">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <p className="video-placeholder__label">📹 Your Video Goes Here</p>
          </div>
        </div>

        {/* Results image with badge */}
        <div className="results-image-wrap">
          <img src="/product.png" alt="Customer Results" className="results-image" />
          <div className="results-badge-top">FIX YOUR PIMPLE TONIGHT!</div>
          <div className="results-badge-bottom">33% OFF LIMITED OFFER 🧊</div>
        </div>

        <p className="results-caption">See our Customers Results — Real Results, Real Skin ✨</p>
      </section>
    </div>
  );
};

// --- Home Page Component --- //

const HomePage = ({ onNavigate, productInfo }) => {
  return (
    <div>
      <section className="hero">
        <img src="/hero.png" alt="Hero" />
        <h2>Fix Pimples While You Sleep</h2>
      </section>

      <section className="products-section page-width">
        <h3>Products</h3>
        
        <div className="product-grid">
          <div className="product-card" onClick={() => onNavigate('product')}>
            <div className="product-card__image-container">
              <img src={productInfo.imageUrls?.[0] || "/product.png"} alt="Product" />
              <div className="product-card__badge">Sale</div>
              <div className="product-card__mobile-cart-btn">
                <ShoppingCart size={16} color="#fff" />
              </div>
            </div>
            <div className="product-card__title">{productInfo.name || "30 Day Acne Emergency Kit"}</div>
            <div className="product-card__price-row">
              <span className="product-card__price">Rs.{productInfo.price.toFixed(2)}</span>
              <span className="product-card__price-compare">Rs.{productInfo.compareAtPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section page-width">
        <h3>Frequently asked questions</h3>
        <FAQItem 
          question="How do I use the pimple patch?"
          answer="1. Clean and completely dry the affected area. 2. Apply the patch directly over the pimple and press gently. 3. Leave it on for 6–8 hours (or overnight), then remove."
        />
        <FAQItem 
          question="What is the return policy?"
          answer="Our goal is for every customer to be totally satisfied with their purchase. If this isn't the case, let us know and we'll do our best to work with you to make it right."
        />
        <FAQItem 
          question="When will I get my order?"
          answer="Orders are dispatched within 1–2 business days. Delivery typically takes 3–5 business days depending on your location."
        />
        <FAQItem 
          question="Where are your products manufactured?"
          answer="Our pimple patches are made from premium medical-grade hydrocolloid and are manufactured under strict quality standards."
        />
        <FAQItem 
          question="How much does shipping cost?"
          answer="Shipping is a flat Rs.250 across all orders. Free shipping may be available on promotional bundles."
        />
      </section>

      <section className="testimonial-section">
        <blockquote className="testimonial-quote">
          "Small patch. Big difference. Handle breakouts quietly, confidently, overnight."
        </blockquote>
        <button className="testimonial-cta" onClick={() => onNavigate('product')}>Shop now</button>
      </section>
    </div>
  );
};

// --- Thank You Page Component --- //

const ThankYouPage = ({ order, onNavigate }) => {
  if (!order) return null;

  return (
    <div className="thank-you-bg">
      <div className="page-width thank-you-container">
        <div className="thank-you-card">
          <div className="thank-you-header">
            <div className="success-icon">
              <CheckCircle2 size={48} color="var(--cyan)" />
            </div>
            <h1>Thank you, {order.first_name}!</h1>
            <p className="order-number">Order #PU-{order.id.toString().slice(-6).toUpperCase()}</p>
          </div>

          <div className="thank-you-body">
            <div className="thank-you-section">
              <h3>Your order is confirmed</h3>
              <p>We've received your order and we'll notify you as soon as it ships.</p>
            </div>

            <div className="thank-you-info-grid">
              <div className="info-box">
                <h4>Contact information</h4>
                <p>{order.customer_email}</p>
              </div>
              <div className="info-box">
                <h4>Shipping address</h4>
                <p>{order.first_name} {order.last_name}</p>
                <p>{order.address}</p>
                <p>{order.city}, {order.postal_code}</p>
                <p>Pakistan</p>
                <p>{order.customer_phone}</p>
              </div>
              <div className="info-box">
                <h4>Shipping method</h4>
                <p>Standard Delivery (Rs. 250.00)</p>
              </div>
              <div className="info-box">
                <h4>Payment method</h4>
                <p>Cash on Delivery (COD)</p>
              </div>
            </div>

            <button className="continue-btn" onClick={() => onNavigate('home')}>
              Continue shopping
            </button>
          </div>
        </div>

        <div className="thank-you-footer">
          <p>Need help? <a href="#">Contact us</a></p>
        </div>
      </div>
    </div>
  );
};


// --- Checkout Page Component --- //

const CheckoutPage = ({ onNavigate, cart, onClearCart, onSuccess, onShowToast }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 250;
  const total = subtotal + shipping;
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: '+92',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    billingSame: true,
    billingFirstName: '',
    billingLastName: '',
    billingEmail: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingPhone: '+92',
  });

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    // Sanitize phone inputs to numbers only (+ prefix allowed)
    if (name === 'phone' || name === 'billingPhone') {
      const prefix = value.startsWith('+') ? '+' : '';
      const numbers = value.replace(/\D/g, '');
      value = prefix + numbers;
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validation for Shipping
    if (!formData.phone.startsWith('+92')) {
      onShowToast('Phone number must start with +92', 'error');
      return;
    }
    if (formData.phone.length < 13) {
      onShowToast('Please enter a complete phone number (+92 XXX XXXXXXX)', 'error');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      onShowToast('Please enter a valid email address', 'error');
      return;
    }

    // Validation for Billing (if different)
    if (!formData.billingSame) {
      if (!formData.billingPhone.startsWith('+92')) {
        onShowToast('Billing phone number must start with +92', 'error');
        return;
      }
      if (formData.billingPhone.length < 13) {
        onShowToast('Please enter a complete billing phone number', 'error');
        return;
      }
      if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
        onShowToast('Please enter a valid billing email address', 'error');
        return;
      }
    }

    setIsProcessing(true);

    const orderData = {
      customer_email: formData.email,
      customer_phone: formData.phone,
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postalCode,
      items: cart,
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      status: 'pending',
      billing_same_as_shipping: formData.billingSame,
      billing_first_name: formData.billingSame ? formData.firstName : formData.billingFirstName,
      billing_last_name: formData.billingSame ? formData.lastName : formData.billingLastName,
      billing_email: formData.billingSame ? formData.email : formData.billingEmail,
      billing_address: formData.billingSame ? formData.address : formData.billingAddress,
      billing_city: formData.billingSame ? formData.city : formData.billingCity,
      billing_postal_code: formData.billingSame ? formData.postalCode : formData.billingPostalCode,
      billing_phone: formData.billingSame ? formData.phone : formData.billingPhone,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (!error && data && data.length > 0) {
      // --- Deduct Inventory ---
      // Each cart item has: bundleId (1=buy1, 2=buy2, 3=buy3), quantity (how many times added)
      // Units deducted = bundleCount * quantity
      const bundleCountMap = { 1: 1, 2: 2, 3: 3 };
      const totalUnitsOrdered = cart.reduce((sum, item) => {
        const unitsPerBundle = bundleCountMap[item.bundleId] || 1;
        return sum + (unitsPerBundle * item.quantity);
      }, 0);

      if (totalUnitsOrdered > 0) {
        // Fetch current stock first, then decrement
        const { data: prodData } = await supabase.from('products').select('stock').eq('id', 1).single();
        if (prodData) {
          const newStock = Math.max(0, (prodData.stock || 0) - totalUnitsOrdered);
          await supabase.from('products').update({ stock: newStock }).eq('id', 1);
        }
      }
      // --- End Inventory Deduction ---

      if (onSuccess) onSuccess(data[0]);
      onClearCart();
      onNavigate('thank-you');
    } else {
      onShowToast('Error placing order: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  return (
    <div className="checkout-layout">
      <header className="checkout-header">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="checkout-logo">
          Patch Up
        </a>
      </header>
      
      <form onSubmit={handleCompleteOrder} className="checkout-content">
        <div className="checkout-left">
          <section className="checkout-section">
            <div className="checkout-section-header">
              <h2>Contact</h2>
            </div>
            <div className="checkout-input-group">
              <input 
                type="text" 
                name="phone"
                placeholder="Phone number (+92 ...)" 
                className="checkout-input" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          <section className="checkout-section">
            <h2>Delivery</h2>
            <div className="checkout-input-group">
              <input 
                type="email" 
                name="email"
                placeholder="Email (optional)" 
                className="checkout-input" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="checkout-input-group">
              <select className="checkout-input" disabled>
                <option>Pakistan</option>
              </select>
            </div>
            <div className="checkout-row">
              <input 
                type="text" 
                name="firstName"
                placeholder="First name" 
                className="checkout-input" 
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                name="lastName"
                placeholder="Last name" 
                className="checkout-input" 
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="checkout-input-group">
              <input 
                type="text" 
                name="address"
                placeholder="Address" 
                className="checkout-input" 
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="checkout-row">
              <input 
                type="text" 
                name="city"
                placeholder="City" 
                className="checkout-input" 
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                name="postalCode"
                placeholder="Postal code (optional)" 
                className="checkout-input" 
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="checkout-input-group">
              <input 
                type="text" 
                name="phone"
                placeholder="Phone" 
                className="checkout-input" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          <section className="checkout-section billing-section">
            <h2>Billing address</h2>
            <div className="billing-options-box">
              <div 
                className={`billing-option-row ${formData.billingSame ? 'active' : ''}`}
                onClick={() => setFormData(p => ({...p, billingSame: true}))}
              >
                <div className="checkout-radio">
                  {formData.billingSame && <div className="checkout-radio-inner"></div>}
                </div>
                <span>Same as shipping address</span>
              </div>
              
              <div 
                className={`billing-option-row ${!formData.billingSame ? 'active' : ''}`}
                onClick={() => setFormData(p => ({...p, billingSame: false}))}
              >
                <div className="checkout-radio">
                  {!formData.billingSame && <div className="checkout-radio-inner"></div>}
                </div>
                <span>Use a different billing address</span>
              </div>

              {!formData.billingSame && (
                <div className="billing-form-fields">
                  <div className="checkout-input-group">
                    <select className="checkout-input" disabled><option>Pakistan</option></select>
                  </div>
                  <div className="checkout-row">
                    <input type="text" name="billingFirstName" placeholder="First name" className="checkout-input" value={formData.billingFirstName} onChange={handleInputChange} required />
                    <input type="text" name="billingLastName" placeholder="Last name" className="checkout-input" value={formData.billingLastName} onChange={handleInputChange} required />
                  </div>
                  <div className="checkout-input-group">
                    <input type="text" name="billingAddress" placeholder="Address" className="checkout-input" value={formData.billingAddress} onChange={handleInputChange} required />
                  </div>
                  <div className="checkout-row">
                    <input type="text" name="billingCity" placeholder="City" className="checkout-input" value={formData.billingCity} onChange={handleInputChange} required />
                    <input type="text" name="billingPostalCode" placeholder="Postal code (optional)" className="checkout-input" value={formData.billingPostalCode} onChange={handleInputChange} />
                  </div>
                  <div className="checkout-input-group">
                    <input type="email" name="billingEmail" placeholder="Email (optional)" className="checkout-input" value={formData.billingEmail} onChange={handleInputChange} />
                  </div>
                  <div className="checkout-input-group">
                    <input type="text" name="billingPhone" placeholder="Phone (+92 ...)" className="checkout-input" value={formData.billingPhone} onChange={handleInputChange} required />
                  </div>
                </div>
              )}
            </div>
          </section>

          <button type="submit" className="checkout-complete-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Complete order'}
          </button>
        </div>

        <div className="checkout-right">
          <div className="checkout-order-summary">
            {cart.map((item, index) => (
              <div className="checkout-item" key={index}>
                <div className="checkout-item-image-wrapper">
                  <div className="checkout-item-image">
                    <img src={item.imageUrls?.[0] || "/product.png"} alt={item.name} />
                  </div>
                  <span className="checkout-item-badge">{item.quantity}</span>
                </div>
                <span className="checkout-item-name">{item.name} ({item.bundleName})</span>
                <span className="checkout-item-price">Rs {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Shipping</span>
                <span>Rs {shipping.toFixed(2)}</span>
              </div>
              <div className="checkout-total-row final">
                <span className="total-label">Total</span>
                <span className="total-value"><span className="currency">PKR</span> Rs {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- Analytics Tab Component --- //
const AnalyticsTab = ({ onShowToast }) => {
  const [allPaidOrders, setAllPaidOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeType, setRangeType] = useState('past30'); // today | past7 | thisMonth | past30 | pastMonth | custom
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const fetchPaidOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, subtotal, shipping, created_at, items, payment_status')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });
    if (!error) setAllPaidOrders(data || []);
    else onShowToast('Error loading analytics: ' + error.message, 'error');
    setIsLoading(false);
  };

  const getDateRange = () => {
    const now = new Date();
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const endOfDay = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
    switch (rangeType) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'past7': {
        const from = new Date(now); from.setDate(from.getDate() - 6); return { from: startOfDay(from), to: endOfDay(now) };
      }
      case 'thisMonth':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
      case 'past30': {
        const from = new Date(now); from.setDate(from.getDate() - 29); return { from: startOfDay(from), to: endOfDay(now) };
      }
      case 'pastMonth': {
        const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const m = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0, 23, 59, 59, 999) };
      }
      case 'custom':
        if (!customFrom || !customTo) return null;
        return { from: new Date(customFrom), to: endOfDay(new Date(customTo)) };
      default:
        return null;
    }
  };

  const range = getDateRange();
  const filtered = range
    ? allPaidOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= range.from && d <= range.to;
      })
    : allPaidOrders;

  const totalRevenue = filtered.reduce((s, o) => s + parseFloat(o.total), 0);
  const totalOrders = filtered.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalUnits = filtered.reduce((s, o) => {
    const items = o.items || [];
    return s + items.reduce((ss, item) => ss + (item.count || item.quantity || 1) * (item.quantity || 1), 0);
  }, 0);

  // Build daily chart data for filtered range
  const buildChartData = () => {
    if (!range) return [];
    const days = [];
    const cur = new Date(range.from);
    while (cur <= range.to) {
      const label = cur.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
      const dateStr = cur.toDateString();
      const dayOrders = filtered.filter(o => new Date(o.created_at).toDateString() === dateStr);
      const dayRevenue = dayOrders.reduce((s, o) => s + parseFloat(o.total), 0);
      days.push({ label, revenue: dayRevenue, orders: dayOrders.length });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };
  const chartData = buildChartData();
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const rangeButtons = [
    { key: 'today', label: 'Today' },
    { key: 'past7', label: 'Past 7 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'past30', label: 'Past 30 Days' },
    { key: 'pastMonth', label: 'Last Month' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="analytics-wrapper">
      <div className="analytics-header-row">
        <h2 className="analytics-title"><BarChart2 size={22} /> Sales Analytics</h2>
        <button className="admin-refresh-btn" onClick={fetchPaidOrders} disabled={isLoading}>
          <RefreshCcw size={16} className={isLoading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Range Filter */}
      <div className="analytics-range-row">
        {rangeButtons.map(btn => (
          <button
            key={btn.key}
            className={`analytics-range-btn ${rangeType === btn.key ? 'active' : ''}`}
            onClick={() => setRangeType(btn.key)}
          >{btn.label}</button>
        ))}
      </div>

      {rangeType === 'custom' && (
        <div className="analytics-custom-dates">
          <div className="analytics-date-field">
            <label>From</label>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
          </div>
          <div className="analytics-date-field">
            <label>To</label>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon revenue"><DollarSign size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">Rs.{totalRevenue.toLocaleString('en-PK', {minimumFractionDigits: 2})}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orders"><ShoppingBag size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Paid Orders</div>
            <div className="kpi-value">{totalOrders}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon avg"><TrendingUp size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Avg Order Value</div>
            <div className="kpi-value">Rs.{avgOrder.toLocaleString('en-PK', {minimumFractionDigits: 2})}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon units"><Layers size={22} /></div>
          <div className="kpi-info">
            <div className="kpi-label">Units Sold</div>
            <div className="kpi-value">{totalUnits}</div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="analytics-chart-card">
          <h3 className="chart-title">Revenue by Day</h3>
          <div className="bar-chart-scroll">
            <div className="bar-chart" style={{ '--bar-count': chartData.length }}>
              {chartData.map((day, i) => (
                <div key={i} className="bar-col">
                  <div className="bar-tooltip">Rs.{day.revenue.toFixed(0)}<br />{day.orders} order{day.orders !== 1 ? 's' : ''}</div>
                  <div
                    className="bar-fill"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, opacity: day.revenue === 0 ? 0.15 : 1 }}
                  />
                  {chartData.length <= 14 && <div className="bar-label">{day.label}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Paid Orders Table */}
      <div className="analytics-chart-card">
        <h3 className="chart-title">Paid Orders in Period</h3>
        {isLoading ? (
          <div style={{textAlign:'center', padding:'30px', color:'var(--text-muted)'}}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center', padding:'30px', color:'var(--text-muted)'}}>No paid orders in this period.</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="admin-table-row">
                    <td>#{order.id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' })}</td>
                    <td>{(order.items||[]).map(i => `${i.quantity}× ${i.bundleName||i.name}`).join(', ')}</td>
                    <td style={{fontWeight:'700', color:'var(--cyan)'}}>Rs.{parseFloat(order.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Admin Portal Component --- //
const AdminPortal = ({ productInfo, onUpdateProduct, onShowToast }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('patchupgtr56@gmail.com');
  const [password, setPassword] = useState('goldendragon78');
  const [error, setError] = useState('');
  
  const [editName, setEditName] = useState(productInfo.name);
  const [editPrice, setEditPrice] = useState(productInfo.price);
  const [editComparePrice, setEditComparePrice] = useState(productInfo.compareAtPrice);
  const [editStock, setEditStock] = useState(productInfo.stock ?? 0);
  const [editImageUrls, setEditImageUrls] = useState(productInfo.imageUrls || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('product');
  const [productSubTab, setProductSubTab] = useState('info'); // 'info' or 'imagery'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, label, execute }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} copied to clipboard!`);
  };

  useEffect(() => {
    setEditName(productInfo.name);
    setEditPrice(productInfo.price);
    setEditComparePrice(productInfo.compareAtPrice);
    setEditStock(productInfo.stock ?? 0);
    setEditImageUrls(productInfo.imageUrls || []);
  }, [productInfo]);

  useEffect(() => {
    if (activeTab === 'orders' && isLoggedIn) {
      fetchOrders();
    }
  }, [activeTab, isLoggedIn]);

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setOrders(data);
    setIsOrdersLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
      
    if (data && !error) {
      setIsLoggedIn(true);
    } else {
      setError('Invalid email or password');
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setEditImageUrls([...editImageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index) => {
    setEditImageUrls(editImageUrls.filter((_, i) => i !== index));
  };

  const moveImageUrl = (index, delta) => {
    const newUrls = [...editImageUrls];
    const newIdx = index + delta;
    if (newIdx >= 0 && newIdx < newUrls.length) {
      const temp = newUrls[index];
      newUrls[index] = newUrls[newIdx];
      newUrls[newIdx] = temp;
      setEditImageUrls(newUrls);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ 
        name: editName,
        price: parseFloat(editPrice), 
        compare_at_price: parseFloat(editComparePrice),
        stock: parseInt(editStock, 10),
        image_urls: editImageUrls
      })
      .eq('id', 1);
      
    if (!error) {
      onShowToast('Product updated successfully!');
      onUpdateProduct({
        name: editName,
        price: parseFloat(editPrice),
        compareAtPrice: parseFloat(editComparePrice),
        stock: parseInt(editStock, 10),
        imageUrls: editImageUrls
      });
    } else {
      onShowToast('Error updating product: ' + error.message, 'error');
    }
    setIsSaving(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) onShowToast('Error: ' + error.message, 'error');
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      onShowToast(`Order #${orderId} marked as ${newStatus}`);
    }
  };

  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    const { error } = await supabase.from('orders').update({ payment_status: newPaymentStatus }).eq('id', orderId);
    if (error) onShowToast('Error: ' + error.message, 'error');
    else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
      onShowToast(`Payment marked as ${newPaymentStatus}`);
    }
  };

  const deleteOrder = async (orderId) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (orderToDelete.status !== 'cancelled') {
      onShowToast('Orders must be cancelled before deletion.', 'error');
      return;
    }
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (!error) {
      onShowToast('Order deleted successfully');
      setSelectedOrder(null);
      fetchOrders();
    } else {
      onShowToast('Error deleting order: ' + error.message, 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-glass">
          <div className="admin-login-header">
            <div className="admin-logo-circle">
              <Package size={24} color="#000" />
            </div>
            <h2>Admin Access</h2>
            <p>Welcome back! Please login to your account.</p>
          </div>
          {error && <div className="admin-error-pill">{error}</div>}
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="admin-input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="admin-login-btn">Login to Dashboard <ArrowRight size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header"><div className="admin-logo-small">P</div><h3>Patch Up</h3></div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}><Tag size={20} /> Product Management</button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><ShoppingBag size={20} /> Manage Orders</button>
          <button className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart2 size={20} /> Analytics</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => setIsLoggedIn(false)}><LogOut size={20} /> Logout</button>
      </aside>

      <main className="admin-main-content">
        <header className="admin-top-bar">
          <div className="admin-breadcrumb">Dashboard / <span>{activeTab === 'product' ? 'Product Management' : activeTab === 'orders' ? 'Manage Orders' : activeTab === 'analytics' ? 'Analytics' : activeTab}</span></div>
          {activeTab === 'orders' && <button className="admin-refresh-btn" onClick={fetchOrders} disabled={isOrdersLoading}><RefreshCcw size={16} className={isOrdersLoading ? 'spinning' : ''} /> Refresh</button>}
        </header>

        {!selectedOrder && (
          <div className="admin-content-card">
            {activeTab === 'product' && (
            <div className="admin-product-wrapper">
              <div className="admin-sub-tabs">
                <button className={`sub-tab ${productSubTab === 'info' ? 'active' : ''}`} onClick={() => setProductSubTab('info')}><Info size={18} /> Basic Info</button>
                <button className={`sub-tab ${productSubTab === 'imagery' ? 'active' : ''}`} onClick={() => setProductSubTab('imagery')}><ImageIcon size={18} /> Product Imagery</button>
              </div>

              <form onSubmit={handleUpdateProduct} className="admin-product-form">
                <div className="admin-form-grid sub-tab-view">
                  {(productSubTab === 'info' || window.innerWidth > 768) && (
                    <div className="admin-form-section">
                      <h4><Info size={20} color="var(--cyan)" /> Basic Information</h4>
                      <div className="admin-input-group">
                        <label>Product Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                      </div>
                      <div className="admin-row">
                        <div className="admin-input-group">
                          <label>Price (PKR)</label>
                          <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Compare Price (PKR)</label>
                          <input type="number" step="0.01" value={editComparePrice} onChange={(e) => setEditComparePrice(e.target.value)} required />
                        </div>
                      </div>
                      <div className="admin-input-group" style={{marginTop:'12px'}}>
                        <label style={{display:'flex',alignItems:'center',gap:'6px'}}>
                          <Package size={16} color="var(--cyan)" /> Inventory / Stock (units)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          required
                          style={{maxWidth:'180px'}}
                        />
                        <p className="admin-help-text" style={{marginTop:'6px'}}>
                          Current stock: <strong style={{color: editStock <= 10 ? '#ff6b6b' : 'var(--cyan)'}}>{editStock} units</strong>
                          {editStock <= 10 && editStock > 0 && <span style={{color:'#ff6b6b', marginLeft:'8px'}}>⚠ Low stock</span>}
                          {editStock == 0 && <span style={{color:'#ff4040', marginLeft:'8px'}}>✗ Out of stock</span>}
                        </p>
                      </div>
                    </div>
                  )}

                  {(productSubTab === 'imagery' || window.innerWidth > 768) && (
                    <div className="admin-form-section">
                      <h4><ImageIcon size={20} color="var(--cyan)" /> Product Imagery ({editImageUrls.length})</h4>
                      <p className="admin-help-text" style={{marginBottom:'15px', color:'var(--cyan)', fontWeight:'600'}}>
                        Tip: Drag and drop order is coming soon. Use arrows to reorder.
                      </p>
                      <div className="admin-image-list">
                        {editImageUrls.map((url, idx) => (
                          <div key={idx} className="admin-image-item">
                            <img 
                              src={url} 
                              alt={`Preview ${idx}`} 
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'; }}
                            />
                            <div className="admin-image-actions">
                              <button type="button" onClick={() => moveImageUrl(idx, -1)} disabled={idx === 0}><ChevronUp size={16}/></button>
                              <button type="button" onClick={() => moveImageUrl(idx, 1)} disabled={idx === editImageUrls.length - 1}><ChevronDown size={16}/></button>
                              <button type="button" className="delete" onClick={() => removeImageUrl(idx)}><Trash2 size={16}/></button>
                            </div>
                            <span className="idx-label">{idx === 0 ? 'Cover' : idx + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="admin-add-image-box">
                        <input 
                          type="text" 
                          placeholder="Paste image URL..." 
                          value={newImageUrl} 
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                        <button type="button" onClick={addImageUrl} className="admin-add-btn">Add Image</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="admin-form-footer">
                  <button type="submit" className="admin-save-btn" disabled={isSaving}>{isSaving ? 'Updating...' : 'Save All Changes'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'orders' && !selectedOrder && (
            <div className="admin-orders-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>STATUS</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="admin-table-row" onClick={() => setSelectedOrder(order)} style={{cursor: 'pointer'}}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.first_name} {order.last_name}</td>
                      <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                      <td>Rs.{parseFloat(order.total).toFixed(2)}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'40px'}}>No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab onShowToast={onShowToast} />
          )}
        </div>
      )}

      {activeTab === 'orders' && selectedOrder && (
        <div className="order-full-view">
          <header className="order-full-header">
            <button className="back-btn" onClick={() => setSelectedOrder(null)}><ChevronLeft size={20} /> Back to Orders</button>
            <div className="order-meta">
              <h2>Order #{selectedOrder.id}</h2>
              <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</span>
            </div>
            <div className="order-header-right-placeholder"></div>
          </header>

          <div className="order-full-grid sub-tab-view">
            <div className="order-full-main">
              <div className="order-card">
                <div className="order-card-header">
                  <Package size={20} />
                  <h3>Order Items</h3>
                </div>
                <div className="order-items-list-premium">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item-row-premium">
                      <div className="item-info">
                        <span className="item-qty">{item.quantity}×</span>
                        <div>
                          <p className="item-name">{item.name}</p>
                          <p className="item-variant">{item.bundleName}</p>
                        </div>
                      </div>
                      <span className="item-price">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-card">
                <div className="order-card-header">
                  <CreditCard size={20} />
                  <h3>Payment & Billing</h3>
                </div>
                <div className="billing-details">
                  <div className="detail-row">
                    <span>Payment Status</span>
                    <span className={`status-badge ${selectedOrder.payment_status || 'pending'}`}>
                      {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="detail-divider" />
                  <div className="billing-address-box">
                    <div className="address-text">
                      <strong>{selectedOrder.billing_first_name} {selectedOrder.billing_last_name}</strong><br />
                      {selectedOrder.billing_address}<br />
                      {selectedOrder.billing_city}, {selectedOrder.billing_postal_code}
                    </div>
                    <button 
                      className="copy-action-btn" 
                      style={{ marginTop: '12px' }}
                      onClick={() => copyToClipboard(`${selectedOrder.billing_first_name} ${selectedOrder.billing_last_name}, ${selectedOrder.billing_address}, ${selectedOrder.billing_city}, ${selectedOrder.billing_postal_code}`, 'Billing Address')}
                    >
                      Copy Billing Address
                    </button>
                  </div>
                </div>
              </div>

              <div className="order-summary-card">
                <div className="summary-row"><span>Subtotal</span><span>Rs.{parseFloat(selectedOrder.subtotal).toFixed(2)}</span></div>
                <div className="summary-row"><span>Shipping</span><span>Rs.{parseFloat(selectedOrder.shipping).toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total</span><span>Rs.{parseFloat(selectedOrder.total).toFixed(2)}</span></div>
              </div>
            </div>

            <div className="order-full-sidebar">
              <div className="order-card highlight">
                <div className="order-card-header">
                  <User size={20} />
                  <h3>Customer & Shipping</h3>
                </div>
                <div className="customer-info-box">
                  <div className="customer-main">
                    <div className="customer-avatar">{selectedOrder.first_name[0]}</div>
                    <div>
                      <p className="customer-name">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                      <p className="customer-email">{selectedOrder.customer_email}</p>
                    </div>
                  </div>
                  
                  <div className="shipping-address-copy">
                    <div className="copy-label">SHIPPING ADDRESS</div>
                    <div className="address-text">
                      {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.postal_code}
                    </div>
                    <button className="copy-action-btn" onClick={() => copyToClipboard(`${selectedOrder.address}, ${selectedOrder.city}, ${selectedOrder.postal_code}`, 'Address')}>
                      Copy Address
                    </button>
                  </div>

                  <div className="shipping-address-copy">
                    <div className="copy-label">PHONE NUMBER</div>
                    <div className="address-text">{selectedOrder.customer_phone}</div>
                    <button className="copy-action-btn" onClick={() => copyToClipboard(selectedOrder.customer_phone, 'Phone')}>
                      Copy Phone
                    </button>
                  </div>
                </div>
              </div>

              <div className="order-card">
                <div className="order-card-header">
                  <Clock size={20} />
                  <h3>Order Status Control</h3>
                </div>
                <div className="action-buttons-stack">
                  {selectedOrder.status === 'pending' && (
                    <button className="action-btn fulfill" onClick={() => setConfirmAction({ label: 'Mark as Fulfilled?', execute: () => updateOrderStatus(selectedOrder.id, 'fulfilled') })}>
                      Mark as Fulfilled
                    </button>
                  )}
                  {selectedOrder.status === 'fulfilled' && (
                    <button className="action-btn fulfill" onClick={() => setConfirmAction({ label: 'Mark as Delivered?', execute: () => updateOrderStatus(selectedOrder.id, 'delivered') })}>
                      Mark as Delivered
                    </button>
                  )}
                  {selectedOrder.status !== 'cancelled' && (
                    <button className="action-btn cancel" onClick={() => setConfirmAction({ label: 'Cancel this order?', execute: () => updateOrderStatus(selectedOrder.id, 'cancelled') })}>
                      Cancel Order
                    </button>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                    <button className="action-btn delete" onClick={() => setConfirmAction({ label: 'Delete this order permanently?', execute: () => deleteOrder(selectedOrder.id) })}>
                      Delete Order
                    </button>
                  )}
                </div>
              </div>

              <div className="order-card highlight">
                <div className="order-card-header">
                  <CreditCard size={20} />
                  <h3>Payment Control</h3>
                </div>
                <div className="action-buttons-stack">
                  {selectedOrder.payment_status === 'pending' ? (
                    <button className="action-btn fulfill" onClick={() => setConfirmAction({ label: 'Mark Payment as Done?', execute: () => updatePaymentStatus(selectedOrder.id, 'paid') })}>
                      Mark as Paid
                    </button>
                  ) : (
                    <button className="action-btn cancel" onClick={() => setConfirmAction({ label: 'Revert to Payment Pending?', execute: () => updatePaymentStatus(selectedOrder.id, 'pending') })}>
                      Revert to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="admin-modal-overlay">
          <div className="confirmation-dialog">
            <div className="confirm-icon"><Clock size={32} color="var(--cyan)" /></div>
            <h3>{confirmAction.label}</h3>
            <p>Are you sure you want to proceed with this action?</p>
            <div className="confirm-actions">
              <button className="confirm-btn-secondary" onClick={() => setConfirmAction(null)}>Go Back</button>
              <button className="confirm-btn-primary" onClick={() => { confirmAction.execute(); setConfirmAction(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Shell --- //

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // --- Cart persisted to localStorage ---
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('patchup_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [emailInput, setEmailInput] = useState('');
  const [productInfo, setProductInfo] = useState({ name: "", price: 0, compareAtPrice: 0, imageUrls: [], stock: 0 });
  const [lastOrder, setLastOrder] = useState(null);
  const [toast, setToast] = useState(null);

  // Track if we've passed the initial mount (prevents StrictMode double-invoke from wiping localStorage)
  const isMounted = useRef(false);

  // Sync cart to localStorage on every change (skip the very first render)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // skip initial mount — cart is already correctly read FROM localStorage
    }
    try {
      if (cart.length === 0) {
        localStorage.removeItem('patchup_cart');
      } else {
        localStorage.setItem('patchup_cart', JSON.stringify(cart));
      }
    } catch {}
  }, [cart]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (window.location.pathname === '/admin-portal') setCurrentPage('admin');
    const fetchProduct = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', 1).single();
      if (data && !error) {
        setProductInfo({
          name: data.name,
          price: parseFloat(data.price),
          compareAtPrice: parseFloat(data.compare_at_price),
          stock: parseInt(data.stock ?? 0, 10),
          imageUrls: data.image_urls || []
        });
      }
    };
    fetchProduct();
  }, []);

  const handleNavigate = (page) => { setCurrentPage(page); window.scrollTo(0, 0); };

  const handleAddToCart = (bundle) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.bundleId === bundle.id);
      if (idx > -1) {
        const newCart = [...prev];
        newCart[idx].quantity += 1;
        return newCart;
      }
      return [...prev, { ...productInfo, bundleId: bundle.id, bundleName: bundle.name, price: bundle.price, compareAtPrice: bundle.originalPrice, quantity: 1 }];
    });
    handleNavigate('cart');
  };

  const handleUpdateQty = (index, delta) => {
    setCart(prev => {
      const newCart = prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return newCart;
    });
  };

  const handleRemoveFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    const { error } = await supabase.from('newsletter_subscribers').insert([{ email: emailInput }]);
    if (error) showToast('Error: ' + error.message, 'error');
    else { showToast('Successfully subscribed!'); setEmailInput(''); }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      {currentPage !== 'checkout' && currentPage !== 'admin' && (
        <>
          <div className="top-bar">Clear Skin. No Drama.</div>
          <header className="header">
            {/* Mobile Left: Hamburger + Search */}
            <div className="header__mobile-left">
              <button className="header__hamburger" onClick={() => setMobileMenuOpen(o => !o)}><Menu size={22} /></button>
              <button className="header__search-mobile"><Search size={20} /></button>
            </div>

            {/* Logo - always centered on mobile */}
            <div className="header__left">
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('home'); }} className="header__logo"><span>PATCH</span><span>UP!</span></a>
              <nav className="header__nav">
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('home'); }}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('product'); }}>Catalog</a>
              </nav>
            </div>

            <div className="header__icons">
              <button className="header__icon-desktop"><User size={20} /></button>
              <button onClick={() => handleNavigate('cart')}>
                <ShoppingBag size={20} />
                {cart.reduce((a, b) => a + b.quantity, 0) > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
              </button>
            </div>
          </header>

          {/* Mobile Slide-down Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
              <div className="mobile-menu" onClick={e => e.stopPropagation()}>
                <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}><X size={22} /></button>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('home'); setMobileMenuOpen(false); }}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('product'); setMobileMenuOpen(false); }}>Catalog</a>
              </div>
            </div>
          )}
        </>
      )}

      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} productInfo={productInfo} />}
      {currentPage === 'product' && <ProductPage onAddToCart={handleAddToCart} productInfo={productInfo} />}
      {currentPage === 'cart' && <CartPage cart={cart} onUpdateQty={handleUpdateQty} onRemove={handleRemoveFromCart} onNavigate={handleNavigate} onShowToast={showToast} productInfo={productInfo} />}
      {currentPage === 'checkout' && <CheckoutPage onNavigate={handleNavigate} cart={cart} onClearCart={() => { setCart([]); localStorage.removeItem('patchup_cart'); }} onSuccess={(data) => setLastOrder(data)} onShowToast={showToast} />}
      {currentPage === 'thank-you' && <ThankYouPage order={lastOrder} onNavigate={handleNavigate} />}
      {currentPage === 'admin' && <AdminPortal productInfo={productInfo} onUpdateProduct={(info) => setProductInfo(info)} onShowToast={showToast} />}

      {currentPage !== 'checkout' && currentPage !== 'admin' && (
        <footer className="footer">
          <div className="footer__inner">
            <div className="newsletter__left"><h3>Join our email list</h3><p>Get exclusive deals and early access to new products.</p></div>
            <div className="newsletter__right">
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', width: '100%', position: 'relative' }}>
                <input type="email" placeholder="Email address" className="newsletter__input" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
                <button type="submit" className="newsletter__submit"><ArrowRight size={20} color="#000" /></button>
              </form>
            </div>
          </div>
          <div className="footer__bottom"><div>© 2026 Patch Up, Powered by Shopify</div><div>Terms and Policies</div></div>
        </footer>
      )}

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
