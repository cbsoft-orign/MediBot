import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PatientPortal = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [diseaseSymptoms, setDiseaseSymptoms] = useState('')
  const [diseasePrediction, setDiseasePrediction] = useState('')
  const [diseaseLoading, setDiseaseLoading] = useState(false)
  const [detectionType, setDetectionType] = useState('text')
  const [vitals, setVitals] = useState({ bloodPressure: '', heartRate: '', temperature: '', weight: '' })
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: '', phone: '', relationship: '' }])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [recentVitals, setRecentVitals] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])


  useEffect(() => {
    fetchPrescriptions()
    fetchRecentVitals()
    fetchRecentAppointments()
  }, [])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch(error => console.error('Error playing video:', error))
    }
  }, [cameraStream])

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPrescriptions(data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    }
  }

  const fetchRecentVitals = async () => {
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      setRecentVitals(data || [])
    } catch (error) {
      console.error('Error fetching recent vitals:', error)
    }
  }

  const fetchRecentAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
        .limit(5)
      if (error) throw error
      setRecentAppointments(data || [])
    } catch (error) {
      console.error('Error fetching recent appointments:', error)
    }
  }

  const saveProfile = async () => {
    try {
      const { error } = await supabase
        .from('patient_profiles')
        .upsert({
          user_id: user.id,
          medical_history: medicalHistory,
          symptoms: symptoms
        })
      if (error) throw error
      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    }
  }

  const getAISuggestion = async () => {
    setLoading(true)
    try {
      // Mock AI response - in real implementation, this would call an AI API
      const mockSuggestions = [
        "Based on your symptoms, consider consulting a healthcare provider. Common recommendations include rest, hydration, and over-the-counter pain relief if appropriate.",
        "Your symptoms suggest you might benefit from seeing a doctor. Please monitor your condition and seek medical attention if symptoms worsen.",
        "For your reported symptoms, consider lifestyle adjustments like improved diet and exercise. However, professional medical advice is recommended.",
        "Your medical history and symptoms warrant professional evaluation. Please consult with a healthcare provider for personalized advice."
      ]
      setAiSuggestion(mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)])
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const predictDisease = async () => {
    setDiseaseLoading(true)
    try {
      // Mock AI disease prediction - in real implementation, this would call an AI API
      const mockDiseases = [
        "Based on your symptoms, you may have a common cold. Rest and hydration are recommended.",
        "Your symptoms suggest possible allergies. Consider antihistamines and consult a doctor if symptoms persist.",
        "This could be influenza. Please monitor your temperature and seek medical attention if fever exceeds 101°F.",
        "Your symptoms indicate possible gastroenteritis. Stay hydrated and consult a healthcare provider.",
        "This might be a respiratory infection. Please see a doctor for proper diagnosis and treatment."
      ]
      setDiseasePrediction(mockDiseases[Math.floor(Math.random() * mockDiseases.length)])
    } catch (error) {
      console.error('Error predicting disease:', error)
    } finally {
      setDiseaseLoading(false)
    }
  }

  const saveVitals = async () => {
    try {
      const { error } = await supabase
        .from('vitals')
        .insert({
          user_id: user.id,
          blood_pressure: vitals.bloodPressure,
          heart_rate: vitals.heartRate,
          temperature: vitals.temperature,
          weight: vitals.weight,
          created_at: new Date()
        })
      if (error) throw error
      alert('Vitals saved successfully!')
      setVitals({ bloodPressure: '', heartRate: '', temperature: '', weight: '' })
    } catch (error) {
      console.error('Error saving vitals:', error)
      alert('Error saving vitals')
    }
  }

  const scheduleAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          status: 'scheduled'
        })
      if (error) throw error
      alert('Appointment scheduled successfully!')
      setAppointmentDate('')
      setAppointmentTime('')
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      alert('Error scheduling appointment')
    }
  }

  const saveEmergencyContacts = async () => {
    try {
      for (const contact of emergencyContacts) {
        if (contact.name && contact.phone) {
          const { error } = await supabase
            .from('emergency_contacts')
            .upsert({
              user_id: user.id,
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship
            })
          if (error) throw error
        }
      }
      alert('Emergency contacts saved successfully!')
    } catch (error) {
      console.error('Error saving emergency contacts:', error)
      alert('Error saving emergency contacts')
    }
  }

  const selectSection = (sectionId) => {
    setActiveSection(sectionId)
  }

  const startCamera = async () => {
    setCameraLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Error accessing camera: ' + error.message)
    } finally {
      setCameraLoading(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      const imageSrc = canvas.toDataURL('image/png')
      setCapturedImage(imageSrc)
    }
  }

  const predictDiseaseFromImage = async () => {
    setDiseaseLoading(true)
    try {
      // Mock AI disease prediction from image - in real implementation, this would call an AI API
      const mockDiseases = [
        "Based on the image analysis, you may have a skin condition. Please consult a dermatologist for proper diagnosis.",
        "The image suggests possible inflammation. Monitor symptoms and seek medical attention if it worsens.",
        "Image analysis indicates potential infection. Please see a healthcare provider for evaluation.",
        "Based on visual inspection, this could be an allergic reaction. Consider antihistamines and consult a doctor.",
        "The captured image shows signs that warrant professional medical examination."
      ]
      setDiseasePrediction(mockDiseases[Math.floor(Math.random() * mockDiseases.length)])
    } catch (error) {
      console.error('Error predicting disease from image:', error)
    } finally {
      setDiseaseLoading(false)
    }
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'subscription', label: 'Subscription', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Health Profile', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'disease-detection', label: 'Disease Detection', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'vitals', label: 'Health Monitoring', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'telemedicine', label: 'Telemedicine', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'health-tips', label: 'Health Tips', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'emergency', label: 'Emergency Contacts', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-48 md:w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-40 md:h-48 lg:h-56 px-4 border-b border-gray-200">
            <img src="/logo.png" alt="MediBot Logo" className="h-40 md:h-48 lg:h-56 w-auto" />
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => selectSection(item.id)}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-green-100 text-green-800 border-r-4 border-green-800'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          {/* User Info & Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-800 font-semibold">P</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email?.split('@')[0] || 'Patient'}
                </p>
                <p className="text-xs text-gray-500 truncate">Patient Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-6" /> {/* Spacer */}
        </div>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeSection === 'overview' && (
              <div className="relative">
                {/* Background gradient inspired by home page */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-25 rounded-2xl -z-10"></div>

                <div className="relative p-8">
                  {/* Header Section */}
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      Your Health Dashboard
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Monitor your health metrics, track appointments, and stay on top of your wellness journey with MediBot's advanced analytics.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="bg-green-100 border border-green-200 rounded-full px-6 py-3">
                        <span className="text-green-800 text-sm font-medium">Real-time Health Monitoring Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Vitals Recorded</p>
                          <p className="text-3xl font-bold text-green-800">{recentVitals.length}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                          <p className="text-3xl font-bold text-green-800">{recentAppointments.filter(app => app.status === 'scheduled').length}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Health Score</p>
                          <p className="text-3xl font-bold text-green-800">85%</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Vitals */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Recent Vitals
                          </h3>
                          <p className="text-sm text-gray-600">
                            Your latest health measurements
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl shadow-lg">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {recentVitals.length > 0 ? (
                          recentVitals.slice(0, 3).map((vital, index) => (
                            <div key={vital.id} className="bg-gradient-to-r from-gray-50 to-green-50 p-5 rounded-xl border border-green-100 hover:border-green-200 transition-colors duration-200">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-900">
                                  {new Date(vital.created_at).toLocaleDateString()}
                                </p>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Blood Pressure</p>
                                  <p className="text-lg font-bold text-green-800">{vital.blood_pressure}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Heart Rate</p>
                                  <p className="text-lg font-bold text-green-800">{vital.heart_rate} BPM</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature</p>
                                  <p className="text-lg font-bold text-green-800">{vital.temperature}°F</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Weight</p>
                                  <p className="text-lg font-bold text-green-800">{vital.weight} lbs</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-gray-500 font-medium">No recent vitals recorded</p>
                            <p className="text-sm text-gray-400 mt-1">Start tracking your health metrics</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Recent Appointments
                          </h3>
                          <p className="text-sm text-gray-600">
                            Your upcoming and recent consultations
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl shadow-lg">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {recentAppointments.length > 0 ? (
                          recentAppointments.slice(0, 3).map((appointment, index) => (
                            <div key={appointment.id} className="bg-gradient-to-r from-gray-50 to-green-50 p-5 rounded-xl border border-green-100 hover:border-green-200 transition-colors duration-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    appointment.status === 'scheduled' ? 'bg-blue-500' :
                                    appointment.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                                  }`}></div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {new Date(appointment.appointment_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold text-green-800">{appointment.appointment_time}</p>
                                  <p className="text-xs text-gray-500">Appointment Time</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Virtual Consultation</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 font-medium">No recent appointments</p>
                            <p className="text-sm text-gray-400 mt-1">Schedule your next consultation</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Health Trends Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Health Trends
                          </h3>
                          <p className="text-sm text-gray-600">
                            Real-time vital signs monitoring
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl shadow-lg">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      {recentVitals.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={recentVitals.map(vital => ({
                              date: new Date(vital.created_at).toLocaleDateString(),
                              heartRate: parseFloat(vital.heart_rate),
                              temperature: parseFloat(vital.temperature),
                              weight: parseFloat(vital.weight)
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '8px',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="heartRate"
                                stroke="#16a34a"
                                strokeWidth={3}
                                name="Heart Rate (BPM)"
                                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="#059669"
                                strokeWidth={3}
                                name="Temperature (°F)"
                                dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-gray-500 font-medium mb-2">No data available for charts</p>
                          <p className="text-sm text-gray-400">Start recording vitals to see your health trends</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Profile */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Health Profile
                      </h3>
                      <p className="text-sm text-gray-600">
                        Record your symptoms and medical history.
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Symptoms
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Describe your current symptoms..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical History
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Enter your medical history..."
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={saveProfile}
                      className="w-full bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors duration-200"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
                {/* Virtual Nurse */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Virtual Nurse Assistant
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get AI-powered health suggestions.
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={getAISuggestion}
                      disabled={loading}
                      className="w-full bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? 'Getting Suggestion...' : 'Get Health Suggestion'}
                    </button>
                    {aiSuggestion && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-900 mb-2">AI Suggestion:</h4>
                        <p className="text-sm text-green-800">{aiSuggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* AI Disease Detection - Futuristic 2050 Design */}
            <div>
              {activeSection === 'disease-detection' && (
                <div className="mt-8 relative overflow-hidden">
                  {/* Background with gradient and particles effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)] animate-pulse"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05),transparent_50%)] animate-pulse delay-1000"></div>
                    {/* Floating particles */}
                    <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-bounce"></div>
                    <div className="absolute top-20 right-20 w-1 h-1 bg-green-300 rounded-full opacity-40 animate-ping"></div>
                    <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-500 rounded-full opacity-50 animate-pulse delay-500"></div>
                  </div>

                  <div className="relative z-10 p-8">
                    {/* Header with glowing effect */}
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-white mb-2 relative">
                        <span className="relative z-10">AI Disease Detection</span>
                        <span className="absolute inset-0 text-green-400 blur-sm opacity-75">AI Disease Detection</span>
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Advanced Neural Analysis • Real-time Diagnostics • 2050 Technology
                      </p>
                      <div className="mt-4 flex justify-center">
                        <div className="bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 backdrop-blur-sm">
                          <span className="text-green-400 text-sm font-medium">Neural Network Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-8">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          detectionType ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-gray-600 text-gray-600'
                        }`}>
                          <span className="text-sm font-bold">1</span>
                        </div>
                        <div className={`w-12 h-0.5 transition-all duration-300 ${
                          detectionType ? 'bg-green-400' : 'bg-gray-600'
                        }`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          (detectionType === 'text' && diseaseSymptoms) || (detectionType === 'camera' && (cameraStream || capturedImage)) ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-gray-600 text-gray-600'
                        }`}>
                          <span className="text-sm font-bold">2</span>
                        </div>
                        <div className={`w-12 h-0.5 transition-all duration-300 ${
                          diseaseLoading ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                        }`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          diseasePrediction ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-gray-600 text-gray-600'
                        }`}>
                          <span className="text-sm font-bold">3</span>
                        </div>
                      </div>
                    </div>

                    {/* Method Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <button
                        onClick={() => setDetectionType('text')}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                          detectionType === 'text'
                            ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/20'
                            : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg transition-all duration-300 ${
                            detectionType === 'text' ? 'bg-green-400/20' : 'bg-gray-700'
                          }`}>
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h4 className="text-white font-semibold text-lg">Text Analysis</h4>
                            <p className="text-gray-400 text-sm">Describe symptoms for AI diagnosis</p>
                          </div>
                        </div>
                        {detectionType === 'text' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-pulse opacity-50"></div>
                        )}
                      </button>

                      <button
                        onClick={() => setDetectionType('camera')}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                          detectionType === 'camera'
                            ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/20'
                            : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg transition-all duration-300 ${
                            detectionType === 'camera' ? 'bg-green-400/20' : 'bg-gray-700'
                          }`}>
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h4 className="text-white font-semibold text-lg">Visual Analysis</h4>
                            <p className="text-gray-400 text-sm">Upload or capture image for diagnosis</p>
                          </div>
                        </div>
                        {detectionType === 'camera' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-pulse opacity-50"></div>
                        )}
                      </button>
                    </div>

                    {/* Input Section */}
                    {detectionType === 'text' && (
                      <div className="mb-8">
                        <div className="relative">
                          <label className="block text-sm font-medium text-green-400 mb-3">
                            Neural Symptom Input
                          </label>
                          <textarea
                            rows={5}
                            className="w-full bg-gray-800/50 border-2 border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 backdrop-blur-sm resize-none"
                            placeholder="Enter detailed symptoms for advanced AI analysis (e.g., fever, cough, headache, fatigue, duration, severity)..."
                            value={diseaseSymptoms}
                            onChange={(e) => setDiseaseSymptoms(e.target.value)}
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                            {diseaseSymptoms.length}/500
                          </div>
                        </div>
                      </div>
                    )}

                    {detectionType === 'camera' && (
                      <div className="mb-8">
                        <div className="space-y-6">
                          {!cameraStream && !capturedImage && (
                            <button
                              onClick={startCamera}
                              disabled={cameraLoading}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {cameraLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Initializing Neural Camera...</span>
                                </div>
                              ) : (
                                'Activate Neural Camera'
                              )}
                            </button>
                          )}

                          {cameraStream && (
                            <div className="space-y-6">
                              <div className="relative max-w-md mx-auto">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  muted
                                  className="w-full border-2 border-green-400/50 rounded-xl shadow-lg shadow-green-400/20"
                                />
                                <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-pulse opacity-30 pointer-events-none"></div>
                              </div>
                              <div className="flex space-x-4 justify-center">
                                <button
                                  onClick={captureImage}
                                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                                >
                                  Capture Neural Image
                                </button>
                                <button
                                  onClick={stopCamera}
                                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
                                >
                                  Deactivate Camera
                                </button>
                              </div>
                            </div>
                          )}

                          {capturedImage && (
                            <div className="space-y-6">
                              <div className="relative max-w-md mx-auto">
                                <img
                                  src={capturedImage}
                                  alt="Neural Capture"
                                  className="w-full border-2 border-green-400/50 rounded-xl shadow-lg shadow-green-400/20"
                                />
                                <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-pulse opacity-30 pointer-events-none"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Analyze Button */}
                    {detectionType && (
                      <div className="text-center mb-8">
                        <button
                          onClick={detectionType === 'text' ? predictDisease : predictDiseaseFromImage}
                          disabled={diseaseLoading || (detectionType === 'text' && !diseaseSymptoms.trim()) || (detectionType === 'camera' && !capturedImage)}
                          className="group relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white px-12 py-4 rounded-full font-bold text-xl transition-all duration-500 transform hover:scale-110 shadow-2xl shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center space-x-3">
                            {diseaseLoading ? (
                              <>
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Neural Analysis in Progress...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Initiate AI Diagnosis</span>
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-0 group-hover:opacity-50 animate-ping"></div>
                        </button>
                      </div>
                    )}

                    {/* Results Section */}
                    {diseasePrediction && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-green-500/5 to-green-400/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gray-800/80 backdrop-blur-sm border border-green-400/30 rounded-2xl p-8 shadow-2xl shadow-green-400/10">
                          <div className="flex items-center justify-center mb-6">
                            <div className="bg-green-400/20 p-4 rounded-full">
                              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          </div>
                          <h4 className="text-2xl font-bold text-center text-white mb-4">Neural Diagnosis Complete</h4>
                          <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-400/30">
                            <p className="text-green-300 text-lg leading-relaxed">{diseasePrediction}</p>
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                              This is an AI-assisted analysis. Always consult healthcare professionals for accurate diagnosis.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                </div>
              )}
            </div>
            <div>
              {/* Health Monitoring */}
              {activeSection === 'vitals' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Health Monitoring
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your vital signs and health metrics.
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure (e.g., 120/80)
                      </label>
                      <input
                        type="text"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="120/80"
                        value={vitals.bloodPressure}
                        onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heart Rate (BPM)
                      </label>
                      <input
                        type="number"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="72"
                        value={vitals.heartRate}
                        onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°F)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="98.6"
                        value={vitals.temperature}
                        onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="150"
                        value={vitals.weight}
                        onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveVitals}
                    className="w-full mt-4 bg-indigo-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-900 transition-colors duration-200"
                  >
                    Save Vitals
                  </button>
                </div>
              )}
            </div>
            {/* Telemedicine */}
            <div>
              {/* Telemedicine */}
              {activeSection === 'telemedicine' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Telemedicine Appointments
                      </h3>
                      <p className="text-sm text-gray-600">
                        Schedule virtual consultations with healthcare providers.
                      </p>
                    </div>
                    <div className="bg-teal-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Time
                      </label>
                      <input
                        type="time"
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={scheduleAppointment}
                    disabled={!appointmentDate || !appointmentTime}
                    className="w-full mt-4 bg-teal-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
            {/* Prescriptions */}
            <div>
              {/* Prescriptions */}
              {activeSection === 'prescriptions' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Prescription History
                        </h3>
                        <p className="text-sm text-gray-600">
                          View your prescription records.
                        </p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                      <li key={prescription.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{prescription.medicine_name}</h4>
                            <p className="text-sm text-gray-600">Dosage: {prescription.dosage}</p>
                            <p className="text-sm text-gray-600">Prescribed by: {prescription.doctor_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              {new Date(prescription.created_at).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Health Tips */}
            <div>
              {/* Health Tips */}
              {activeSection === 'health-tips' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Health Tips & Wellness Advice
                      </h3>
                      <p className="text-sm text-gray-600">
                        Stay healthy with these evidence-based tips and recommendations.
                      </p>
                    </div>
                    <div className="bg-cyan-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-green-900">Heart Health</h4>
                      </div>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>• Aim for 150 minutes of moderate exercise weekly</li>
                        <li>• Maintain a healthy diet low in saturated fats</li>
                        <li>• Monitor blood pressure regularly</li>
                        <li>• Quit smoking and limit alcohol intake</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-blue-900">Nutrition</h4>
                      </div>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>• Eat a variety of colorful fruits and vegetables</li>
                        <li>• Choose whole grains over refined grains</li>
                        <li>• Include lean proteins in your diet</li>
                        <li>• Stay hydrated with water throughout the day</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-purple-900">Sleep & Rest</h4>
                      </div>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>• Aim for 7-9 hours of sleep per night</li>
                        <li>• Maintain a consistent sleep schedule</li>
                        <li>• Create a relaxing bedtime routine</li>
                        <li>• Keep your bedroom cool and dark</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-orange-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-orange-900">Mental Health</h4>
                      </div>
                      <ul className="text-sm text-orange-800 space-y-2">
                        <li>• Practice mindfulness and meditation</li>
                        <li>• Stay connected with friends and family</li>
                        <li>• Engage in hobbies and activities you enjoy</li>
                        <li>• Seek professional help when needed</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-teal-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-teal-900">Disease Prevention</h4>
                      </div>
                      <ul className="text-sm text-teal-800 space-y-2">
                        <li>• Get vaccinated according to guidelines</li>
                        <li>• Practice good hand hygiene</li>
                        <li>• Maintain social distancing when needed</li>
                        <li>• Schedule regular health check-ups</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-pink-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-pink-900">Daily Wellness</h4>
                      </div>
                      <ul className="text-sm text-pink-800 space-y-2">
                        <li>• Take short breaks during work</li>
                        <li>• Practice deep breathing exercises</li>
                        <li>• Maintain good posture</li>
                        <li>• Stay positive and grateful</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Remember</h4>
                    <p className="text-sm text-gray-700">
                      These tips are general recommendations. Always consult with your healthcare provider for personalized advice based on your specific health conditions and needs. Regular check-ups and professional medical guidance are essential for maintaining optimal health.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Emergency Contacts */}
            <div>
              {/* Emergency Contacts */}
              {activeSection === 'emergency' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Emergency Contacts
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add and manage your emergency contact information.
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            placeholder="Contact Name"
                            value={contact.name}
                            onChange={(e) => {
                              const updatedContacts = [...emergencyContacts]
                              updatedContacts[index].name = e.target.value
                              setEmergencyContacts(updatedContacts)
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            placeholder="(123) 456-7890"
                            value={contact.phone}
                            onChange={(e) => {
                              const updatedContacts = [...emergencyContacts]
                              updatedContacts[index].phone = e.target.value
                              setEmergencyContacts(updatedContacts)
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship
                          </label>
                          <input
                            type="text"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            placeholder="e.g., Spouse, Parent"
                            value={contact.relationship}
                            onChange={(e) => {
                              const updatedContacts = [...emergencyContacts]
                              updatedContacts[index].relationship = e.target.value
                              setEmergencyContacts(updatedContacts)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relationship: '' }])}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                      >
                        Add Contact
                      </button>
                      <button
                        onClick={saveEmergencyContacts}
                        className="bg-orange-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-900 transition-colors duration-200"
                      >
                        Save Contacts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Subscription */}
            <div>
              {/* Subscription */}
              {activeSection === 'subscription' && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Subscription Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage your MediBot subscription plan and billing information.
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-green-900">Current Plan</h4>
                          <p className="text-sm text-green-700">MediBot Premium Health Plan</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Cost</p>
                          <p className="text-2xl font-bold text-green-800">$29.99</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Renewal Date</p>
                          <p className="text-lg font-semibold text-gray-900">Dec 15, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-lg font-semibold text-green-800">Auto-renewal On</p>
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Next Billing Date</p>
                          <p className="text-lg font-semibold text-gray-900">December 15, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Amount Due</p>
                          <p className="text-lg font-semibold text-gray-900">$29.99</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">**** **** **** 1234</p>
                            <p className="text-xs text-gray-500">Expires 12/26</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plan Management */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Management</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                          Upgrade Plan
                        </button>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200">
                          Change Plan
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200">
                          Cancel Subscription
                        </button>
                      </div>
                    </div>

                    {/* Subscription History */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Subscription History</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Monthly Payment</p>
                            <p className="text-xs text-gray-500">November 15, 2024</p>
                          </div>
                          <p className="text-sm font-semibold text-green-600">$29.99</p>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Monthly Payment</p>
                            <p className="text-xs text-gray-500">October 15, 2024</p>
                          </div>
                          <p className="text-sm font-semibold text-green-600">$29.99</p>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Plan Upgrade</p>
                            <p className="text-xs text-gray-500">September 1, 2024</p>
                          </div>
                          <p className="text-sm font-semibold text-blue-600">+$10.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PatientPortal