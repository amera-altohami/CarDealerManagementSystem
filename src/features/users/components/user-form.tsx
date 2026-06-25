import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  userManagementFormSchema,
  userManagementStatusOptions,
  type UserManagementFormValues,
} from '../data/schema'

type UserFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<UserManagementFormValues>
  onSubmit: (values: UserManagementFormValues) => void
  roleOptions?: UserManagementFormValues['role'][]
}

const defaults: UserManagementFormValues = {
  fullName: '',
  email: '',
  phone: '',
  role: 'USER',
  status: 'Active',
}

const roleLabelKeys: Record<UserManagementFormValues['role'], MessageKey> = {
  SUPER_ADMIN: 'roleSuperAdmin',
  ADMIN: 'roleAdmin',
  USER: 'roleUser',
}

const statusLabelKeys: Record<UserManagementFormValues['status'], MessageKey> =
  {
    Active: 'activeStatus',
    Disabled: 'disabledStatus',
  }

export function UserForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  roleOptions,
}: UserFormProps) {
  const { t } = useI18n()
  const isEdit = Boolean(defaultValues)
  const selectableRoles: UserManagementFormValues['role'][] =
    roleOptions ?? ['USER']
  const form = useForm<UserManagementFormValues>({
    resolver: zodResolver(
      userManagementFormSchema
    ) as Resolver<UserManagementFormValues>,
    defaultValues: { ...defaults, ...defaultValues },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return
    form.reset({ ...defaults, ...defaultValues })
  }, [defaultValues, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? t('editUser') : t('addUser')}</DialogTitle>
          <DialogDescription>
            {isEdit ? t('editUserDesc') : t('addUserDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='user-management-form'
            className='space-y-4'
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values)
              form.reset(defaults)
            })}
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder='Maya Saleh' {...field} />
                  </FormControl>
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
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('role')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectRole')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(roleLabelKeys[role])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('status')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userManagementStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(statusLabelKeys[status])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button type='submit' form='user-management-form'>
            {isEdit ? t('saveChanges') : t('addUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
