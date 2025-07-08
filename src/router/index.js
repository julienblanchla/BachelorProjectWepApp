import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ChartsPage from '../views/ChartsPage.vue'
import SensorsPage from '../views/SensorsPage.vue'
import MotionPage from '../views/MotionPage.vue'
import PatientsPage from '../views/PatientsPage.vue'
import ExercisesPage from '../views/ExercisesPage.vue'
import CurrentExercisePage from '../views/CurrentExercisePage.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/charts',
    name: 'Charts',
    component: ChartsPage
  },
  {
    path: '/sensors',
    name: 'Sensors',
    component: SensorsPage
  },
  {
    path: '/motion',
    name: 'Motion',
    component: MotionPage
  },
  {
    path: '/patients',
    name: 'Patients',
    component: PatientsPage
  },
  {
    // Route for ExercisesPage without patient ID (general exercises view)
    path: '/exercises',
    name: 'Exercises',
    component: ExercisesPage,
    props: false
  },
  {
    // Route for ExercisesPage with specific patient ID (patient-specific exercises)
    path: '/exercises/:patientId',
    name: 'ExercisesWithPatient',
    component: ExercisesPage,
    props: true
  },
  {
    path: '/exercise/:exerciseType/:patientId',
    name: 'CurrentExercise',
    component: CurrentExercisePage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router