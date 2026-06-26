const LAST_LOGIN_ATTEMPT_KEY = 'auth:last-login-attempt'

type LastLoginAttempt = {
  email: string
  password: string
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function rememberLastLoginAttempt(email: string, password: string) {
  const storage = getSessionStorage()
  if (!storage) return

  storage.setItem(
    LAST_LOGIN_ATTEMPT_KEY,
    JSON.stringify({
      email,
      password,
    })
  )
}

export function getLastLoginAttempt(): LastLoginAttempt {
  const storage = getSessionStorage()
  if (!storage) return { email: '', password: '' }

  const rawValue = storage.getItem(LAST_LOGIN_ATTEMPT_KEY)
  if (!rawValue) return { email: '', password: '' }

  try {
    const value = JSON.parse(rawValue) as Partial<LastLoginAttempt>

    return {
      email: typeof value.email === 'string' ? value.email : '',
      password: typeof value.password === 'string' ? value.password : '',
    }
  } catch {
    return { email: '', password: '' }
  }
}

export function clearLastLoginAttempt() {
  const storage = getSessionStorage()
  if (!storage) return

  storage.removeItem(LAST_LOGIN_ATTEMPT_KEY)
}
