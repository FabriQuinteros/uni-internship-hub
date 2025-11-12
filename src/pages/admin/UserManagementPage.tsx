import React from 'react'
import PasswordManagementPanel from '@/components/admin/UserManagement/PasswordManagementPanel'

const UserManagementPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los usuarios del sistema
        </p>
      </div>

      <PasswordManagementPanel />
    </div>
  )
}

export default UserManagementPage