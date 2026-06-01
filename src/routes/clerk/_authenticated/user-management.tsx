/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useAuth, UserButton } from '@clerk/react'
import { ExternalLink, Loader2, UserPlus } from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LearnMore } from '@/components/learn-more'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserForm } from '@/features/users/components/user-form'
import { UsersTable } from '@/features/users/components/users-table'
import {
  type ManagedUser,
  type UserManagementFormValues,
} from '@/features/users/data/schema'
import { usersMockData } from '@/features/users/data/usersMockData'

export const Route = createFileRoute('/clerk/_authenticated/user-management')({
  component: UserManagement,
})

function UserManagement() {
  const { t } = useI18n()
  const [opened, setOpened] = useState(true)
  const [users, setUsers] = useState<ManagedUser[]>(usersMockData)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null)
  const { isLoaded, isSignedIn } = useAuth()

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

  if (!isLoaded) {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='size-8 animate-spin' />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Unauthorized />
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserButton />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('usersManagement')}
            </h1>
            <div className='flex gap-1'>
              <p className='text-muted-foreground'>
                {t('usersManagementDesc')}
              </p>
              <LearnMore
                open={opened}
                onOpenChange={setOpened}
                contentProps={{ side: 'right' }}
              >
                <p>
                  This is the same as{' '}
                  <Link
                    to='/users'
                    className='text-blue-500 underline decoration-dashed underline-offset-2'
                  >
                    '/users'
                  </Link>
                </p>

                <p className='mt-4'>
                  You can sign out or manage/delete your account via the User
                  Profile menu in the top-right corner of the page.
                  <ExternalLink className='inline-block size-4' />
                </p>
              </LearnMore>
            </div>
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

const COUNTDOWN = 5 // Countdown second

function Unauthorized() {
  const navigate = useNavigate()
  const { history } = useRouter()

  const [opened, setOpened] = useState(true)
  const [cancelled, setCancelled] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN)

  // Set and run the countdown conditionally
  useEffect(() => {
    if (cancelled || opened) return
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [cancelled, opened])

  // Navigate to sign-in page when countdown hits 0
  useEffect(() => {
    if (countdown > 0) return
    navigate({ to: '/clerk/sign-in' })
  }, [countdown, navigate])

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>Unauthorized Access</span>
        <p className='text-center text-muted-foreground'>
          You must be authenticated via Clerk{' '}
          <sup>
            <LearnMore open={opened} onOpenChange={setOpened}>
              <p>
                This is the same as{' '}
                <Link
                  to='/users'
                  className='text-blue-500 underline decoration-dashed underline-offset-2'
                >
                  '/users'
                </Link>
                .{' '}
              </p>
              <p>You must first sign in using Clerk to access this route. </p>

              <p className='mt-4'>
                After signing in, you'll be able to sign out or delete your
                account via the User Profile dropdown on this page.
              </p>
            </LearnMore>
          </sup>
          <br />
          to access this resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate({ to: '/clerk/sign-in' })}>
            <ClerkLogo className='invert' /> Sign in
          </Button>
        </div>
        <div className='mt-4 h-8 text-center'>
          {!cancelled && !opened && (
            <>
              <p>
                {countdown > 0
                  ? `Redirecting to Sign In page in ${countdown}s`
                  : `Redirecting...`}
              </p>
              <Button variant='link' onClick={() => setCancelled(true)}>
                Cancel Redirect
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
