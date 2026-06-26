import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  changeUserPassword,
  getPasswordChangeErrorMessage,
} from '@/services/authService'
import { DEFAULT_MANAGED_USER_PASSWORD } from '@/services/usersService'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  clearLastLoginAttempt,
  getLastLoginAttempt,
} from '../../login-attempt-storage'

const formSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email.' : undefined,
    }),
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(1, 'New password is required.')
      .min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.newPassword !== DEFAULT_MANAGED_USER_PASSWORD, {
    message: 'New password cannot be the default password.',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password confirmation does not match.',
    path: ['confirmPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof formSchema>

export function ChangePasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const lastLoginAttempt = getLastLoginAttempt()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: lastLoginAttempt.email,
      currentPassword: lastLoginAttempt.password,
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const attempt = getLastLoginAttempt()

      if (attempt.email) {
        form.setValue('email', attempt.email)
      }

      if (attempt.password) {
        form.setValue('currentPassword', attempt.password)
      }
    }, 100)

    return () => window.clearTimeout(timeoutId)
  }, [form])

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true)

    try {
      await changeUserPassword(
        values.email,
        values.currentPassword,
        values.newPassword
      )
      form.reset()
      clearLastLoginAttempt()
      toast.success(
        'Password changed successfully. Please log in with your new password.'
      )
      navigate({ to: '/sign-in', replace: true })
    } catch (error) {
      toast.error(getPasswordChangeErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete='off'
                  placeholder='name@example.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='off'
                  placeholder='********'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='new-password'
                  placeholder='********'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='new-password'
                  placeholder='********'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <KeyRound />}
          Change password
        </Button>
        <Link
          to='/sign-in'
          className='text-center text-sm font-medium text-muted-foreground hover:opacity-75'
        >
          Back to sign in
        </Link>
      </form>
    </Form>
  )
}
