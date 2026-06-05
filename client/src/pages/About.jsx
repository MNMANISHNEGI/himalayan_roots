import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mountain, Users, Leaf, Heart } from 'lucide-react'

const MOUNTAIN = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80'
const FARM = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&q=80'
const VILLAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'

export default function About() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={MOUNTAIN} alt="Himalayan mountains" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-forest-950/65" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-earth-300 font-medium mb-2 tracking-wider uppercase text-sm">Our Story</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Rooted in the Mountains
            </h1>
          </div>
        </div>
      </div>

      {/* Origin story */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-4xl font-bold text-forest-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Where It All Began
              </h2>
              <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                It started with a bag of Rajma. A friend brought some beans back from a trek to Harshil — a remote valley near the Gangotri glacier — and made a simple dal that stopped the dinner table cold.
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                Nothing we had bought from a store or market had ever tasted like that. It made us ask: where has food like this been all our lives? And why isn't it reaching people who would love it?
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                Himalayan Roots was born from that question. We spent months trekking to remote villages in Uttarakhand and Himachal Pradesh, meeting farmers who had been growing extraordinary food for generations — food that was never making it to the cities because the supply chains didn't reach that high.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We built those supply chains. We built relationships with farming families. And we built a promise — that every product we sell will be as close to the source as possible, as honest as the mountains themselves.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={FARM} alt="Himalayan farm" className="rounded-2xl w-full h-56 object-cover shadow-lg" />
              <img src={VILLAGE} alt="Mountain village" className="rounded-2xl w-full h-56 object-cover shadow-lg mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-forest-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>What We Stand For</h2>
            <p className="text-forest-300 text-lg">Our principles guide every decision, from farm to doorstep</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Mountain size={32} />, title: 'Altitude First', desc: 'We only source from high altitudes — where slow growth, glacial water, and extreme seasons produce unmatched quality.' },
              { icon: <Leaf size={32} />, title: 'Purely Organic', desc: 'No pesticides, no chemicals, no shortcuts. Traditional farming methods have kept these soils pure for centuries.' },
              { icon: <Users size={32} />, title: 'Farmer First', desc: 'We pay farmers 40–60% above market rates. When they thrive, their land thrives, and so does our food.' },
              { icon: <Heart size={32} />, title: 'Heritage Preservation', desc: 'We actively work to document and preserve rare seed varieties that industrial agriculture has abandoned.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-forest-800 rounded-2xl flex items-center justify-center mx-auto mb-5 text-earth-400">
                  {icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-3">{title}</h3>
                <p className="text-forest-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-20 bg-earth-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-forest-900 mb-14" style={{ fontFamily: 'Playfair Display, serif' }}>Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              ['50+', 'Farm Families', 'Directly partnered with and supported'],
              ['8,000+', 'Feet avg altitude', 'Of our source farms'],
              ['9+', 'Products', 'Authentic Himalayan varieties'],
              ['3,000+', 'Happy Customers', 'Across India'],
            ].map(([n, t, d]) => (
              <div key={t}>
                <div className="text-5xl font-bold text-earth-500 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                <div className="font-bold text-forest-900 mb-1">{t}</div>
                <div className="text-gray-400 text-sm">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mountain-gradient text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Taste the Difference</h2>
          <p className="text-forest-200 mb-8">Join thousands of families who've discovered the extraordinary flavours of the Himalayas.</p>
          <Link to="/shop" className="btn-secondary inline-flex items-center gap-2">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
