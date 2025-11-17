import React from 'react'
import { useAuth } from '../context/AuthContext'
import SuperAdminDashboard from './SuperAdminDashboard'
import PharmacyAdminDashboard from './PharmacyAdminDashboard'
import PatientPortal from './PatientPortal'

const Dashboard = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserRole = () => {
    return user?.user_metadata?.role || 'patient'
  }

  const renderDashboard = () => {
    const role = getUserRole()
    switch (role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'pharmacy_admin':
        return <PharmacyAdminDashboard />
      case 'patient':
      default:
        return <PatientPortal />
    }
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  )
}

export default Dashboard
