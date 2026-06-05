import React, { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { X } from 'lucide-react'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7">
    <path d="M16.004 0C7.164 0 0 7.163 0 16c0 2.825.737 5.47 2.027 7.77L0 32l8.474-2.219A15.93 15.93 0 0 0 16.004 32C24.836 32 32 24.837 32 16S24.836 0 16.004 0Zm0 29.292a13.24 13.24 0 0 1-6.752-1.846l-.483-.287-5.03 1.317 1.341-4.896-.315-.502A13.224 13.224 0 0 1 2.71 16c0-7.33 5.965-13.292 13.294-13.292S29.29 8.67 29.29 16c0 7.33-5.961 13.292-13.286 13.292Zm7.292-9.95c-.4-.2-2.364-1.166-2.73-1.299-.367-.133-.634-.2-.9.2-.267.4-1.034 1.298-1.268 1.565-.233.267-.467.3-.867.1-.4-.2-1.687-.622-3.213-1.983-1.188-1.059-1.99-2.368-2.224-2.768-.233-.4-.025-.616.175-.815.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.168-1.233-2.968-.325-.78-.655-.674-.9-.687-.233-.012-.5-.015-.767-.015-.267 0-.7.1-1.067.5s-1.4 1.366-1.4 3.332c0 1.967 1.433 3.867 1.633 4.134.2.267 2.82 4.3 6.832 6.032.954.412 1.699.658 2.28.843.958.305 1.83.261 2.519.158.768-.115 2.364-.966 2.697-1.9.333-.933.333-1.732.233-1.9-.1-.166-.366-.266-.766-.466Z"/>
  </svg>
)

export default function WhatsAppButton() {
  const { whatsappUrl, settings } = useSettings()
  const [tooltip, setTooltip] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip bubble */}
      {tooltip && (
        <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[220px] text-sm relative border border-gray-100">
          <button
            onClick={() => setTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
          <p className="font-semibold text-gray-800 mb-1">Contact Us</p>
          <p className="text-gray-500 text-xs leading-relaxed mb-3">
            If you have any questions, we're here to help you.
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Email us at —{' '}
            <a href={`mailto:${settings.contact_email}`} className="text-green-600 underline">
              {settings.contact_email}
            </a>
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors w-full"
          >
            <WhatsAppIcon />
            Whatsapp
          </a>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setTooltip(!tooltip)}
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
      >
        <WhatsAppIcon />
      </button>
    </div>
  )
}
