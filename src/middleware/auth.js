import { useAuth } from '../composables/useAuth.js'

export function requireAuth(to, from, next) {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated.value) {
    console.log('✅ User authenticated, allowing access to:', to.path)
    next()
  } else {
    console.log('🔒 Access denied - Authentication required for:', to.path)
    next('/login')
  }
}

export function redirectIfAuthenticated(to, from, next) {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated.value) {
    console.log('✅ User already authenticated - Redirecting to dashboard from:', to.path)
    next('/')
  } else {
    console.log('🔓 User not authenticated, showing login page')
    next()
  }
}