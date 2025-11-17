import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
  <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-16 mt-20 relative overflow-hidden">
      {/* Animated background elements for footer */}
      <div className="absolute inset-0 opacity-10">
  <div className="absolute top-10 left-10 w-32 h-32 bg-primary-600 rounded-full blur-3xl animate-float" style={{opacity: 0.9}}></div>
  <div className="absolute bottom-10 right-10 w-40 h-40 bg-golden-500 rounded-full blur-3xl animate-float delay-300" style={{opacity: 0.8}}></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-light-green-300 rounded-full blur-2xl animate-float delay-500" style={{opacity: 0.85}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Newsletter Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-golden-400 bg-clip-text text-transparent">
            Stay Connected with Healthcare Updates
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get the latest news on healthcare innovations, pharmacy updates, and medical breakthroughs across Africa.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            <button className="px-6 py-3 btn-brand rounded-lg font-medium hover-lift">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 animate-fade-in-up delay-200">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="MediBot Logo" className="h-40 w-auto mr-4 animate-pulse-custom" />
             
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Revolutionizing healthcare delivery across Africa by connecting pharmacies, patients, and healthcare providers through innovative technology and AI-powered solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover-lift">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover-lift">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover-lift">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover-lift">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.013C24.007 5.367 18.641.001.012.017z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
              <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-primary-400 to-golden-400 bg-clip-text text-transparent">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/locator" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-primary-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Find Pharmacy
              </Link></li>
              <li><Link to="/signup" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-primary-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Join as Provider
              </Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-primary-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Login
              </Link></li>
              <li><Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-primary-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Dashboard
              </Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-primary-400 to-golden-400 bg-clip-text text-transparent">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-golden-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Pharmacy Management
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-golden-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Patient Portal
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-golden-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                Smart Locator
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                <span className="w-1 h-1 bg-golden-500 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                AI Assistant
              </a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-primary-400 to-golden-400 bg-clip-text text-transparent">Contact</h4>
            <ul className="space-y-3">
              <li className="text-gray-300 flex items-center">
                <span className="w-1 h-1 bg-light-green-500 rounded-full mr-3"></span>
                support@medibot.com
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-1 h-1 bg-light-green-500 rounded-full mr-3"></span>
                +1 (555) 123-4567
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-1 h-1 bg-light-green-500 rounded-full mr-3"></span>
                123 Healthcare Ave, Medical City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} MediBot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
