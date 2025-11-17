import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import Footer from '../components/Footer'
import BannerRotator from '../components/BannerRotator'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom pharmacy icon
const pharmacyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a" width="24" height="24">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
})

// Locate button component
const LocateButton = () => {
  const map = useMap()

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 15)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please check your browser settings.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <button
      onClick={handleLocate}
      className="absolute top-2 right-2 z-[1000] bg-green-800 hover:bg-green-900 text-white p-2 rounded-full shadow-lg transition-colors"
      title="Locate me"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  )
}

const PharmacyLocator = () => {
  const { user } = useAuth()
  const [pharmacies, setPharmacies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([0, 0])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mapMode, setMapMode] = useState('standard')
  const [medicineSuggestions, setMedicineSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [distanceRange, setDistanceRange] = useState(50) // km
  const [minStock, setMinStock] = useState(1)
  const [sortBy, setSortBy] = useState('distance') // 'distance' or 'availability'
  const [allMedicines, setAllMedicines] = useState([])

  // Static stats for the locator page
  const stats = { pharmacies: 1250, medicines: 50000, locations: 150 }

  useEffect(() => {
    fetchPharmacies()
    getUserLocation()
    fetchAllMedicines()
  }, [])

  const fetchAllMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('name')
        .gt('stock', 0)

      if (error) throw error
      setAllMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('status', 'approved')

      if (error) throw error
      setPharmacies(data || [])
    } catch (error) {
      console.error('Error fetching pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const handleSearchInput = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length > 1) {
      const filtered = allMedicines
        .filter(medicine =>
          medicine.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
      setMedicineSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (medicineName) => {
    setSearchTerm(medicineName)
    setShowSuggestions(false)
    searchMedicines(medicineName)
  }

  const searchMedicines = async (overrideTerm = null) => {
    const term = overrideTerm || searchTerm
    if (!term || typeof term !== 'string' || !term.trim()) return

    try {
      let query = supabase
        .from('medicines')
        .select(`
          *,
          pharmacies (
            id,
            name,
            location,
            latitude,
            longitude
          )
        `)
        .ilike('name', `%${term}%`)
        .gte('stock', minStock)

      const { data, error } = await query

      if (error) throw error

      // Group by pharmacy and apply filters
      const pharmacyMap = new Map()
      data.forEach(item => {
        if (item.pharmacies) {
          const distance = userLocation && item.pharmacies.latitude ?
            calculateDistance(userLocation.lat, userLocation.lng, item.pharmacies.latitude, item.pharmacies.longitude) : 0

          if (distance <= distanceRange) {
            if (!pharmacyMap.has(item.pharmacies.id)) {
              pharmacyMap.set(item.pharmacies.id, {
                ...item.pharmacies,
                medicines: [],
                distance: distance
              })
            }
            pharmacyMap.get(item.pharmacies.id).medicines.push(item)
          }
        }
      })

      let filteredPharmacies = Array.from(pharmacyMap.values())

      // Apply sorting
      if (sortBy === 'distance') {
        filteredPharmacies.sort((a, b) => a.distance - b.distance)
      } else if (sortBy === 'availability') {
        filteredPharmacies.sort((a, b) => b.medicines.length - a.medicines.length)
      }

      setPharmacies(filteredPharmacies)
    } catch (error) {
      console.error('Error searching medicines:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDistanceRange(50)
    setMinStock(1)
    setSortBy('distance')
    setShowSuggestions(false)
    fetchPharmacies() // Reset to all pharmacies
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getDirections = (pharmacy) => {
    if (!pharmacy.latitude || !pharmacy.longitude) {
      alert('Pharmacy location not available')
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`
          window.open(directionsUrl, '_blank')
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback: open maps with destination only
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`
          window.open(directionsUrl, '_blank')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser. Opening maps with destination only.')
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`
      window.open(directionsUrl, '_blank')
    }
  }

  const sortedPharmacies = pharmacies.sort((a, b) => {
    if (userLocation && a.latitude && b.latitude) {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
      return distA - distB
    }
    return 0
  })

  const getTileLayer = (mode) => {
    switch (mode) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }
      case 'live':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-xl animate-pulse">Loading Pharmacy Locator...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">

      <BannerRotator />

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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">Find Medicines Near You</h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white max-w-xl">AI-driven pharmacy locator with real-time availability, distance tracking, and instant medicine search across Africa.</p>

              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-800 text-white rounded-md shadow-lg hover:bg-green-900 transition">Get Started</Link>
                <Link to="#search" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-md shadow-lg hover:bg-white/90 transition">Search Medicines</Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.pharmacies.toLocaleString()}+</div>
                  <div className="text-xs sm:text-sm text-white">Pharmacies</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.medicines.toLocaleString()}+</div>
                  <div className="text-xs sm:text-sm text-white">Medicines</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.locations}</div>
                  <div className="text-xs sm:text-sm text-white">Locations</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-md">
                <div className="rounded-xl shadow-xl overflow-hidden bg-white/15 backdrop-blur-md p-4 border border-white/10">
                  <img src="/locator-preview.png" alt="Pharmacy Locator preview" className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-green-100 opacity-40 blur-2xl" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 relative z-10">
        {/* Search Section */}
        <div id="search" className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in-up delay-300 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Search for Medicines</h2>

          {/* Search Input with Suggestions */}
          <div className="relative mb-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter medicine name..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => e.key === 'Enter' && searchMedicines()}
                />
                {showSuggestions && medicineSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {medicineSuggestions.map((medicine, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                        onClick={() => selectSuggestion(medicine.name)}
                      >
                        {medicine.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={searchMedicines}
                className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Distance Range (km)</label>
                <select
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Stock</label>
                <select
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={1}>1+ units</option>
                  <option value={5}>5+ units</option>
                  <option value={10}>10+ units</option>
                  <option value={20}>20+ units</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="distance">Distance</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in-up delay-400 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Interactive Pharmacy Map</h2>

          {/* Map Controls */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Map View Options</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setMapMode('standard')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  mapMode === 'standard'
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Standard
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  mapMode === 'satellite'
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="m12 1 0 6m6-6-6 6m6 6-6-6m-6 6 6-6"/>
                </svg>
                Satellite
              </button>
              <button
                onClick={() => setMapMode('terrain')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  mapMode === 'terrain'
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V8a2 2 0 012-2h4a2 2 0 012 2v13M21 8a2 2 0 00-2-2h-4a2 2 0 00-2 2v13M3 3h18" />
                </svg>
                Terrain
              </button>
              <button
                onClick={() => setMapMode('live')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  mapMode === 'live'
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9" />
                </svg>
                Live View
              </button>
            </div>
          </div>

          <div className="h-80 rounded-lg border border-gray-300 overflow-hidden relative">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : [-2, 30]}
              zoom={userLocation ? 13 : 8}
              style={{ height: '100%', width: '100%' }}
              className="leaflet-container rounded-lg"
              zoomControl={true}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked={mapMode === 'standard'} name="Standard">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked={mapMode === 'satellite'} name="Satellite">
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked={mapMode === 'terrain'} name="Terrain">
                  <TileLayer
                    attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked={mapMode === 'live'} name="Live View">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              {sortedPharmacies.map((pharmacy) => (
                pharmacy.latitude && pharmacy.longitude ? (
                  <Marker
                    key={pharmacy.id}
                    position={[pharmacy.latitude, pharmacy.longitude]}
                    icon={pharmacyIcon}
                  >
                    <Popup className="custom-popup">
                      <div className="text-center p-2">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">{pharmacy.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{pharmacy.location}</p>
                        {userLocation && (
                          <p className="text-sm text-green-600 font-medium mb-2">
                            {calculateDistance(userLocation.lat, userLocation.lng, pharmacy.latitude, pharmacy.longitude).toFixed(1)} km away
                          </p>
                        )}
                        {pharmacy.medicines && pharmacy.medicines.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Available medicines:</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {pharmacy.medicines.slice(0, 3).map((medicine, index) => (
                                <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {medicine.name}
                                </span>
                              ))}
                              {pharmacy.medicines.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">+{pharmacy.medicines.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              ))}
              <LocateButton />
            </MapContainer>
          </div>
        </div>

        {/* Pharmacy List */}
        <div className="animate-fade-in-up delay-500">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-12">Nearby Pharmacies</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-in-left">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{pharmacy.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{pharmacy.location}</p>
                    {userLocation && pharmacy.latitude && (
                      <p className="text-green-600 text-sm font-medium">
                        {calculateDistance(userLocation.lat, userLocation.lng, pharmacy.latitude, pharmacy.longitude).toFixed(1)} km away
                      </p>
                    )}
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                {pharmacy.medicines && pharmacy.medicines.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Available medicines:</p>
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.medicines.slice(0, 4).map((medicine, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          {medicine.name}
                        </span>
                      ))}
                      {pharmacy.medicines.length > 4 && (
                        <span className="text-xs text-gray-500">+{pharmacy.medicines.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => getDirections(pharmacy)}
                  className="w-full bg-green-800 hover:bg-green-900 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PharmacyLocator
