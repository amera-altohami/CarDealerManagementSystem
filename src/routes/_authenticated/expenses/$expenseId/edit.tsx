import { createFileRoute } from '@tanstack/react-router'
import { ExpenseEdit } from '@/features/expenses/edit'

export const Route = createFileRoute('/_authenticated/expenses/$expenseId/edit')({
  component: ExpenseEditRoute,
})

function ExpenseEditRoute() {
  const { expenseId } = Route.useParams()

  return <ExpenseEdit expenseId={expenseId} />
}
