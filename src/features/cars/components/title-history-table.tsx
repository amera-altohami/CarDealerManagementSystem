import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'
import { type TitleHistoryEntry } from '../types/title'
import { TitleBadge } from './title-badge'

type TitleHistoryTableProps = {
  history: TitleHistoryEntry[]
}

export function TitleHistoryTable({ history }: TitleHistoryTableProps) {
  const { t } = useI18n()

  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle>{t('titleChangeHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('previousTitleType')}</TableHead>
                <TableHead>{t('newTitleType')}</TableHead>
                <TableHead>{t('changeDate')}</TableHead>
                <TableHead>{t('updatedBy')}</TableHead>
                <TableHead>{t('notes')}</TableHead>
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
                    {t('noTitleChangesYet')}
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
