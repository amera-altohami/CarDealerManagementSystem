import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateCurrentProfile } from '@/services/profileService'

const accountFormSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  phone: z.string().default(''),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const defaultValues: AccountFormValues = {
  fullName: '',
  email: '',
  phone: '',
}

export function AccountForm() {
  const { t } = useI18n()
  const profile = useAuthStore((state) => state.auth.profile)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema) as Resolver<AccountFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    })
  }, [form, profile])

  const updateMutation = useMutation({
    mutationFn: updateCurrentProfile,
    onSuccess: () => {
      toast.success('Account updated successfully.')
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update account.'
      toast.error(message)
    },
  })

  function onSubmit(data: AccountFormValues) {
    updateMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fullName')}</FormLabel>
              <FormControl>
                <Input placeholder='Maya Saleh' {...field} />
              </FormControl>
              <FormDescription>
                This is the name shown across the system.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormDescription>
                This email is used for Firebase sign in.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <Input placeholder='+1 (214) 555-0184' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? t('saveChanges') : 'Update account'}
        </Button>
      </form>
    </Form>
  )
}
