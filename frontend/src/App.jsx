import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import EmployeeList from './components/EmployeeList'
import EmployeeForm from './components/EmployeeForm'
import EmployeeDetails from './components/EmployeeDetails'
import Reports from './components/Reports'
import AuditLogs from './components/AuditLogs'
import UserSettings from './components/UserSettings'

const AppContent = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Navigation states within Employee module
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [addingNewEmployee, setAddingNewEmployee] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  // Render Login page if not authenticated
  if (!user) {
    return <Login />
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'employees':
        if (addingNewEmployee) {
          return (
            <EmployeeForm
              onCancel={() => setAddingNewEmployee(false)}
              onSuccess={() => {
                setAddingNewEmployee(false)
                setSelectedEmployeeId(null)
              }}
            />
          )
        }
        if (editingEmployeeId) {
          return (
            <EmployeeForm
              employeeId={editingEmployeeId}
              onCancel={() => setEditingEmployeeId(null)}
              onSuccess={() => {
                setEditingEmployeeId(null)
              }}
            />
          )
        }
        if (selectedEmployeeId) {
          return (
            <EmployeeDetails
              employeeId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
              onEditEmployee={(id) => {
                setEditingEmployeeId(id)
              }}
            />
          )
        }
        return (
          <EmployeeList
            onSelectEmployee={(id) => {
              setSelectedEmployeeId(id)
              setAddingNewEmployee(false)
            }}
            onAddNew={() => {
              setAddingNewEmployee(true)
              setSelectedEmployeeId(null)
            }}
            onEditEmployee={(id) => {
              setEditingEmployeeId(id)
            }}
          />
        )
      case 'reports':
        return <Reports />
      case 'audit':
        return <AuditLogs />
      case 'settings':
        return <UserSettings />
      default:
        return <Dashboard />
    }
  }

  // Handle setting tabs (reset inner employee view states)
  const handleSetActiveTab = (tabId) => {
    setActiveTab(tabId)
    setSelectedEmployeeId(null)
    setAddingNewEmployee(false)
    setEditingEmployeeId(null)
  }

  return (
    <div className="min-h-screen bg-lira-bg flex">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sistema Operacional Online
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Lira RH Manager v1.0.0
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-y-auto">
          {renderActiveTabContent()}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
