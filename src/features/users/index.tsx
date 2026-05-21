import { useState } from 'react'
import { UserPlus } from 'lucide-react'
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
import { usersMockData } from './data/usersMockData'

export function Users() {
  const { t } = useI18n()
  const [users, setUsers] = useState<ManagedUser[]>(usersMockData)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null)

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
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...values } : user
        )
      )
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setUsers((currentUsers) => [
        {
          id: `user-${Date.now()}`,
          ...values,
          createdAt: today,
          lastLogin: 'Never',
        },
        ...currentUsers,
      ])
    }

    setFormOpen(false)
    setEditingUser(null)
  }

  const handleToggleStatus = (targetUser: ManagedUser) => {
    if (targetUser.isProtected) return

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === targetUser.id
          ? {
              ...user,
              status: user.status === 'Active' ? 'Disabled' : 'Active',
            }
          : user
      )
    )
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
          data={users}
          onEdit={handleEditUser}
          onDelete={handleRequestDelete}
          onToggleStatus={handleToggleStatus}
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

          setUsers((currentUsers) =>
            currentUsers.filter((user) => user.id !== userToDelete.id)
          )
          setUserToDelete(null)
        }}
      />
    </>
  )
}
