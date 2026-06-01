import { createFileRoute } from '@tanstack/react-router'
import { ExpenseDetails } from '@/features/expenses/details'

export const Route = createFileRoute('/_authenticated/expenses/$expenseId/')({
  component: ExpenseDetailsRoute,
})

function ExpenseDetailsRoute() {
  const { expenseId } = Route.useParams()

  return <ExpenseDetails expenseId={expenseId} />
}
