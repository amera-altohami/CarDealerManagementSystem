import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  getCurrentAuthProfile,
  signInWithFirebaseAuth,
  getAuthSignInErrorMessage,
} from '@/services/authService'
import { Loader2, LogIn } from 'lucide-react'
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
  rememberLastLoginAttempt,
} from '../../login-attempt-storage'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(7, 'Password must be at least 7 characters long.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

function normalizeRedirectTarget(redirectTo?: string) {
  if (!redirectTo) {
    return '/'
  }

  try {
    const url = new URL(redirectTo, window.location.origin)

    if (url.origin !== window.location.origin) {
      return '/'
    }

    const path = `${url.pathname}${url.search}${url.hash}`
    return path || '/'
  } catch {
    return redirectTo.startsWith('/') ? redirectTo : '/'
  }
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    rememberLastLoginAttempt(data.email, data.password)

    try {
      await signInWithFirebaseAuth(data.email, data.password)
      const profile = getCurrentAuthProfile()

      if (profile?.mustChangePassword) {
        toast.warning('Please change your default password before continuing.')
        navigate({ to: '/change-password', replace: true })
        return
      }

      toast.success(`Welcome back, ${data.email}!`)
      clearLastLoginAttempt()
      const targetPath = normalizeRedirectTarget(redirectTo)
      navigate({ to: targetPath, replace: true })
    } catch (error) {
      const message = getAuthSignInErrorMessage(error, data.email)
      toast.error(message)
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
                  autoComplete='username'
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
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='current-password'
                  placeholder='********'
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
        <Link
          to='/change-password'
          onClick={() => {
            const values = form.getValues()
            rememberLastLoginAttempt(values.email, values.password)
          }}
          className='text-center text-sm font-medium text-muted-foreground hover:opacity-75'
        >
          Change default password
        </Link>
      </form>
    </Form>
  )
}
