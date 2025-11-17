import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import BannerRotator from '../components/BannerRotator'
import Flyer from '../components/Flyer'

const Home = () => {
  const { user } = useAuth()

  // Static stats for the landing; keep numbers representative
  const stats = { pharmacies: 1250, patients: 50000, countries: 15 }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="MediBot Logo" className="h-12 sm:h-16 w-auto mr-3 sm:mr-5" />
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/locator" className="text-gray-700 hover:text-green-900 transition">Find Pharmacy</Link>
              {user ? (
                <Link to="/dashboard" className="inline-flex items-center px-4 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-green-900 transition">Login</Link>
                  <Link to="/signup" className="btn-brand px-4 py-2">Get Started</Link>
                </>
              )}
            </div>
            {/* Mobile Navigation */}
            <div className="flex md:hidden">
              <Link to="/signup" className="inline-flex items-center px-3 py-2 rounded-md bg-green-800 text-white text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 overflow-hidden">
        {/* Background rotator behind the hero */}
        <div className="absolute inset-0 z-0">
          <BannerRotator banners={['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg']} />
          {/* stronger gradient veil to improve readability and match banner tones */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">MediBot — Simplifying healthcare across Africa</h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white max-w-xl">AI-driven pharmacy management, real-time locator, and patient engagement tools — built for scale and reliability.</p>

              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-800 text-white rounded-md shadow-lg hover:bg-green-900 transition">Get Started</Link>
                <Link to="/locator" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-md shadow-lg hover:bg-white/90 transition">Find Pharmacy</Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-800">1250+</div>
                  <div className="text-xs sm:text-sm text-white">Pharmacies</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-800">50k+</div>
                  <div className="text-xs sm:text-sm text-white">Patients</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-800">15</div>
                  <div className="text-xs sm:text-sm text-white">Countries</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-md">
                <div className="rounded-xl shadow-xl overflow-hidden bg-white/15 backdrop-blur-md p-4 border border-white/10">
                  <img src="/hero-preview.png" alt="MediBot preview" className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-100 opacity-40 blur-2xl" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        {/* Pharmacy Services Section */}
        <section className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Pharmacy Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive pharmacy management with real-time inventory, prescription tracking, and seamless patient care coordination.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white border rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory Management</h3>
              <p className="text-gray-600">Real-time stock tracking and automated reordering for essential medicines.</p>
            </div>

            <div className="text-center p-6 bg-white border rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Prescription Processing</h3>
              <p className="text-gray-600">Digital prescription management with instant verification and dispensing.</p>
            </div>

            <div className="text-center p-6 bg-white border rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Patient Support</h3>
              <p className="text-gray-600">24/7 patient assistance with medication guidance and health monitoring.</p>
            </div>
          </div>
        </section>

        {/* Patient Subscription Section */}
        <section className="mt-12 sm:mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Patient Subscription Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the perfect health plan for you and your family with comprehensive coverage and premium benefits.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                <div className="text-3xl font-bold text-green-600 mb-4">500 RWF<span className="text-sm font-normal text-gray-500">/month</span></div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Basic health consultations</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Medicine reminders</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Emergency support</li>
                </ul>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Subscribe Now</button>
              </div>
            </div>

            <div className="bg-white border-2 border-green-500 rounded-lg shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">POPULAR</div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-green-600 mb-4">3000 RWF<span className="text-sm font-normal text-gray-500">/month</span></div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>All Basic features</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Virtual consultations</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Priority pharmacy access</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Home delivery</li>
                </ul>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Subscribe Now</button>
              </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Family Plan</h3>
                <div className="text-3xl font-bold text-green-600 mb-4">7000 RWF<span className="text-sm font-normal text-gray-500">/month</span></div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>All Premium features</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Up to 5 family members</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Family health tracking</li>
                  <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>24/7 family support</li>
                </ul>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Subscribe Now</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Trusted across the continent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 max-w-lg sm:max-w-none mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-golden-400">{stats.pharmacies.toLocaleString()}+</div>
              <div className="text-sm sm:text-base text-gray-600">Pharmacies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-golden-400">{stats.patients.toLocaleString()}+</div>
              <div className="text-sm sm:text-base text-gray-600">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-golden-400">{stats.countries}</div>
              <div className="text-sm sm:text-base text-gray-600">Countries</div>
            </div>
          </div>
        </section>

        {/* Promotional flyer section */}
        <Flyer />
      </main>

      <Footer />
    </div>
  )
}

export default Home
