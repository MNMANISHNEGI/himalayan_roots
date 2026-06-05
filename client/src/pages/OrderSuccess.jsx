import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderSuccess() {
  const { orderNumber } = useParams()

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-forest-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Placed!
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for choosing Himalayan Roots. Your order has been received and we're preparing it with care.
          </p>

          <div className="bg-forest-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 text-forest-800">
              <Package size={20} />
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-bold text-lg">{orderNumber}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-8 space-y-1">
            <p>📧 A confirmation has been sent to your email</p>
            <p>🚚 Expected delivery in 3–7 business days</p>
            <p>📞 Questions? Call us at +91 98765 43210</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/shop" className="btn-primary flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight size={18} />
            </Link>
            <Link to="/" className="btn-outline flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
