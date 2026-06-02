import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type ReportColumn } from '../data/schema'

type ReportTableProps<T> = {
  title: string
  rows: T[]
  columns: ReportColumn<T>[]
  emptyMessage: string
}

export function ReportTable<T>({
  title,
  rows,
  columns,
  emptyMessage,
}: ReportTableProps<T>) {
  return (
    <Card className='border-border/60'>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={column.className}
                        >
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
