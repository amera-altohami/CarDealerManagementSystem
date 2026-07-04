import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'
import { canApplyPasswordReset } from '@/services/authService'
import { toast } from 'sonner'

export function ResetPassword() {
  const navigate = useNavigate()
  const { oobCode } = useSearch({ from: '/(auth)/reset-password' })
  const [isValid, setIsValid] = useState<boolean | null>(
    oobCode ? null : false
  )

  useEffect(() => {
    if (!oobCode) {
      return
    }

    let active = true

    canApplyPasswordReset(oobCode)
      .then(() => {
        if (active) setIsValid(true)
      })
      .catch(() => {
        if (active) {
          setIsValid(false)
          toast.error('This password reset link is invalid or expired.')
        }
      })

    return () => {
      active = false
    }
  }, [oobCode])

  useEffect(() => {
    if (isValid === false && !oobCode) {
      navigate({ to: '/forgot-password', replace: true })
    }
  }, [isValid, navigate, oobCode])

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Reset password</CardTitle>
          <CardDescription>
            Choose a new password for your account. The reset link uses the
            secure Firebase action-code flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {oobCode ? (
            <ResetPasswordForm oobCode={oobCode} isValid={isValid} />
          ) : (
            <p className='text-sm text-muted-foreground'>
              Missing reset code. Please request a new password reset link.
            </p>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
