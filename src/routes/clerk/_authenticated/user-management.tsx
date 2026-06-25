import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/clerk/_authenticated/user-management')({
  component: RedirectToUsers,
})

function RedirectToUsers() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/users', replace: true })
  }, [navigate])

  return null
}
