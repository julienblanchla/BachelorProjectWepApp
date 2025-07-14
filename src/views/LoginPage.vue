<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">🔬</div>
            <h1>Nordic Thingy</h1>
          </div>
        </div>

        <!-- Login Form -->
        <div v-if="!showRegister" class="login-form">
          <h2>Sign In</h2>
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                required
                autocomplete="email"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="loginForm.rememberMe"
                  type="checkbox"
                  class="checkbox-input"
                >
                <span class="checkbox-text">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              class="btn-login"
              :disabled="isLoading"
            >
              {{ isLoading ? '🔄 Signing in...' : '🔐 Sign In' }}
            </button>
          </form>

          <div class="login-footer">
            <p>Don't have an account?
              <button @click="switchToRegister" class="link-button">
                Create one here
              </button>
            </p>
          </div>
        </div>

        <!-- Register Form -->
        <div v-else class="register-form">
          <h2>Create Account</h2>
          <form @submit.prevent="handleRegister">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  id="firstName"
                  v-model="registerForm.firstName"
                  type="text"
                  class="form-input"
                  placeholder="First name"
                  required
                >
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  id="lastName"
                  v-model="registerForm.lastName"
                  type="text"
                  class="form-input"
                  placeholder="Last name"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <input
                id="regEmail"
                v-model="registerForm.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                required
                autocomplete="email"
              >
            </div>

            <div class="form-group">
              <label for="regPassword">Password</label>
              <div class="password-input">
                <input
                  id="regPassword"
                  v-model="registerForm.password"
                  :type="showRegPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Create a password"
                  required
                  autocomplete="new-password"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showRegPassword = !showRegPassword"
                >
                  {{ showRegPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div class="password-strength">
                <div class="strength-bar" :class="passwordStrength.class">
                  <div class="strength-fill" :style="{ width: passwordStrength.width }"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="password-input">
                <input
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Confirm your password"
                  required
                  autocomplete="new-password"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div v-if="registerForm.confirmPassword && !passwordsMatch" class="error-text">
                Passwords do not match
              </div>
            </div>

            <button
              type="submit"
              class="btn-register"
              :disabled="isLoading || !isFormValid"
            >
              {{ isLoading ? '🔄 Creating account...' : '🚀 Create Account' }}
            </button>
          </form>

          <div class="register-footer">
            <p>Already have an account?
              <button @click="switchToLogin" class="link-button">
                Sign in here
              </button>
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-banner">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-banner">
          <span class="success-icon">✅</span>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { login } = useAuth()

// Reactive state
const showRegister = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const showRegPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Login form
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Register form - Removed role and acceptTerms
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Computed properties
const passwordsMatch = computed(() => {
  return registerForm.password === registerForm.confirmPassword
})

const passwordStrength = computed(() => {
  const password = registerForm.password
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
  
  switch (score) {
    case 0:
    case 1:
      return { width: '20%', class: 'weak', text: 'Very weak' }
    case 2:
      return { width: '40%', class: 'weak', text: 'Weak' }
    case 3:
      return { width: '60%', class: 'medium', text: 'Medium' }
    case 4:
      return { width: '80%', class: 'strong', text: 'Strong' }
    case 5:
      return { width: '100%', class: 'very-strong', text: 'Very strong' }
    default:
      return { width: '0%', class: 'weak', text: 'Very weak' }
  }
})

// Updated form validation - Removed role and acceptTerms checks
const isFormValid = computed(() => {
  return registerForm.firstName.trim() !== '' &&
         registerForm.lastName.trim() !== '' &&
         registerForm.email.trim() !== '' &&
         registerForm.password.length >= 8 &&
         passwordsMatch.value
})

// Methods
const switchToRegister = () => {
  showRegister.value = true
  clearMessages()
}

const switchToLogin = () => {
  showRegister.value = false
  clearMessages()
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const handleLogin = async () => {
  clearMessages()
  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('nordic-thingy-users') || '[]')
    
    // Find user
    const user = storedUsers.find(u => 
      u.email.toLowerCase() === loginForm.email.toLowerCase() &&
      u.password === loginForm.password
    )

    if (user) {
      // Create session data
      const sessionData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        loginTime: new Date().toISOString(),
        rememberMe: loginForm.rememberMe
      }

      // Use auth composable to login
      login(sessionData, loginForm.rememberMe)

      successMessage.value = `Welcome back, ${user.firstName}!`
      
      // Immediate redirect to dashboard
      console.log('🚀 Redirecting to dashboard...')
      
      // Reset form
      Object.assign(loginForm, {
        email: '',
        password: '',
        rememberMe: false
      })
      
      // Redirect immediately
      router.push('/')
      
    } else {
      errorMessage.value = 'Invalid email or password. Please try again.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An error occurred during login. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  clearMessages()
  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Get existing users
    const storedUsers = JSON.parse(localStorage.getItem('nordic-thingy-users') || '[]')
    
    // Check if email already exists
    const existingUser = storedUsers.find(u => 
      u.email.toLowerCase() === registerForm.email.toLowerCase()
    )

    if (existingUser) {
      errorMessage.value = 'An account with this email already exists.'
      return
    }

    // Create new user - Set default role as 'user'
    const newUser = {
      id: `USER_${Date.now()}`,
      firstName: registerForm.firstName.trim(),
      lastName: registerForm.lastName.trim(),
      email: registerForm.email.toLowerCase().trim(),
      password: registerForm.password, // In real app, this would be hashed
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      isActive: true
    }

    // Save user
    storedUsers.push(newUser)
    localStorage.setItem('nordic-thingy-users', JSON.stringify(storedUsers))

    successMessage.value = 'Account created successfully! Please sign in.'
    
    // Reset form and switch to login - Removed role and acceptTerms
    Object.assign(registerForm, {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    setTimeout(() => {
      switchToLogin()
    }, 2000)

  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = 'An error occurred during registration. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.logo h1 {
  margin: 0 0 0.3rem 0;
  font-size: 1.8rem;
  color: #333;
  font-weight: 700;
}

.login-form h2,
.register-form h2 {
  text-align: center;
  margin: 0 0 1.5rem 0;
  color: #333;
  font-weight: 600;
  font-size: 1.4rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.3rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak .strength-fill { background: #dc3545; }
.strength-bar.medium .strength-fill { background: #ffc107; }
.strength-bar.strong .strength-fill { background: #fd7e14; }
.strength-bar.very-strong .strength-fill { background: #28a745; }

.strength-text {
  font-size: 0.8rem;
  color: #666;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-input {
  margin: 0;
  transform: scale(1.1);
}

.checkbox-text {
  color: #555;
}

.btn-login,
.btn-register {
  width: 100%;
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-register {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-login:hover,
.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-login:disabled,
.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-footer,
.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.login-footer p,
.register-footer p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  font-size: inherit;
}

.link-button:hover {
  color: #764ba2;
}

.link {
  color: #667eea;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.error-banner,
.success-banner {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-banner {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.success-banner {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #16a34a;
  border: 1px solid #86efac;
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .login-card {
    padding: 1.2rem;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
}
</style>