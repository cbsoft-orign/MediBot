import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Modal component for editing pharmacy details with location picker
const PharmacyModal = ({ isOpen, onClose, onSave, pharmacy }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
    latitude: null,
    longitude: null
  })
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState([-1.9441, 30.0619]) // Default to Kigali, Rwanda
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        location: pharmacy.location || '',
        email: pharmacy.email || '',
        phone: pharmacy.phone || '',
        latitude: pharmacy.latitude || null,
        longitude: pharmacy.longitude || null
      })
      if (pharmacy.latitude && pharmacy.longitude) {
        setMapCenter([pharmacy.latitude, pharmacy.longitude])
        setSelectedLocation([pharmacy.latitude, pharmacy.longitude])
      }
    }
  }, [pharmacy, isOpen])

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setSelectedLocation([lat, lng])
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving pharmacy:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Pharmacy Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter pharmacy address"
              ></textarea>
            </div>
          </div>

          {/* Location Picker Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-md font-medium text-gray-800">Set Pharmacy Location</h4>
                <p className="text-sm text-gray-600">Click on the map to set the exact location of your pharmacy</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>

            {showMap && (
              <div className="mb-4">
                <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-10"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onClick={handleMapClick} />
                    {selectedLocation && (
                      <Marker position={selectedLocation}>
                        <Popup>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">Pharmacy Location</div>
                            <div className="text-sm text-gray-600">
                              Lat: {selectedLocation[0].toFixed(6)}<br />
                              Lng: {selectedLocation[1].toFixed(6)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedLocation ? (
                    <span className="text-green-600 font-medium">
                      ✓ Location selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                    </span>
                  ) : (
                    <span>Click on the map to set your pharmacy location</span>
                  )}
                </div>
              </div>
            )}

            {/* Coordinates Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                  placeholder="Auto-filled from map"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                  placeholder="Auto-filled from map"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Map click handler component
const MapClickHandler = ({ onClick }) => {
  const map = useMapEvents({
    click: onClick,
  })
  return null
}

// Modal component for adding/editing sales
const SaleModal = ({ isOpen, onClose, onSave, editingSale, medicines, pharmacyId }) => {
  const [saleItems, setSaleItems] = useState([])
  const [customer_name, setCustomerName] = useState('')
  const [customer_phone, setCustomerPhone] = useState('')
  const [saleLoading, setSaleLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (editingSale) {
      // For editing single sales (backward compatibility)
      setSaleItems([{
        medicine_id: editingSale.medicine_id || '',
        quantity: editingSale.quantity || 1,
        unit_price: editingSale.total_amount / editingSale.quantity || 0,
        total: editingSale.total_amount || 0
      }])
      setCustomerName(editingSale.customer_name || '')
      setCustomerPhone(editingSale.customer_phone || '')
    } else {
      setSaleItems([])
      setCustomerName('')
      setCustomerPhone('')
    }
  }, [editingSale, isOpen])

  const addMedicineItem = (medicineId) => {
    const medicine = medicines.find(med => med.id === medicineId)
    if (!medicine) return

    const existingItem = saleItems.find(item => item.medicine_id === medicineId)
    if (existingItem) {
      updateQuantity(existingItem.medicine_id, existingItem.quantity + 1)
    } else {
      const newItem = {
        medicine_id: medicineId,
        quantity: 1,
        unit_price: medicine.price,
        total: medicine.price
      }
      setSaleItems([...saleItems, newItem])
    }
    setSearchTerm('')
  }

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(medicineId)
      return
    }

    const medicine = medicines.find(med => med.id === medicineId)
    if (!medicine || newQuantity > medicine.stock) return

    setSaleItems(saleItems.map(item =>
      item.medicine_id === medicineId
        ? { ...item, quantity: newQuantity, total: (item.unit_price * newQuantity).toFixed(2) }
        : item
    ))
  }

  const removeItem = (medicineId) => {
    setSaleItems(saleItems.filter(item => item.medicine_id !== medicineId))
  }

  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)
  }

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !saleItems.some(item => item.medicine_id === medicine.id)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saleItems.length === 0) return

    setSaleLoading(true)
    try {
      // For multi-medicine sales, we'll create separate sale records
      const salePromises = saleItems.map(item => {
        const saleData = {
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: parseFloat(item.total),
          customer_name: customer_name,
          customer_phone: customer_phone,
          pharmacy_id: pharmacyId
        }
        return onSave(saleData)
      })

      await Promise.all(salePromises)
      onClose()
    } catch (error) {
      console.error('Error saving sales:', error)
    } finally {
      setSaleLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingSale ? 'Edit Sale' : 'Record New Sale'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Search and Add */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Medicine</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and add medicines..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && filteredMedicines.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredMedicines.map(medicine => (
                    <button
                      key={medicine.id}
                      type="button"
                      onClick={() => addMedicineItem(medicine.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{medicine.name}</div>
                      <div className="text-sm text-gray-500">${medicine.price} (Stock: {medicine.stock})</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Medicines List */}
          {saleItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Medicines</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {saleItems.map(item => {
                  const medicine = medicines.find(med => med.id === item.medicine_id)
                  return (
                    <div key={item.medicine_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{medicine?.name}</div>
                        <div className="text-sm text-gray-600">${item.unit_price} each</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center"
                          disabled={item.quantity >= (medicine?.stock || 0)}
                        >
                          +
                        </button>
                        <span className="w-16 text-right font-medium">${item.total}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.medicine_id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Total Amount */}
          {saleItems.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">${getTotalAmount()}</span>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={customer_name}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={customer_phone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saleLoading || saleItems.length === 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saleLoading ? 'Saving...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal component for generating invoices
const InvoiceModal = ({ isOpen, onClose, sale, pharmacy }) => {
  if (!isOpen || !sale) return null

  const medicine = sale.medicines || {}
  const totalAmount = sale.total_amount || 0

  const generateInvoicePDF = async () => {
    const element = document.getElementById('invoice-content')
    if (!element) return

    // Temporarily remove height restrictions to capture all content including buttons
    const originalMaxHeight = element.style.maxHeight
    const originalOverflow = element.style.overflow
    element.style.maxHeight = 'none'
    element.style.overflow = 'visible'

    // Hide the action buttons for PDF generation
    const actionButtons = element.querySelector('.flex.space-x-3')
    const originalDisplay = actionButtons ? actionButtons.style.display : ''
    if (actionButtons) {
      actionButtons.style.display = 'none'
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: element.scrollHeight,
        width: element.scrollWidth
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`invoice-${sale.id.toString().padStart(6, '0')}.pdf`)
    } catch (error) {
      console.error('Error generating invoice PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      // Restore original styles
      element.style.maxHeight = originalMaxHeight
      element.style.overflow = originalOverflow
      if (actionButtons) {
        actionButtons.style.display = originalDisplay
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div id="invoice-content" className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="MediBot Logo" className="h-12 w-12 bg-white rounded-lg p-1" />
              <div>
                <h1 className="text-3xl font-bold">INVOICE</h1>
                <p className="text-green-100 text-sm">Sale #{sale.id.toString().padStart(6, '0')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Pharmacy and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Pharmacy Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                From
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-lg">{pharmacy?.name}</p>
                <p className="text-gray-600">{pharmacy?.location}</p>
                <p className="text-gray-600">{pharmacy?.email}</p>
                <p className="text-gray-600">{pharmacy?.phone}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Bill To
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-lg">{sale.customer_name || 'Walk-in Customer'}</p>
                {sale.customer_phone && <p className="text-gray-600">{sale.customer_phone}</p>}
              </div>
            </div>
          </div>

          {/* Sale Details Table */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Sale Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{medicine.name || 'Unknown Medicine'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sale.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${sale.unit_price || (totalAmount / sale.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Total and Date */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Date:</span>
              </div>
              <p className="text-gray-900 font-medium">
                {new Date(sale.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800 mr-8">Total Amount:</span>
                <span className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-500">Thank you for your business!</p>
                <p className="text-xs text-gray-400 mt-1">Generated by MediBot Health Ai & Network</p>
              </div>
              <div className="flex space-x-3 print:hidden">
                <button
                  onClick={generateInvoicePDF}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal component for adding/editing medicines
const MedicineModal = ({ isOpen, onClose, onSave, editingMedicine, pharmacyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        description: editingMedicine.description || '',
        price: editingMedicine.price || '',
        stock: editingMedicine.stock || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: ''
      })
    }
  }, [editingMedicine, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const medicineData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        pharmacy_id: pharmacyId
      }
      await onSave(medicineData)
      onClose()
    } catch (error) {
      console.error('Error saving medicine:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingMedicine ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Icon components (using inline SVGs for simplicity)
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const OverviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
)

const MedicineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

const StaffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SalesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PharmacyAdminDashboard = () => {
  const { signOut, user } = useAuth()
  const [medicines, setMedicines] = useState([])
  const [staff, setStaff] = useState([])
  const [pharmacy, setPharmacy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pharmacyId, setPharmacyId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [showPharmacyModal, setShowPharmacyModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sales, setSales] = useState([])
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)

  useEffect(() => {
    fetchPharmacyId()
  }, [user])

  useEffect(() => {
    if (pharmacyId) {
      fetchMedicines()
      fetchStaff()
      fetchPharmacy()
      fetchSales()
    } else {
      setLoading(false)
    }
  }, [pharmacyId])

  const fetchPharmacyId = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('pharmacy_admin_profiles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .single()
      if (error) throw error
      setPharmacyId(data.pharmacy_id)
    } catch (error) {
      console.error('Error fetching pharmacy ID:', error)
      setLoading(false)
    }
  }

  const fetchMedicines = async () => {
    if (!pharmacyId) return
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('name')
      if (error) throw error
      setMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const fetchPharmacy = async () => {
    if (!pharmacyId) return
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', pharmacyId)
        .single()
      if (error) throw error
      setPharmacy(data)
    } catch (error) {
      console.error('Error fetching pharmacy:', error)
    }
  }

  const fetchStaff = async () => {
    if (!pharmacyId) return
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('name')
      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSales = async () => {
    if (!pharmacyId) return
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          medicines (name)
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
  }

  const updateStock = async (id, newStock) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ stock: newStock })
        .eq('id', id)
      if (error) throw error
      fetchMedicines()
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const addMedicine = async (medicineData) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .insert([medicineData])
      if (error) throw error
      fetchMedicines()
    } catch (error) {
      console.error('Error adding medicine:', error)
      throw error
    }
  }

  const addSale = async (saleData) => {
    try {
      const { error } = await supabase
        .from('sales')
        .insert([saleData])
      if (error) throw error
      fetchSales()
      // Update stock after sale
      const medicine = medicines.find(med => med.id === saleData.medicine_id)
      if (medicine) {
        await updateStock(medicine.id, medicine.stock - saleData.quantity)
      }
    } catch (error) {
      console.error('Error recording sale:', error)
      throw error
    }
  }

  const editMedicine = async (medicineData) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: medicineData.name,
          description: medicineData.description,
          price: medicineData.price,
          stock: medicineData.stock
        })
        .eq('id', editingMedicine.id)
      if (error) throw error
      fetchMedicines()
    } catch (error) {
      console.error('Error editing medicine:', error)
      throw error
    }
  }

  const deleteMedicine = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchMedicines()
    } catch (error) {
      console.error('Error deleting medicine:', error)
    }
  }

  const editPharmacy = async (pharmacyData) => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({
          name: pharmacyData.name,
          location: pharmacyData.location,
          email: pharmacyData.email,
          phone: pharmacyData.phone,
          latitude: pharmacyData.latitude,
          longitude: pharmacyData.longitude
        })
        .eq('id', pharmacyId)
      if (error) throw error
      fetchPharmacy()
    } catch (error) {
      console.error('Error editing pharmacy:', error)
      throw error
    }
  }

  const editSale = async (saleData) => {
    try {
      // Get the current sale to know old values
      const { data: currentSale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', editingSale.id)
        .single()
      if (fetchError) throw fetchError

      // Adjust stock for old and new values
      if (currentSale.medicine_id !== parseInt(saleData.medicine_id) || currentSale.quantity !== parseInt(saleData.quantity)) {
        // Add back old quantity to old medicine
        const oldMedicine = medicines.find(med => med.id === currentSale.medicine_id)
        if (oldMedicine) {
          await updateStock(oldMedicine.id, oldMedicine.stock + currentSale.quantity)
        }

        // Subtract new quantity from new medicine
        const newMedicine = medicines.find(med => med.id === parseInt(saleData.medicine_id))
        if (newMedicine) {
          await updateStock(newMedicine.id, newMedicine.stock - parseInt(saleData.quantity))
        }
      }

      // Update the sale
      const { error } = await supabase
        .from('sales')
        .update({
          medicine_id: parseInt(saleData.medicine_id),
          quantity: parseInt(saleData.quantity),
          total_amount: parseFloat(saleData.total_amount),
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone
        })
        .eq('id', editingSale.id)
      if (error) throw error
      fetchSales()
    } catch (error) {
      console.error('Error editing sale:', error)
      throw error
    }
  }

  const deleteSale = async (id) => {
    if (!confirm('Are you sure you want to delete this sale? This will restore the stock.')) return
    try {
      // Get the sale to restore stock
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError

      // Restore stock
      const medicine = medicines.find(med => med.id === sale.medicine_id)
      if (medicine) {
        await updateStock(medicine.id, medicine.stock + sale.quantity)
      }

      // Delete the sale
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
    }
  }

  const exportReportsToPDF = async () => {
    const element = document.getElementById('reports-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`pharmacy-reports-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <img src="/logo.png" alt="MediBot Logo" className="h-24 w-24 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin" style={{animationDuration: '1s'}}></div>
        </div>
        <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden mt-6 shadow-inner">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 animate-progress rounded-full"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in as a pharmacy admin to access this dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!pharmacyId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Pharmacy Assigned</h2>
          <p className="text-gray-600 mb-6">Your account is not associated with any pharmacy. Please contact your administrator.</p>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-lg flex flex-col fixed md:relative inset-y-0 left-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-200">
          <img src="/logo.png" alt="MediBot Logo" className="h-30 w-auto mx-auto" />
          <h1 className="text-lg font-semibold text-gray-800 text-center mt-2">{pharmacy ? pharmacy.name : 'Pharmacy Admin'}</h1>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setActiveTab('overview')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <OverviewIcon />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('medicines')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'medicines'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <MedicineIcon />
                <span>Medicines & Stock</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('staff')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'staff'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <StaffIcon />
                <span>Staff Management</span>
              </button>
            </li>
             <li>
              <button
                onClick={() => {
                  setActiveTab('sales')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'sales'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <SalesIcon />
                <span>Sales</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('reports')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'reports'
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ReportsIcon />
                <span>Reports</span>
              </button>
            </li>
           
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </aside>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
              <div className="px-6 py-5 sm:px-8 flex justify-between items-center">
                <div>
                  <h3 className="text-xl leading-6 font-semibold text-gray-800 flex items-center">
                    <OverviewIcon />
                    <span className="ml-2">Dashboard Overview</span>
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600">
                    Quick overview of pharmacy operations and key metrics.
                  </p>
                </div>
                <button
                  onClick={() => setShowPharmacyModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Pharmacy</span>
                </button>
              </div>
              <div className="px-6 py-5 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300">
                    <h4 className="text-sm font-medium text-blue-800">Total Medicines</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{medicines.length}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-blue-600 text-sm">Active inventory</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300">
                    <h4 className="text-sm font-medium text-green-800">Total Staff</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{staff.length}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-green-600 text-sm">Team members</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300">
                    <h4 className="text-sm font-medium text-purple-800">Total Stock Value</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">${medicines.reduce((sum, med) => sum + (med.price * med.stock), 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-purple-600 text-sm">Current value</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300">
                    <h4 className="text-sm font-medium text-orange-800">Low Stock Items</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{medicines.filter(med => med.stock <= 5).length}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-orange-600 text-sm">Need attention</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
              <div className="px-6 py-5 sm:px-8">
                <h3 className="text-lg leading-6 font-semibold text-gray-800">Pharmacy Information</h3>
              </div>
              <div className="px-6 py-5 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{pharmacy?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{pharmacy?.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{pharmacy?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{pharmacy?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
                <div className="px-6 py-5 sm:px-8">
                  <h3 className="text-lg leading-6 font-semibold text-gray-800">Stock Levels by Medicine</h3>
                  <p className="mt-1 text-sm text-gray-600">Individual medicine stock quantities</p>
                </div>
                <div className="px-6 py-5 sm:p-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={medicines.slice(0, 10).map(med => ({
                          name: med.name.length > 15 ? med.name.substring(0, 15) + '...' : med.name,
                          stock: med.stock,
                          fullName: med.name
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                          stroke="#6b7280"
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [value, 'Stock Quantity']}
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        />
                        <Bar
                          dataKey="stock"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
                <div className="px-6 py-5 sm:px-8">
                  <h3 className="text-lg leading-6 font-semibold text-gray-800">Stock Categories</h3>
                  <p className="mt-1 text-sm text-gray-600">Distribution by stock levels</p>
                </div>
                <div className="px-6 py-5 sm:p-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Low Stock 0-5',
                              value: medicines.filter(med => med.stock <= 5).length,
                              color: '#ef4444'
                            },
                            {
                              name: 'Medium Stock 6-20',
                              value: medicines.filter(med => med.stock > 5 && med.stock <= 20).length,
                              color: '#f59e0b'
                            },
                            {
                              name: 'High Stock 21+',
                              value: medicines.filter(med => med.stock > 20).length,
                              color: '#10b981'
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { color: '#ef4444' },
                            { color: '#f59e0b' },
                            { color: '#10b981' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
              <div className="px-6 py-5 sm:px-8">
                <h3 className="text-lg leading-6 font-semibold text-gray-800">Recent Activity</h3>
              </div>
              <div className="px-6 py-5 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Stock updated for Aspirin</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">New staff member added</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Monthly report generated</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'medicines' && (
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl leading-6 font-semibold text-gray-800 flex items-center">
                    <MedicineIcon />
                    <span className="ml-2">Medicine Inventory</span>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">Manage your pharmacy's medicine stock and inventory</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Medicine</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search medicines by name or description..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 sm:px-8">
              {medicines.length === 0 ? (
                <div className="text-center py-12">
                  <MedicineIcon />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first medicine.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Medicine</span>
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {medicines.filter(medicine =>
                    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((medicine) => (
                    <li key={medicine.id} className="py-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-800">{medicine.name}</h4>
                          <p className="text-sm text-gray-600">{medicine.description}</p>
                          <p className="text-sm text-gray-500">Price: <span className="text-green-800 font-semibold">${medicine.price}</span></p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            medicine.stock > 10 ? 'bg-green-100 text-green-800 border border-green-200' :
                            medicine.stock > 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            Stock: {medicine.stock}
                          </span>
                          <input
                            type="number"
                            min="0"
                            className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            defaultValue={medicine.stock}
                            onBlur={(e) => updateStock(medicine.id, parseInt(e.target.value))}
                          />
                          <button
                            onClick={() => {
                              setEditingMedicine(medicine)
                              setShowModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit medicine"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteMedicine(medicine.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete medicine"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {activeTab === 'staff' && (
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-8">
              <h3 className="text-xl leading-6 font-semibold text-gray-800 flex items-center">
                <StaffIcon />
                <span className="ml-2">Staff Members</span>
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {staff.map((member) => (
                <li key={member.id} className="px-6 py-4 sm:px-8 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-800">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {member.status || 'Active'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl leading-6 font-semibold text-gray-800 flex items-center">
                    <ReportsIcon />
                    <span className="ml-2">Reports & Analytics</span>
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600">
                    Generate and view pharmacy reports.
                  </p>
                </div>
                <button
                  onClick={exportReportsToPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
            <div id="reports-content" className="px-6 py-5 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300">
                  <h4 className="text-sm font-medium text-blue-800">Total Stock Value</h4>
                  <p className="text-3xl font-bold text-gray-800 mt-2">${medicines.reduce((sum, med) => sum + (med.price * med.stock), 0).toLocaleString()}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-blue-600 text-sm">{medicines.length} items</span>
                    <span className="text-gray-500 text-sm ml-2">in inventory</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300">
                  <h4 className="text-sm font-medium text-green-800">Staff Members</h4>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{staff.length}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-green-600 text-sm">Active</span>
                    <span className="text-gray-500 text-sm ml-2">team members</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300">
                  <h4 className="text-sm font-medium text-purple-800">Low Stock Alerts</h4>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{medicines.filter(med => med.stock <= 5).length}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-purple-600 text-sm">Need attention</span>
                    <span className="text-gray-500 text-sm ml-2">items low on stock</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Stock Value by Medicine</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medicines.map((medicine) => (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.stock}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${medicine.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${(medicine.price * medicine.stock).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'sales' && (
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl leading-6 font-semibold text-gray-800 flex items-center">
                    <SalesIcon />
                    <span className="ml-2">Sales Management</span>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">Record and manage pharmacy sales transactions</p>
                </div>
                <button
                  onClick={() => setShowSaleModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Record Sale</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 sm:px-8">
              {sales.length === 0 ? (
                <div className="text-center py-12">
                  <SalesIcon />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No sales recorded</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by recording your first sale.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowSaleModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Record Sale</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.medicines?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.total_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sale.customer_name && sale.customer_phone ? `${sale.customer_name} (${sale.customer_phone})` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedSale(sale)
                                setShowInvoiceModal(true)
                              }}
                              className="text-green-600 hover:text-green-800 mr-2"
                              title="Generate Invoice"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setEditingSale(sale)
                                setShowSaleModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              title="Edit sale"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSale(sale.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete sale"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Medicine Modal */}
        <MedicineModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingMedicine(null)
          }}
          onSave={editingMedicine ? editMedicine : addMedicine}
          editingMedicine={editingMedicine}
          pharmacyId={pharmacyId}
        />
        {/* Pharmacy Modal */}
        <PharmacyModal
          isOpen={showPharmacyModal}
          onClose={() => setShowPharmacyModal(false)}
          onSave={editPharmacy}
          pharmacy={pharmacy}
        />
        {/* Sale Modal */}
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => {
            setShowSaleModal(false)
            setEditingSale(null)
          }}
          onSave={editingSale ? editSale : addSale}
          editingSale={editingSale}
          medicines={medicines}
          pharmacyId={pharmacyId}
        />
        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false)
            setSelectedSale(null)
          }}
          sale={selectedSale}
          pharmacy={pharmacy}
        />
      </main>
    </div>
  )
}

export default PharmacyAdminDashboard