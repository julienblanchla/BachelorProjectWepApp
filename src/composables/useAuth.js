import { ref, computed } from 'vue'

// Global state
const currentUser = ref(null)
const isAuthenticated = ref(false)

export function useAuth() {
  // Check if user is logged in on app initialization
  const initAuth = () => {
    try {
      // Check localStorage first (remember me)
      let sessionData = localStorage.getItem('nordic-thingy-session')
      
      // If not found, check sessionStorage
      if (!sessionData) {
        sessionData = sessionStorage.getItem('nordic-thingy-session')
      }

      if (sessionData) {
        const userData = JSON.parse(sessionData)
        
        // Verify session is still valid (optional: add expiration check)
        if (userData && userData.id) {
          currentUser.value = userData
          isAuthenticated.value = true
          console.log('✅ User session restored:', userData.firstName, userData.lastName)
          return true
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error)
    }
    
    return false
  }

  // Login function - REMOVE router dependency from here
  const login = (userData, rememberMe = false) => {
    currentUser.value = userData
    isAuthenticated.value = true

    // Store session
    const sessionData = JSON.stringify(userData)
    
    if (rememberMe) {
      localStorage.setItem('nordic-thingy-session', sessionData)
    } else {
      sessionStorage.setItem('nordic-thingy-session', sessionData)
    }

    console.log('✅ User logged in:', userData.firstName, userData.lastName)
  }

  // Logout function - Accept router as parameter
  const logout = (router) => {
    currentUser.value = null
    isAuthenticated.value = false

    // Clear both storage types
    localStorage.removeItem('nordic-thingy-session')
    sessionStorage.removeItem('nordic-thingy-session')

    console.log('👋 User logged out')
    
    // Redirect to login if router provided
    if (router) {
      router.push('/login')
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser.value?.role === role
  }

  // Get user display name
  const userDisplayName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  // Get user initials
  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    const first = currentUser.value.firstName.charAt(0).toUpperCase()
    const last = currentUser.value.lastName.charAt(0).toUpperCase()
    return `${first}${last}`
  })

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    userDisplayName,
    userInitials,
    initAuth,
    login,
    logout,
    hasRole
  }
}