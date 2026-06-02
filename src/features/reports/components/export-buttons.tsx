import { FileDown, Sheet } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function ExportButtons() {
  const { t } = useI18n()

  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        variant='outline'
        onClick={() => toast.info(t('pdfExportPending'))}
      >
        <FileDown className='h-4 w-4' />
        {t('exportPdf')}
      </Button>
      <Button
        variant='outline'
        onClick={() => toast.info(t('excelExportPending'))}
      >
        <Sheet className='h-4 w-4' />
        {t('exportExcel')}
      </Button>
    </div>
  )
}
