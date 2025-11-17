import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Icon components (using inline SVGs for simplicity)
const OverviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
)

const PharmacyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const MedicineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

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

const SuperAdminDashboard = () => {
  const { signOut } = useAuth()
  const [pharmacies, setPharmacies] = useState([])
  const [users, setUsers] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Chart data states
  const [userGrowthData, setUserGrowthData] = useState([])
  const [pharmacyStatusData, setPharmacyStatusData] = useState([])
  const [medicineStockData, setMedicineStockData] = useState([])
  const [activityData, setActivityData] = useState([])

  // Pharmacy CRUD states
  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState(null)
  const [pharmacyForm, setPharmacyForm] = useState({
    name: '',
    email: '',
    location: '',
    phone: ''
  })
  const [staff, setStaff] = useState([])
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [selectedPharmacyForStaff, setSelectedPharmacyForStaff] = useState(null)
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [editingStaff, setEditingStaff] = useState(null)

  // User management states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({
    role: '',
    pharmacyId: '',
    name: ''
  })
  const [updatingUser, setUpdatingUser] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    role: '',
    pharmacyId: '',
    name: ''
  })
  const [creatingUser, setCreatingUser] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [bulkRole, setBulkRole] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  // Admin Management states
  const [adminUsers, setAdminUsers] = useState([])
  const [selectedAdmins, setSelectedAdmins] = useState([])
  const [showAdminBulkActions, setShowAdminBulkActions] = useState(false)
  const [adminBulkAction, setAdminBulkAction] = useState('')
  const [adminBulkRole, setAdminBulkRole] = useState('')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [editingPermissionsUser, setEditingPermissionsUser] = useState(null)
  const [permissionsForm, setPermissionsForm] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [showAssignPharmacyModal, setShowAssignPharmacyModal] = useState(false)
  const [selectedAdminForAssignment, setSelectedAdminForAssignment] = useState(null)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('')
  const [assigningPharmacy, setAssigningPharmacy] = useState(false)

  useEffect(() => {
    fetchPharmacies()
    fetchUsers()
    fetchMedicines()
    fetchAdminUsers()
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    prepareChartData()
  }, [users, pharmacies, medicines])

  // Filter users based on search term and role filter
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  // Prepare chart data when data changes
  const prepareChartData = () => {
    // User growth data (simulated historical data)
    const userGrowth = [
      { month: 'Jan', users: Math.max(0, users.length - 15) },
      { month: 'Feb', users: Math.max(0, users.length - 12) },
      { month: 'Mar', users: Math.max(0, users.length - 8) },
      { month: 'Apr', users: Math.max(0, users.length - 5) },
      { month: 'May', users: Math.max(0, users.length - 3) },
      { month: 'Jun', users: users.length }
    ]
    setUserGrowthData(userGrowth)

    // Pharmacy status distribution
    const approved = pharmacies.filter(p => p.status === 'approved').length
    const pending = pharmacies.filter(p => p.status === 'pending').length
    const rejected = pharmacies.filter(p => p.status === 'rejected').length
    setPharmacyStatusData([
      { name: 'Approved', value: approved, color: '#10B981' },
      { name: 'Pending', value: pending, color: '#F59E0B' },
      { name: 'Rejected', value: rejected, color: '#EF4444' }
    ])

    // Medicine stock data (top 10 medicines by stock)
    const topMedicines = medicines
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(med => ({
        name: med.name.length > 15 ? med.name.substring(0, 15) + '...' : med.name,
        stock: med.stock
      }))
    setMedicineStockData(topMedicines)

    // Activity data (simulated daily activity)
    const activity = [
      { day: 'Mon', logins: Math.floor(Math.random() * 50) + 20 },
      { day: 'Tue', logins: Math.floor(Math.random() * 50) + 20 },
      { day: 'Wed', logins: Math.floor(Math.random() * 50) + 20 },
      { day: 'Thu', logins: Math.floor(Math.random() * 50) + 20 },
      { day: 'Fri', logins: Math.floor(Math.random() * 50) + 20 },
      { day: 'Sat', logins: Math.floor(Math.random() * 30) + 10 },
      { day: 'Sun', logins: Math.floor(Math.random() * 30) + 10 }
    ]
    setActivityData(activity)
  }

  const fetchUsers = async () => {
    try {
      // Fetch all user profiles from different tables with pharmacy info
      const [patients, pharmacyAdmins, superAdmins, healthcareProviders] = await Promise.all([
        supabase.from('patient_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('pharmacy_admin_profiles').select('*, pharmacies(name, location)').order('created_at', { ascending: false }),
        supabase.from('super_admin_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('healthcare_provider_profiles').select('*').order('created_at', { ascending: false })
      ])

      // Get user emails from auth.users
      const userIds = [
        ...(patients.data || []).map(p => p.user_id),
        ...(pharmacyAdmins.data || []).map(p => p.user_id),
        ...(superAdmins.data || []).map(p => p.user_id),
        ...(healthcareProviders.data || []).map(p => p.user_id)
      ]

      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const userEmailMap = {}
      authUsers.users.forEach(user => {
        userEmailMap[user.id] = user.email
      })

      const allUsers = [
        ...(patients.data || []).map(user => ({ ...user, email: userEmailMap[user.user_id], role: 'patient' })),
        ...(pharmacyAdmins.data || []).map(user => ({
          ...user,
          email: userEmailMap[user.user_id],
          role: 'pharmacy_admin',
          assignedPharmacy: user.pharmacies
        })),
        ...(superAdmins.data || []).map(user => ({ ...user, email: userEmailMap[user.user_id], role: 'super_admin' })),
        ...(healthcareProviders.data || []).map(user => ({ ...user, email: userEmailMap[user.user_id], role: 'healthcare_provider' }))
      ]

      setUsers(allUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      // Fetch admin users (pharmacy admins and super admins)
      const [pharmacyAdmins, superAdmins] = await Promise.all([
        supabase.from('pharmacy_admin_profiles').select('*, pharmacies(name, location)').order('created_at', { ascending: false }),
        supabase.from('super_admin_profiles').select('*').order('created_at', { ascending: false })
      ])

      // Get user emails from auth.users
      const userIds = [
        ...(pharmacyAdmins.data || []).map(p => p.user_id),
        ...(superAdmins.data || []).map(p => p.user_id)
      ]

      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const userEmailMap = {}
      authUsers.users.forEach(user => {
        userEmailMap[user.id] = user.email
      })

      const adminUsers = [
        ...(pharmacyAdmins.data || []).map(user => ({
          ...user,
          email: userEmailMap[user.user_id],
          role: 'pharmacy_admin',
          assignedPharmacy: user.pharmacies
        })),
        ...(superAdmins.data || []).map(user => ({ ...user, email: userEmailMap[user.user_id], role: 'super_admin' }))
      ]

      setAdminUsers(adminUsers)
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      // For now, create mock audit logs - in a real app, you'd have an audit_logs table
      const mockAuditLogs = [
        {
          id: 1,
          action: 'User Created',
          user: 'admin@example.com',
          timestamp: new Date().toISOString(),
          details: 'Created new pharmacy admin user'
        },
        {
          id: 2,
          action: 'Pharmacy Approved',
          user: 'admin@example.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Approved MediCare Pharmacy registration'
        }
      ]
      setAuditLogs(mockAuditLogs)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    }
  }

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name')

      if (error) throw error
      setMedicines(data || [])
    } catch (error) {
      console.error('Error fetching medicines:', error)
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

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPharmacies(data || [])
    } catch (error) {
      console.error('Error fetching pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }

  const approvePharmacy = async (id) => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({ status: 'approved' })
        .eq('id', id)

      if (error) throw error
      fetchPharmacies()
    } catch (error) {
      console.error('Error approving pharmacy:', error)
    }
  }

  const rejectPharmacy = async (id) => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error
      fetchPharmacies()
    } catch (error) {
      console.error('Error rejecting pharmacy:', error)
    }
  }

  // Pharmacy CRUD functions
  const createPharmacy = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .insert([{
          name: pharmacyForm.name,
          email: pharmacyForm.email,
          location: pharmacyForm.location,
          phone: pharmacyForm.phone,
          status: 'pending'
        }])
        .select()

      if (error) throw error

      setShowAddPharmacyModal(false)
      setPharmacyForm({ name: '', email: '', location: '', phone: '' })
      fetchPharmacies()
    } catch (error) {
      console.error('Error creating pharmacy:', error)
    }
  }

  const updatePharmacy = async () => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({
          name: pharmacyForm.name,
          email: pharmacyForm.email,
          location: pharmacyForm.location,
          phone: pharmacyForm.phone
        })
        .eq('id', editingPharmacy.id)

      if (error) throw error

      setEditingPharmacy(null)
      setPharmacyForm({ name: '', email: '', location: '', phone: '' })
      fetchPharmacies()
    } catch (error) {
      console.error('Error updating pharmacy:', error)
    }
  }

  const deletePharmacy = async (id) => {
    if (!confirm('Are you sure you want to delete this pharmacy? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('pharmacies')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPharmacies()
    } catch (error) {
      console.error('Error deleting pharmacy:', error)
    }
  }

  const handleEditPharmacy = (pharmacy) => {
    setEditingPharmacy(pharmacy)
    setPharmacyForm({
      name: pharmacy.name,
      email: pharmacy.email,
      location: pharmacy.location,
      phone: pharmacy.phone
    })
  }

  // Staff management functions
  const fetchStaff = async (pharmacyId) => {
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
    }
  }

  const createStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          name: staffForm.name,
          email: staffForm.email,
          role: staffForm.role,
          pharmacy_id: selectedPharmacyForStaff,
          status: 'active'
        }])
        .select()

      if (error) throw error

      setShowStaffModal(false)
      setStaffForm({ name: '', email: '', role: '' })
      fetchStaff(selectedPharmacyForStaff)
    } catch (error) {
      console.error('Error creating staff:', error)
    }
  }

  const updateStaff = async () => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          name: staffForm.name,
          email: staffForm.email,
          role: staffForm.role
        })
        .eq('id', editingStaff.id)

      if (error) throw error

      setEditingStaff(null)
      setStaffForm({ name: '', email: '', role: '' })
      fetchStaff(selectedPharmacyForStaff)
    } catch (error) {
      console.error('Error updating staff:', error)
    }
  }

  const deleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchStaff(selectedPharmacyForStaff)
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember)
    setStaffForm({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role
    })
  }

  const openStaffModal = (pharmacyId) => {
    setSelectedPharmacyForStaff(pharmacyId)
    fetchStaff(pharmacyId)
    setShowStaffModal(true)
  }

  // User management functions
  const createUser = async () => {
    setCreatingUser(true)
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: createUserForm.email,
        password: createUserForm.password,
        user_metadata: {
          role: createUserForm.role
        }
      })

      if (error) throw error

      // Profile creation will be handled by database trigger
      // But we need to update the profile with additional info
      if (createUserForm.role === 'pharmacy_admin') {
        const { error: profileError } = await supabase
          .from('pharmacy_admin_profiles')
          .update({
            pharmacy_id: createUserForm.pharmacyId,
            name: createUserForm.name
          })
          .eq('user_id', data.user.id)

        if (profileError) throw profileError
      } else if (createUserForm.role === 'super_admin') {
        const { error: profileError } = await supabase
          .from('super_admin_profiles')
          .update({ name: createUserForm.name })
          .eq('user_id', data.user.id)

        if (profileError) throw profileError
      } else if (createUserForm.role === 'healthcare_provider') {
        const { error: profileError } = await supabase
          .from('healthcare_provider_profiles')
          .update({ name: createUserForm.name })
          .eq('user_id', data.user.id)

        if (profileError) throw profileError
      } else if (createUserForm.role === 'patient') {
        const { error: profileError } = await supabase
          .from('patient_profiles')
          .update({ name: createUserForm.name })
          .eq('user_id', data.user.id)

        if (profileError) throw profileError
      }

      setShowCreateUserModal(false)
      setCreateUserForm({ email: '', password: '', role: '', pharmacyId: '', name: '' })
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    } finally {
      setCreatingUser(false)
    }
  }

  const updateUser = async () => {
    if (!editingUser) return

    setUpdatingUser(true)
    try {
      // Update the user's role in their profile table
      let updateData = { role: userForm.role, name: userForm.name }

      if (userForm.role === 'pharmacy_admin') {
        updateData.pharmacy_id = userForm.pharmacyId
      }

      let tableName = ''
      if (editingUser.role === 'patient') {
        tableName = 'patient_profiles'
      } else if (editingUser.role === 'pharmacy_admin') {
        tableName = 'pharmacy_admin_profiles'
      } else if (editingUser.role === 'super_admin') {
        tableName = 'super_admin_profiles'
      } else if (editingUser.role === 'healthcare_provider') {
        tableName = 'healthcare_provider_profiles'
      }

      if (tableName) {
        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', editingUser.id)

        if (error) throw error
      }

      // If changing from pharmacy_admin to another role, remove pharmacy assignment
      if (editingUser.role === 'pharmacy_admin' && userForm.role !== 'pharmacy_admin') {
        const { error } = await supabase
          .from('pharmacy_admin_profiles')
          .update({ pharmacy_id: null })
          .eq('id', editingUser.id)

        if (error) throw error
      }

      // If changing to pharmacy_admin, assign pharmacy
      if (userForm.role === 'pharmacy_admin' && editingUser.role !== 'pharmacy_admin') {
        // First, create or update pharmacy_admin_profiles entry
        const { error } = await supabase
          .from('pharmacy_admin_profiles')
          .upsert({
            user_id: editingUser.user_id,
            pharmacy_id: userForm.pharmacyId,
            name: userForm.name || editingUser.email,
            email: editingUser.email
          })

        if (error) throw error
      }

      setShowEditUserModal(false)
      setEditingUser(null)
      setUserForm({ role: '', pharmacyId: '', name: '' })
      fetchUsers() // Refresh the users list
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    } finally {
      setUpdatingUser(false)
    }
  }

  const deleteUser = async (userId, userRole) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      // Delete from profile table first
      let tableName = ''
      if (userRole === 'patient') {
        tableName = 'patient_profiles'
      } else if (userRole === 'pharmacy_admin') {
        tableName = 'pharmacy_admin_profiles'
      } else if (userRole === 'super_admin') {
        tableName = 'super_admin_profiles'
      } else if (userRole === 'healthcare_provider') {
        tableName = 'healthcare_provider_profiles'
      }

      if (tableName) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('user_id', userId)

        if (error) throw error
      }

      // Delete from auth.users
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }

  const resetPassword = async (email) => {
    setResettingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      alert('Password reset email sent successfully!')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error sending password reset email. Please try again.')
    } finally {
      setResettingPassword(false)
    }
  }

  const bulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) return

    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.user_id === userId)
        if (user) {
          await deleteUser(userId, user.role)
        }
      }
      setSelectedUsers([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert('Error deleting some users. Please try again.')
    }
  }

  const bulkUpdateRole = async () => {
    if (selectedUsers.length === 0 || !bulkRole) return

    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.user_id === userId)
        if (user) {
          // Update role logic similar to updateUser
          let tableName = ''
          if (user.role === 'patient') {
            tableName = 'patient_profiles'
          } else if (user.role === 'pharmacy_admin') {
            tableName = 'pharmacy_admin_profiles'
          } else if (user.role === 'super_admin') {
            tableName = 'super_admin_profiles'
          } else if (user.role === 'healthcare_provider') {
            tableName = 'healthcare_provider_profiles'
          }

          if (tableName) {
            const { error } = await supabase
              .from(tableName)
              .update({ role: bulkRole })
              .eq('user_id', userId)

            if (error) throw error
          }
        }
      }
      setSelectedUsers([])
      setShowBulkActions(false)
      setBulkRole('')
      fetchUsers()
    } catch (error) {
      console.error('Error in bulk update:', error)
      alert('Error updating some users. Please try again.')
    }
  }

  const exportUsers = () => {
    const csvData = filteredUsers.map(user => ({
      Name: user.name || 'N/A',
      Email: user.email,
      Role: user.role,
      Pharmacy: user.assignedPharmacy?.name || 'N/A',
      'Created At': new Date(user.created_at).toLocaleDateString()
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Advanced Sidebar */}
      <aside className={`bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 h-full z-40 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="MediBot Logo" className="h-30 w-auto" />
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {sidebarCollapsed ? <MenuIcon /> : <CloseIcon />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <OverviewIcon />
              {!sidebarCollapsed && <span>Overview</span>}
            </button>

            <button
              onClick={() => setActiveTab('pharmacies')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'pharmacies'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <PharmacyIcon />
              {!sidebarCollapsed && <span>Pharmacy Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <UsersIcon />
              {!sidebarCollapsed && <span>User Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('medicines')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'medicines'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <MedicineIcon />
              {!sidebarCollapsed && <span>Medicine Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <AnalyticsIcon />
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-green-50 text-green-800 border-r-4 border-green-800'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
            >
              <AdminIcon />
              {!sidebarCollapsed && <span>Admin Management</span>}
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome back, Admin
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SA</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Overview Cards */}
        {activeTab === 'overview' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">System Overview</h2>
                <p className="text-gray-600 text-lg">Monitor your pharmacy network performance and key metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                <button
                  onClick={() => {
                    fetchPharmacies()
                    fetchUsers()
                    fetchMedicines()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Enhanced Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div
                onClick={() => setActiveTab('users')}
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-12 -mt-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
                      <UsersIcon />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                      <div className="text-sm text-blue-500 font-medium">Total Users</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold text-sm">+12%</span>
                      <span className="text-gray-500 text-sm">vs last month</span>
                    </div>
                    <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('pharmacies')}
                className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full -mr-12 -mt-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500 p-4 rounded-xl shadow-lg">
                      <PharmacyIcon />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{pharmacies.length}</div>
                      <div className="text-sm text-green-500 font-medium">Total Pharmacies</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold text-sm">+8%</span>
                      <span className="text-gray-500 text-sm">vs last month</span>
                    </div>
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('medicines')}
                className="group relative bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200 rounded-full -mr-12 -mt-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-500 p-4 rounded-xl shadow-lg">
                      <MedicineIcon />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{medicines.length}</div>
                      <div className="text-sm text-purple-500 font-medium">Total Medicines</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold text-sm">+15%</span>
                      <span className="text-gray-500 text-sm">vs last month</span>
                    </div>
                    <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('analytics')}
                className="group relative bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200 rounded-full -mr-12 -mt-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-500 p-4 rounded-xl shadow-lg">
                      <AnalyticsIcon />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">{pharmacies.filter(p => p.status === 'approved').length}</div>
                      <div className="text-sm text-orange-500 font-medium">Approved Pharmacies</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold text-sm">+5%</span>
                      <span className="text-gray-500 text-sm">vs last month</span>
                    </div>
                    <div className="w-16 h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-green-300"
                >
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Create User</div>
                    <div className="text-sm text-gray-500">Add new system users</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowAddPharmacyModal(true)}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <PharmacyIcon />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Add Pharmacy</div>
                    <div className="text-sm text-gray-500">Register new pharmacy</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-purple-300"
                >
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <AnalyticsIcon />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">View Analytics</div>
                    <div className="text-sm text-gray-500">Detailed system reports</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced System Overview Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">System Metrics Overview</h3>
                  <p className="text-gray-600">Comprehensive view of your pharmacy network performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={[
                    { name: 'Total Users', value: users.length, color: '#3B82F6', bgColor: '#DBEAFE' },
                    { name: 'Total Pharmacies', value: pharmacies.length, color: '#10B981', bgColor: '#D1FAE5' },
                    { name: 'Total Medicines', value: medicines.length, color: '#8B5CF6', bgColor: '#EDE9FE' },
                    { name: 'Approved Pharmacies', value: pharmacies.filter(p => p.status === 'approved').length, color: '#F59E0B', bgColor: '#FEF3C7' }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    tickLine={{ stroke: '#D1D5DB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    tickLine={{ stroke: '#D1D5DB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="#065F46"
                  >
                    {[
                      { name: 'Total Users', value: users.length, color: '#3B82F6' },
                      { name: 'Total Pharmacies', value: pharmacies.length, color: '#10B981' },
                      { name: 'Total Medicines', value: medicines.length, color: '#8B5CF6' },
                      { name: 'Approved Pharmacies', value: pharmacies.filter(p => p.status === 'approved').length, color: '#F59E0B' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white border-gray-200 rounded-xl shadow-lg border">
          {/* Pharmacy Management Tab */}
          {activeTab === 'pharmacies' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Pharmacy Management
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage pharmacies, approve registrations, and handle staff.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPharmacyModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Pharmacy</span>
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {pharmacies.map((pharmacy) => (
                  <li key={pharmacy.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-500">{pharmacy.email}</p>
                        <p className="text-sm text-gray-500">{pharmacy.location}</p>
                        <p className="text-sm text-gray-500">Phone: {pharmacy.phone || 'N/A'}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pharmacy.status === 'approved' ? 'bg-green-100 text-green-800' :
                          pharmacy.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pharmacy.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {pharmacy.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approvePharmacy(pharmacy.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectPharmacy(pharmacy.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditPharmacy(pharmacy)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openStaffModal(pharmacy.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Staff
                        </button>
                        <button
                          onClick={() => deletePharmacy(pharmacy.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      User Management
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      View and manage all system users.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create User</span>
                  </button>
                </div>
              </div>
              {/* Search and Filter Controls */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search users by email, name, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="patient">Patient</option>
                      <option value="pharmacy_admin">Pharmacy Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="healthcare_provider">Healthcare Provider</option>
                    </select>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <li key={user.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{user.email}</h4>
                        <p className="text-sm text-gray-500">{user.role}</p>
                        {user.assignedPharmacy && (
                          <p className="text-sm text-gray-500">Pharmacy: {user.assignedPharmacy.name}</p>
                        )}
                        <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setUserForm({
                              role: user.role,
                              pharmacyId: user.assignedPharmacy?.id || ''
                            })
                            setShowEditUserModal(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === number
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medicine Management Tab */}
          {activeTab === 'medicines' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Medicine Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage medicine inventory and stock levels.
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {medicines.map((medicine) => (
                  <li key={medicine.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{medicine.name}</h4>
                        <p className="text-sm text-gray-500">{medicine.description}</p>
                        <p className="text-sm text-gray-500">Stock: {medicine.stock}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={medicine.stock}
                          onChange={(e) => updateStock(medicine.id, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border rounded bg-white border-gray-300 text-gray-900"
                        />
                        <button
                          onClick={() => updateStock(medicine.id, medicine.stock)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Analytics Dashboard
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View system analytics and reports.
              </p>
              <div className="mt-6 space-y-8">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-semibold mb-4">User Growth Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pharmacy Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-semibold mb-4">Pharmacy Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pharmacyStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pharmacyStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Medicine Stock Levels */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-semibold mb-4">Top 10 Medicines by Stock Level</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={medicineStockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="stock" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Activity */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-semibold mb-4">Daily User Activity</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="logins" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Admin Management Tab */}
          {activeTab === 'admin' && (
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Admin Management
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage admin users, permissions, and view audit logs.
                  </p>
                </div>
                {selectedAdmins.length > 0 && (
                  <button
                    onClick={() => setShowAdminBulkActions(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Bulk Actions ({selectedAdmins.length})
                  </button>
                )}
              </div>

              {/* Admin Users List */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h4 className="text-md font-medium text-gray-900">Admin Users</h4>
                </div>
                <ul className="divide-y divide-gray-200">
                  {adminUsers.map((admin) => (
                    <li key={admin.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAdmins.includes(admin.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAdmins([...selectedAdmins, admin.id])
                              } else {
                                setSelectedAdmins(selectedAdmins.filter(id => id !== admin.id))
                              }
                            }}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{admin.email}</h4>
                            <p className="text-sm text-gray-500">Role: {admin.role}</p>
                            {admin.assignedPharmacy && (
                              <p className="text-sm text-gray-500">Pharmacy: {admin.assignedPharmacy.name}</p>
                            )}
                            <p className="text-sm text-gray-500">Created: {new Date(admin.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingPermissionsUser(admin)
                              setPermissionsForm(admin.permissions || [])
                              setShowPermissionModal(true)
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Permissions
                          </button>
                          <button
                            onClick={() => deleteUser(admin.user_id, admin.role)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Audit Logs */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h4 className="text-md font-medium text-gray-900">Audit Logs</h4>
                </div>
                <ul className="divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <li key={log.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                          <p className="text-sm text-gray-500">User: {log.user}</p>
                          <p className="text-sm text-gray-500">{log.details}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        </main>
      </div>

      {/* Add/Edit Pharmacy Modal */}
      {showAddPharmacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); editingPharmacy ? updatePharmacy() : createPharmacy() }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={pharmacyForm.name}
                    onChange={(e) => setPharmacyForm({ ...pharmacyForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={pharmacyForm.email}
                    onChange={(e) => setPharmacyForm({ ...pharmacyForm, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={pharmacyForm.location}
                    onChange={(e) => setPharmacyForm({ ...pharmacyForm, location: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={pharmacyForm.phone}
                    onChange={(e) => setPharmacyForm({ ...pharmacyForm, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPharmacyModal(false)
                    setEditingPharmacy(null)
                    setPharmacyForm({ name: '', email: '', location: '', phone: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  {editingPharmacy ? 'Update' : 'Add'} Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Management Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Staff Management - {pharmacies.find(p => p.id === selectedPharmacyForStaff)?.name}
              </h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mb-4">
              <button
                onClick={() => setEditingStaff(null)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Staff</span>
              </button>
            </div>

            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <p className="text-sm text-gray-500">Role: {member.role}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStaff(member)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Staff Form */}
            {(editingStaff || staff.length === 0 || !staff.some(s => s.id === editingStaff?.id)) && (
              <form onSubmit={(e) => { e.preventDefault(); editingStaff ? updateStaff() : createStaff() }} className="mt-6 border-t pt-6">
                <h4 className="text-md font-semibold mb-4">{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={staffForm.role}
                      onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="assistant">Assistant</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaff(null)
                      setStaffForm({ name: '', email: '', role: '' })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    {editingStaff ? 'Update' : 'Add'} Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit User
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); updateUser() }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="pharmacy_admin">Pharmacy Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="healthcare_provider">Healthcare Provider</option>
                  </select>
                </div>
                {userForm.role === 'pharmacy_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assign Pharmacy</label>
                    <select
                      value={userForm.pharmacyId}
                      onChange={(e) => setUserForm({ ...userForm, pharmacyId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select Pharmacy</option>
                      {pharmacies.filter(p => p.status === 'approved').map((pharmacy) => (
                        <option key={pharmacy.id} value={pharmacy.id}>
                          {pharmacy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false)
                    setEditingUser(null)
                    setUserForm({ role: '', pharmacyId: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updatingUser ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create New User
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); createUser() }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={createUserForm.name}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="patient">Patient</option>
                    <option value="pharmacy_admin">Pharmacy Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="healthcare_provider">Healthcare Provider</option>
                  </select>
                </div>
                {createUserForm.role === 'pharmacy_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assign Pharmacy</label>
                    <select
                      value={createUserForm.pharmacyId}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, pharmacyId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select Pharmacy</option>
                      {pharmacies.filter(p => p.status === 'approved').map((pharmacy) => (
                        <option key={pharmacy.id} value={pharmacy.id}>
                          {pharmacy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setCreateUserForm({ email: '', password: '', role: '', pharmacyId: '', name: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminDashboard
