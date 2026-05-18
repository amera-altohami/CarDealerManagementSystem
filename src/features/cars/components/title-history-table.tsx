import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'
import { type TitleHistoryEntry } from '../types/title'
import { TitleBadge } from './title-badge'

type TitleHistoryTableProps = {
  history: TitleHistoryEntry[]
}

export function TitleHistoryTable({ history }: TitleHistoryTableProps) {
  const { locale } = useI18n()
  const copy =
    locale === 'ar'
      ? {
          title: 'سجل تغيير الملكية',
          previous: 'الملكية السابقة',
          next: 'الملكية الجديدة',
          date: 'تاريخ التغيير',
          updatedBy: 'تم التحديث بواسطة',
          notes: 'ملاحظات',
          empty: 'لا يوجد سجل تغييرات حتى الآن.',
        }
      : {
          title: 'Title Change History',
          previous: 'Previous Title Type',
          next: 'New Title Type',
          date: 'Change Date',
          updatedBy: 'Updated By',
          notes: 'Notes',
          empty: 'No title changes yet.',
        }

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{copy.previous}</TableHead>
                <TableHead>{copy.next}</TableHead>
                <TableHead>{copy.date}</TableHead>
                <TableHead>{copy.updatedBy}</TableHead>
                <TableHead>{copy.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length ? (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <TitleBadge titleType={entry.previousTitleType} />
                    </TableCell>
                    <TableCell>
                      <TitleBadge titleType={entry.newTitleType} />
                    </TableCell>
                    <TableCell>{entry.changeDate}</TableCell>
                    <TableCell>{entry.updatedBy}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {entry.notes?.trim() || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    {copy.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

