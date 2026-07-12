import { useMemo, useState } from 'react'
import { Plus, Trash2, RotateCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { usePartCatalog } from '../hooks/use-part-catalog'
import { partCatalogCategories } from './part-catalog-data'

type PartCatalogDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartCatalogDialog({
  open,
  onOpenChange,
}: PartCatalogDialogProps) {
  const { locale } = useI18n()
  const {
    catalog,
    createPartCatalogItem,
    deletePartCatalogItem,
    restoreDefaultPartCatalog,
  } = usePartCatalog()
  const [name, setName] = useState('')
  const [category, setCategory] = useState(partCatalogCategories[0]?.label ?? 'Other')

  const groupedCatalog = useMemo(() => {
    return partCatalogCategories.map((group) => ({
      ...group,
      items: catalog.filter((item) => item.category === group.label),
    }))
  }, [catalog])

  const canAdd = name.trim().length > 1

  const handleAdd = async () => {
    const item = await createPartCatalogItem({ name, category })
    if (!item) {
      return
    }

    setName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-3xl overflow-hidden'>
        <DialogHeader>
          <DialogTitle>
            {locale === 'ar' ? 'إدارة قائمة القطع' : 'Manage Parts List'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'أضف قطعًا جديدة أو احذف القطع التي لا تريد ظهورها في القايمة.'
              : 'Add new parts or remove items you no longer want in the picker.'}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-[1fr_220px_auto]'>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>
              {locale === 'ar' ? 'اسم القطعة' : 'Part Name'}
            </p>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={locale === 'ar' ? 'Brake Pads' : 'Brake Pads'}
            />
          </div>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>
              {locale === 'ar' ? 'التصنيف' : 'Category'}
            </p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={locale === 'ar' ? 'اختر التصنيف' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {partCatalogCategories.map((group) => (
                  <SelectItem key={group.label} value={group.label}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-end'>
          <Button
            type='button'
            className='w-full'
            onClick={handleAdd}
            disabled={!canAdd}
            >
              <Plus className='me-2 h-4 w-4' />
              {locale === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </div>

        <div className='flex items-center justify-between gap-3'>
          <p className='text-sm text-muted-foreground'>
            {locale === 'ar'
              ? `عدد القطع في القائمة: ${catalog.length}`
              : `Parts in list: ${catalog.length}`}
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void restoreDefaultPartCatalog()}
          >
            <RotateCcw className='me-2 h-4 w-4' />
            {locale === 'ar' ? 'استرجاع القائمة الافتراضية' : 'Restore defaults'}
          </Button>
        </div>

        <Separator />

        <ScrollArea className='h-[40vh] pr-3'>
          <div className='space-y-4'>
            {groupedCatalog.map((group) => (
              <div key={group.label} className='space-y-2'>
                <div className='flex items-center justify-between gap-3'>
                  <h3 className='text-sm font-semibold'>{group.label}</h3>
                  <Badge variant='secondary'>{group.items.length}</Badge>
                </div>
                <div className='grid gap-2'>
                  {group.items.length ? (
                    group.items.map((item) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between gap-3 rounded-lg border px-3 py-2'
                      >
                        <div className='min-w-0'>
                          <p className='truncate font-medium'>{item.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {item.category}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => void deletePartCatalogItem(item.id)}
                          aria-label={
                            locale === 'ar'
                              ? `حذف ${item.name}`
                              : `Delete ${item.name}`
                          }
                        >
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className='rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground'>
                      {locale === 'ar' ? 'لا توجد قطع في هذا التصنيف.' : 'No items in this category.'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
