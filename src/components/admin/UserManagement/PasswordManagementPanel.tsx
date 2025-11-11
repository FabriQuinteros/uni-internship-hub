import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StudentService } from '@/services/studentService'
import { User } from '@/types/user'
import { UserWithActions } from '@/types/password-management'

const PasswordManagementPanel = () => {
  // Estados
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserWithActions[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Datos de ejemplo
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@estudiantes.utn.edu.ar',
      role: 'student' as const
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria.garcia@empresa.com',
      role: 'organization' as const
    },
    {
      id: '3',
      name: 'Carlos López',
      email: 'carlos.lopez@estudiantes.utn.edu.ar',
      role: 'student' as const
    },
    {
      id: '4',
      name: 'Tech Solutions SA',
      email: 'rrhh@techsolutions.com',
      role: 'organization' as const
    },
    {
      id: '5',
      name: 'Admin Principal',
      email: 'admin@utn.edu.ar',
      role: 'admin' as const
    }
  ]

  const handleResetPasswordClick = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }, [])

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulamos una llamada a la API con datos de ejemplo
      const data = mockUsers
      const usersWithActions = data.map(user => ({
        ...user,
        actions: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResetPasswordClick(user)}
          >
            Forzar Restablecimiento
          </Button>
        )
      }))
      setUsers(usersWithActions)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [mockUsers, toast, handleResetPasswordClick])

  // Cargar usuarios
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleConfirmReset = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      await StudentService.forcePasswordReset(selectedUser.email)
      toast({
        title: "Éxito",
        description: "Se ha enviado el correo de restablecimiento",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el correo de restablecimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Contraseñas</h2>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.actions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Restablecimiento</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea forzar el restablecimiento de contraseña para el usuario{' '}
                <span className="font-semibold">{selectedUser?.email}</span>?
                <br />
                Se enviará un correo con las instrucciones.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmReset}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default PasswordManagementPanel