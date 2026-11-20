import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('localCart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Sync with MongoDB backend when user logs in
  useEffect(() => {
    const fetchServerCart = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data } = await axiosClient.get('/cart');
          if (data?.data?.items) {
            const mapped = data.data.items.map((item) => ({
              productId: item.product?._id || item.product,
              name: item.product?.name || 'Product',
              price: item.price,
              imageUrl: item.product?.imageUrl || '',
              quantity: item.quantity,
              countInStock: item.product?.countInStock ?? 10,
            }));
            setCartItems(mapped);
          }
        } catch (error) {
          console.error('Failed to fetch server cart:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServerCart();
  }, [user]);

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('localCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity);

    // Update local state first
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.productId === product._id);
      if (existing) {
        return prevItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + qty, product.countInStock || 99) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: qty,
          countInStock: product.countInStock,
        },
      ];
    });

    // If authenticated, also persist to MongoDB
    if (user) {
      try {
        await axiosClient.post('/cart/items', {
          productId: product._id,
          quantity: qty,
        });
      } catch (err) {
        console.error('Failed to sync added item with server:', err);
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const qty = Math.max(1, Number(newQuantity));

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item
      )
    );

    if (user) {
      try {
        await axiosClient.put(`/cart/items/${productId}`, { quantity: qty });
      } catch (err) {
        console.error('Failed to sync updated quantity with server:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );

    if (user) {
      try {
        await axiosClient.delete(`/cart/items/${productId}`);
      } catch (err) {
        console.error('Failed to remove item from server cart:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('localCart');

    if (user) {
      try {
        await axiosClient.delete('/cart');
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice: Math.round(totalPrice * 100) / 100,
        totalCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
