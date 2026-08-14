import React from 'react';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose, cartItems, onRemoveItem }) => {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`cart-drawer ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Your Cart ({cartItems.length})</h2>
                    <button className="close-cart-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.image || "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80"} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <p className="cart-item-price">₹{item.price}</p>
                                </div>
                                <button className="remove-item-btn" onClick={() => onRemoveItem(index)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Total</span>
                        <span>{`₹ ${total.toFixed(2)}`}</span>
                    </div>
                    <button className="checkout-btn" disabled={cartItems.length === 0}>
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
