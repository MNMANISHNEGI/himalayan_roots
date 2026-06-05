import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hr_cart') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('hr_cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const totalPrice = items.reduce((sum, i) => {
    const effectivePrice = i.price * (1 - (i.discount_percentage || 0) / 100)
    return sum + effectivePrice * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}
