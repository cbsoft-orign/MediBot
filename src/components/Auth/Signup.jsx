import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Password validation
    if (password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    const { error } = await signUp(email.trim().toLowerCase(), password, role)
    if (error) {
      alert(`Signup failed: ${error.message}`)
    } else {
      alert('Account created successfully! Check your email for the confirmation link.')
    }
    setLoading(false)
  }

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
              <Link to="/login" className="text-gray-700 hover:text-green-900 transition">Login</Link>
              <Link to="/signup" className="btn-brand px-4 py-2">Get Started</Link>
            </div>
            {/* Mobile Navigation */}
            <div className="flex md:hidden">
              <Link to="/signup" className="inline-flex items-center px-3 py-2 rounded-md bg-green-800 text-white text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="md:w-1/2 h-64 md:h-auto bg-cover bg-center" style={{backgroundImage: 'url(/signup-image.png)'}}></div>
        <div className="md:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
                Join MediBot
              </h2>
              <p className="text-gray-600 text-lg">
                Create your account and start your healthcare journey
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="appearance-none relative block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="patient">Patient</option>
                    <option value="pharmacy_admin">Pharmacy Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="healthcare_provider">Healthcare Provider</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-800 font-medium transition-colors duration-300">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
