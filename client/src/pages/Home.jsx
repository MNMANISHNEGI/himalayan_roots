import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Truck, Award, ChevronRight, Star } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useSettings } from '../context/SettingsContext'

const HERO_BG = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80'
const STORY_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'

const categories = [
  { name: 'Rajma & Pulses', slug: 'rajma-pulses', emoji: '🫘', desc: 'Heirloom beans from mountain valleys' },
  { name: 'Rice & Grains', slug: 'rice-grains', emoji: '🌾', desc: 'Ancient heritage grains from terraced farms' },
  { name: 'Fruits', slug: 'fruits', emoji: '🍎', desc: 'Hand-picked from Himalayan orchards' },
  { name: 'Ghee & Dairy', slug: 'dairy-ghee', emoji: '🧈', desc: 'Bilona-method traditional ghee' },
  { name: 'Wild Honey', slug: 'honey', emoji: '🍯', desc: 'Raw, unfiltered mountain honey' },
]

const testimonials = [
  { name: 'Priya S.', location: 'Delhi', rating: 5, text: 'The Rajma Harshil is absolutely extraordinary. I have never tasted anything like it from the market. Worth every rupee.' },
  { name: 'Rahul M.', location: 'Mumbai', rating: 5, text: 'The Himalayan Ghee reminds me of my grandmother\'s kitchen. Pure, fragrant, and made with love. My family is hooked.' },
  { name: 'Anita K.', location: 'Bangalore', rating: 5, text: 'Bhatt ki Daal is a revelation. I didn\'t know a pulse could be this flavourful. Ordering again for sure!' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const { freeShippingAbove } = useSettings()

  useEffect(() => {
    api.get('/products?featured=true&limit=6')
      .then(res => setFeatured(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-900/60 to-forest-950/80" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Direct from Himalayan Farms
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pure from the
            <span className="block text-earth-300 italic">Mountains</span>
          </h1>

          <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Bringing you rare, hand-sourced foods from the high Himalayas — Rajma, Red Rice, Ghee, Honey and more. Untouched by industry. Shaped by altitude.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-secondary flex items-center gap-2 justify-center text-lg px-8 py-4">
              Explore Our Products <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn-outline border-white text-white hover:bg-white hover:text-forest-900 flex items-center gap-2 justify-center text-lg px-8 py-4">
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-xs">
          <span>Scroll to explore</span>
          <div className="w-0.5 h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-forest-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium">
            {[
              ['🌿', '100% Organic & Natural'],
              ['🏔️', 'Direct from Mountain Farms'],
              ['🚚', `Free Shipping above ₹${freeShippingAbove}`],
              ['✅', 'No Preservatives, No Chemicals'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-2 text-forest-100">
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-earth-500 font-medium mb-2 tracking-wider uppercase text-sm">Browse by Category</p>
            <h2 className="section-title">The Mountains Give the Best</h2>
            <p className="section-subtitle">Each category tells a story of altitude, tradition, and purity</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group card p-6 text-center hover:bg-forest-50 border border-transparent hover:border-forest-200 transition-all"
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="font-semibold text-forest-900 text-sm mb-1">{cat.name}</h3>
                <p className="text-gray-400 text-xs">{cat.desc}</p>
                <div className="mt-3 flex justify-center">
                  <ChevronRight size={16} className="text-forest-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-earth-500 font-medium mb-1 tracking-wider uppercase text-sm">Handpicked for You</p>
              <h2 className="section-title mb-0">Featured Products</h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-forest-700 font-medium hover:text-forest-900 transition-colors">
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-gray-100 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
              See All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="py-20 bg-forest-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-earth-400 font-medium mb-3 tracking-wider uppercase text-sm">The Himalayan Roots Story</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                From Summit to Table
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                We began with a simple belief — that the world's most extraordinary foods grow in the world's most extraordinary places.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Deep in the Garhwal and Kumaon Himalayas, generations of farming families have cultivated ancient varieties of beans, grains, and fruits using methods passed down through centuries. We work directly with these communities, paying fair prices and ensuring their heritage crops reach kitchens that truly value them.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[['50+', 'Farm Families'], ['9+', 'Products'], ['3000+', 'Happy Customers']].map(([n, l]) => (
                  <div key={l}>
                    <div className="text-3xl font-bold text-earth-400" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                    <div className="text-gray-400 text-sm">{l}</div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
                Read Our Full Story <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <img
                src={STORY_IMG}
                alt="Himalayan mountains"
                className="rounded-2xl w-full h-96 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-earth-500 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Est. 2020</div>
                <div className="text-earth-100 text-sm">Rooted in tradition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Himalayan Roots?</h2>
            <p className="section-subtitle">Our commitment to purity, tradition, and the communities we serve</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Leaf size={28} />, title: 'Truly Organic', desc: 'No synthetic pesticides, no GMOs. Just food grown the way nature intended — with mountain soil, glacial water, and sunshine.' },
              { icon: <Shield size={28} />, title: 'Quality Assured', desc: 'Every batch is hand-sorted and lab-tested. We accept nothing less than what we would serve to our own families.' },
              { icon: <Truck size={28} />, title: 'Direct Sourcing', desc: 'We work directly with farmers — no middlemen, no warehouses. Your order is as fresh as the mountains allow.' },
              { icon: <Award size={28} />, title: 'Heritage Varieties', desc: 'We seek out and preserve rare, heirloom varieties that commercial agriculture has forgotten. Real food, real flavour.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-forest-700">
                  {icon}
                </div>
                <h3 className="font-bold text-forest-900 text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-earth-500 font-medium mb-2 tracking-wider uppercase text-sm">Customer Stories</p>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-8 bg-forest-50 border border-forest-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest-700 rounded-full flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-forest-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-mountain-gradient text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Taste the Mountains
          </h2>
          <p className="text-forest-200 text-lg mb-8 leading-relaxed">
            Free shipping on orders above ₹999. Packed with love. Delivered with care.
          </p>
          <Link to="/shop" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
