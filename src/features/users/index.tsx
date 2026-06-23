import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ProtectedUserDeleteError,
  UserDeleteBlockedError,
  createUser,
  deleteUser,
  disableUser,
  enableUser,
  getUsers,
  updateUser,
} from '@/services/usersService'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserForm } from './components/user-form'
import { UsersTable } from './components/users-table'
import { type ManagedUser, type UserManagementFormValues } from './data/schema'

export function Users() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const usersQuery = useQuery({
    queryKey: ['users'] as const,
    queryFn: getUsers,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null)

  useEffect(() => {
    if (usersQuery.isError) {
      toast.error('Failed to load users.')
    }
  }, [usersQuery.isError])

  const invalidateUserData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['users'] }),
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] }),
    ])
  }

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await invalidateUserData()
      setFormOpen(false)
      setEditingUser(null)
      toast.success('User added successfully.')
    },
    onError: () => {
      toast.error('Failed to save user.')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UserManagementFormValues
    }) => updateUser(id, data),
    onSuccess: async () => {
      await invalidateUserData()
      setFormOpen(false)
      setEditingUser(null)
      toast.success('User updated successfully.')
    },
    onError: () => {
      toast.error('Failed to save user.')
    },
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: (user: ManagedUser) =>
      user.status === 'Active' ? disableUser(user.id) : enableUser(user.id),
    onSuccess: async (_, user) => {
      await invalidateUserData()
      toast.success(
        user.status === 'Active'
          ? 'User disabled successfully.'
          : 'User enabled successfully.'
      )
    },
    onError: () => {
      toast.error('Failed to update user status.')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (user: ManagedUser) => deleteUser(user.id),
    onSuccess: async () => {
      await invalidateUserData()
      setUserToDelete(null)
      toast.success('User deleted successfully.')
    },
    onError: (error) => {
      if (error instanceof ProtectedUserDeleteError) {
        toast.warning('This protected user cannot be deleted.')
        return
      }

      if (error instanceof UserDeleteBlockedError) {
        toast.warning(
          'This user cannot be deleted because related activity records exist. Disable the user instead of deleting to preserve historical records.'
        )
        return
      }

      toast.error('Failed to delete user.')
    },
  })

  const handleAddUser = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleEditUser = (user: ManagedUser) => {
    if (user.isProtected) return

    setEditingUser(user)
    setFormOpen(true)
  }

  const handleSubmit = (values: UserManagementFormValues) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: values })
    } else {
      createUserMutation.mutate(values)
    }
  }

  const handleToggleStatus = (targetUser: ManagedUser) => {
    if (targetUser.isProtected) return

    toggleUserStatusMutation.mutate(targetUser)
  }

  const handleRequestDelete = (user: ManagedUser) => {
    if (user.isProtected) return

    setUserToDelete(user)
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('usersManagement')}
            </h1>
            <p className='text-muted-foreground'>{t('usersManagementDesc')}</p>
          </div>
          <Button onClick={handleAddUser}>
            <UserPlus className='h-4 w-4' />
            {t('addUser')}
          </Button>
        </div>

        <UsersTable
          data={usersQuery.data ?? []}
          onEdit={handleEditUser}
          onDelete={handleRequestDelete}
          onToggleStatus={handleToggleStatus}
          isError={usersQuery.isError}
          isLoading={usersQuery.isLoading}
        />
      </Main>

      <UserForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingUser(null)
          }
        }}
        defaultValues={
          editingUser
            ? {
                fullName: editingUser.fullName,
                email: editingUser.email,
                phone: editingUser.phone,
                role: editingUser.role,
                status: editingUser.status,
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null)
          }
        }}
        title={t('deleteUser')}
        desc={
          <span>
            {t('deleteUserConfirmStart')}{' '}
            <strong>{userToDelete?.fullName ?? ''}</strong>
            {t('deleteUserConfirmEnd')}
          </span>
        }
        destructive
        confirmText={t('delete')}
        cancelBtnText={t('cancel')}
        handleConfirm={() => {
          if (!userToDelete) return
          if (userToDelete.isProtected) return

          deleteUserMutation.mutate(userToDelete)
        }}
      />
    </>
  )
}
