import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const SettingsContext = createContext()

export const useSettings = () => useContext(SettingsContext)

const DEFAULTS = {
  site_name: 'Himalayan Roots',
  tagline: 'From the Mountains, For the World',
  free_shipping_above: '999',
  shipping_charge: '99',
  min_order_amount: '0',
  whatsapp_number: '919910426826',
  whatsapp_message: 'Hello! I have a question about Himalayan Roots products.',
  contact_email: 'hello@himalayanroots.com',
  contact_phone: '+91 99104 26826',
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings({ ...DEFAULTS, ...res.data.settings }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const freeShippingAbove = parseFloat(settings.free_shipping_above || 999)
  const shippingCharge = parseFloat(settings.shipping_charge || 99)
  const minOrderAmount = parseFloat(settings.min_order_amount || 0)
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message || '')}`

  return (
    <SettingsContext.Provider value={{
      settings,
      setSettings,
      loading,
      freeShippingAbove,
      shippingCharge,
      minOrderAmount,
      whatsappUrl,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}
