import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, redirectIfAuthenticated } from '../middleware/auth.js'

// Views
import LoginPage from '../views/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import ChartsPage from '../views/ChartsPage.vue'
import SensorsPage from '../views/SensorsPage.vue'
import MotionPage from '../views/MotionPage.vue'
import PatientsPage from '../views/PatientsPage.vue'
import ExercisesPage from '../views/ExercisesPage.vue'
import CurrentExercisePage from '../views/CurrentExercisePage.vue'

const routes = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    beforeEnter: redirectIfAuthenticated,
    meta: { 
      title: 'Login - Nordic Thingy',
      public: true 
    }
  },
  
  // Protected routes
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Dashboard - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/charts',
    name: 'Charts',
    component: ChartsPage,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Charts - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/sensors',
    name: 'Sensors',
    component: SensorsPage,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Sensors - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/motion',
    name: 'Motion',
    component: MotionPage,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Motion - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/patients',
    name: 'Patients',
    component: PatientsPage,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Patients - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: ExercisesPage,
    beforeEnter: requireAuth,
    meta: { 
      title: 'Exercises - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/exercises/:patientId',
    name: 'PatientExercises',
    component: ExercisesPage,
    beforeEnter: requireAuth,
    props: true,
    meta: { 
      title: 'Patient Exercises - Nordic Thingy',
      requiresAuth: true 
    }
  },
  {
    path: '/exercise/:exerciseType/:patientId',
    name: 'CurrentExercise',
    component: CurrentExercisePage,
    beforeEnter: requireAuth,
    props: true,
    meta: { 
      title: 'Exercise Session - Nordic Thingy',
      requiresAuth: true 
    }
  },

  // Catch all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard for title updates and debugging
router.beforeEach((to, from, next) => {
  console.log(`🔄 Navigating from ${from.path} to ${to.path}`)
  document.title = to.meta.title || 'Nordic Thingy - Professional Sensor Monitoring'
  next()
})

router.afterEach((to, from) => {
  console.log(`✅ Navigation completed to ${to.path}`)
})

export default router