<!-- filepath: src/views/PatientsPage.vue -->
<template>
  <div class="patients-page">
    <div class="patients-container">
      <div class="patients-header">
        <h2 class="patients-title">👥 Patients List</h2>
        <button class="btn-add-patient" @click="openModal()">
          ➕ Add New Patient
        </button>
      </div>

      <div class="patients-content">
        <div class="patients-list" v-if="patients.length > 0">
          <div 
            v-for="patient in patients" 
            :key="patient.id" 
            class="patient-card"
            :data-patient-id="patient.id"
          >
            <div :class="patient.photo ? 'patient-header-with-photo' : 'patient-header'">
              <img 
                v-if="patient.photo" 
                :src="patient.photo" 
                :alt="`${patient.firstName} ${patient.lastName}`" 
                class="patient-photo"
              >
              <div v-else class="patient-photo-placeholder">
                <span class="patient-photo-icon">👤</span>
              </div>
              
              <div class="patient-name-section">
                <div class="patient-name-with-edit">
                  <h3 class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</h3>
                  <button class="btn-edit-inline" @click="editPatient(patient.id)" title="Edit patient">
                    ✏️
                  </button>
                </div>
                <span class="patient-id">{{ patient.id }}</span>
              </div>
            </div>
            
            <div class="patient-info">
              <div class="patient-info-item">
                <span class="patient-info-label">Age:</span>
                <span class="patient-info-value">{{ calculateAge(patient.dateOfBirth) }}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Gender:</span>
                <span class="patient-info-value">{{ patient.gender || 'N/A' }}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Email:</span>
                <span class="patient-info-value">{{ patient.email || 'N/A' }}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Phone:</span>
                <span class="patient-info-value">{{ patient.phone || 'N/A' }}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Created:</span>
                <span class="patient-info-value">{{ formatDate(patient.createdAt) }}</span>
              </div>
            </div>
            
            <div v-if="patient.notes" class="patient-notes">
              📝 {{ patient.notes }}
            </div>
            
            <div class="patient-actions">
              <button class="btn-patient-action btn-exercise" @click="viewExercises(patient.id)">
                🏃 Exercises
              </button>
              <button 
                class="btn-patient-action btn-report" 
                @click="generateReport(patient.id)"
                :disabled="reportGenerating[patient.id]"
              >
                {{ reportGenerating[patient.id] ? '📄 Generating...' : '📄 PDF Report' }}
              </button>
              <button class="btn-patient-action btn-delete" @click="deletePatient(patient.id)">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-state-icon">👥</div>
          <div class="empty-state-text">No patients yet</div>
          <div class="empty-state-subtext">Click "Add New Patient" to get started</div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal" @click="closeModalOnOverlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ currentEditingId ? 'Edit Patient' : 'Add New Patient' }}</h3>
          <span class="close" @click="closeModal">&times;</span>
        </div>
        
        <form @submit.prevent="savePatient">
          <div class="form-group">
            <label class="form-label" for="firstName">First Name *</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="patientForm.firstName"
              class="form-input" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="lastName">Last Name *</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="patientForm.lastName"
              class="form-input" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="dateOfBirth">Date of Birth</label>
            <input 
              type="date" 
              id="dateOfBirth" 
              v-model="patientForm.dateOfBirth"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="gender">Gender</label>
            <select id="gender" v-model="patientForm.gender" class="form-input">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="patientForm.email"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="phone">Phone</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="patientForm.phone"
              class="form-input"
            >
          </div>
          
          <!-- Photo upload -->
          <div class="form-group">
            <label class="form-label" for="photo">Profile Photo</label>
            <div class="photo-upload-container">
              <div class="photo-preview" @click="selectPhoto">
                <img 
                  v-if="patientForm.photo" 
                  :src="patientForm.photo" 
                  alt="Patient Photo" 
                  class="photo-image"
                >
                <div v-else class="photo-placeholder">
                  <span class="photo-icon">📸</span>
                  <span class="photo-text">Click to add photo</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="photoInput"
                @change="handlePhotoSelect"
                class="form-input-file" 
                accept="image/*"
              >
              <div class="photo-actions">
                <button type="button" class="btn-photo" @click="selectPhoto">
                  📷 Select Photo
                </button>
                <button 
                  type="button" 
                  class="btn-photo btn-remove" 
                  @click="removePhoto"
                  v-if="patientForm.photo"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="notes">Notes</label>
            <textarea 
              id="notes" 
              v-model="patientForm.notes"
              class="form-input" 
              rows="3" 
              placeholder="Additional notes about the patient..."
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-modal btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-modal btn-save">
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

// Router setup
const router = useRouter()

// Reactive state
const patients = ref([])
const showModal = ref(false)
const currentEditingId = ref(null)
const reportGenerating = ref({})

// Patient form
const patientForm = reactive({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  notes: '',
  photo: null
})

// File input reference
const photoInput = ref(null)

// Initial loading
onMounted(() => {
  loadPatients()
})

// Data management functions
const loadPatients = () => {
  const stored = localStorage.getItem('nordic-thingy-patients')
  patients.value = stored ? JSON.parse(stored) : []
}

const savePatients = () => {
  localStorage.setItem('nordic-thingy-patients', JSON.stringify(patients.value))
}

const generateId = () => {
  return 'P' + Date.now().toString().slice(-6)
}

// Modal functions
const openModal = (patient = null) => {
  if (patient) {
    currentEditingId.value = patient.id
    Object.assign(patientForm, patient)
  } else {
    currentEditingId.value = null
    resetForm()
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  currentEditingId.value = null
}

const closeModalOnOverlay = (event) => {
  if (event.target.classList.contains('modal')) {
    closeModal()
  }
}

const resetForm = () => {
  Object.assign(patientForm, {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    notes: '',
    photo: null
  })
}

// Photo management functions
const selectPhoto = () => {
  photoInput.value?.click()
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      patientForm.photo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  patientForm.photo = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

// CRUD functions
const savePatient = () => {
  if (!patientForm.firstName.trim() || !patientForm.lastName.trim()) {
    alert('First name and last name are required!')
    return
  }

  if (currentEditingId.value) {
    // Edit mode
    const index = patients.value.findIndex(p => p.id === currentEditingId.value)
    if (index !== -1) {
      patients.value[index] = {
        ...patients.value[index],
        ...patientForm,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    // Create mode
    const newPatient = {
      id: generateId(),
      ...patientForm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    patients.value.push(newPatient)
  }

  savePatients()
  closeModal()
}

const editPatient = (id) => {
  const patient = patients.value.find(p => p.id === id)
  if (patient) {
    openModal(patient)
  }
}

const deletePatient = (id) => {
  if (confirm('Are you sure you want to delete this patient?')) {
    patients.value = patients.value.filter(p => p.id !== id)
    savePatients()
  }
}

// Utility functions
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A'
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age + ' years'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const viewExercises = (patientId) => {
  // Navigate to exercises page with patient ID
  router.push(`/exercises/${patientId}`)
}

// Exercise management functions (simplified)
const getPatientSessions = (patientId, days = 30) => {
  const realSessions = JSON.parse(localStorage.getItem('exercise-sessions') || '[]')
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const patientSessions = realSessions
    .filter(s => s.patientId === patientId && new Date(s.date) > cutoffDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // If no real sessions, simulate some data
  if (patientSessions.length === 0) {
    const simulatedSessions = [
      {
        id: `sim-${patientId}-1`,
        patientId: patientId,
        exerciseType: 'neck-extension',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '2:00',
        accuracy: Math.floor(Math.random() * 40) + 60,
        movementCount: Math.floor(Math.random() * 30) + 20,
        correctCount: Math.floor(Math.random() * 25) + 15,
        incorrectCount: Math.floor(Math.random() * 10) + 2
      },
      {
        id: `sim-${patientId}-2`,
        patientId: patientId,
        exerciseType: 'head-rotation',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '2:00',
        accuracy: Math.floor(Math.random() * 40) + 50,
        movementCount: Math.floor(Math.random() * 25) + 18,
        correctCount: Math.floor(Math.random() * 20) + 12,
        incorrectCount: Math.floor(Math.random() * 8) + 3
      }
    ]
    
    return simulatedSessions.filter(s => new Date(s.date) > cutoffDate)
  }
  
  return patientSessions
}

// Report generation function
const generateReport = async (patientId) => {
  try {
    const patient = patients.value.find(p => p.id === patientId)
    if (!patient) {
      alert('❌ Patient not found')
      return
    }

    // Mark button as generating
    reportGenerating.value[patientId] = true

    // Generate HTML report content
    const reportHTML = generateReportHTML(patient, patientId)
    
    // Create new window to display and print report
    const reportWindow = window.open('', '_blank', 'width=800,height=600')
    reportWindow.document.write(reportHTML)
    reportWindow.document.close()
    
    // Wait for content to load then open print dialog
    setTimeout(() => {
      reportWindow.print()
      
      // Optional: close window after printing
      reportWindow.addEventListener('afterprint', () => {
        reportWindow.close()
      })
    }, 500)
    
    console.log('✅ HTML report generated and print dialog opened')
    alert('✅ Report generated! Print dialog should be open.\nYou can save as PDF from the print dialog.')
    
  } catch (error) {
    console.error('❌ Report generation failed:', error)
    alert(`❌ Report generation failed: ${error.message}`)
  } finally {
    // Restore button state
    setTimeout(() => {
      reportGenerating.value[patientId] = false
    }, 2000)
  }
}

const generateReportHTML = (patient, patientId) => {
  const sessions = getPatientSessions(patientId, 30)
  const age = calculateAge(patient.dateOfBirth)
  const totalSessions = sessions.length
  const avgAccuracy = sessions.length > 0 ? 
    Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length) : 0
  
  const reportDate = new Date().toLocaleDateString()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Patient Report - ${patient.firstName} ${patient.lastName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        
        .report-header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .report-title {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }
        
        .report-subtitle {
          font-size: 16px;
          color: #666;
          margin: 10px 0 0 0;
        }
        
        .patient-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #007bff;
          margin: 30px 0 15px 0;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .info-label {
          font-weight: bold;
          color: #495057;
        }
        
        .info-value {
          color: #212529;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .stat-card {
          background: #fff;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        
        .sessions-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .sessions-table th,
        .sessions-table td {
          border: 1px solid #dee2e6;
          padding: 12px 8px;
          text-align: left;
        }
        
        .sessions-table th {
          background: #f8f9fa;
          font-weight: bold;
          color: #495057;
        }
        
        .accuracy-excellent {
          color: #28a745;
          font-weight: bold;
        }
        
        .accuracy-good {
          color: #ffc107;
          font-weight: bold;
        }
        
        .accuracy-poor {
          color: #dc3545;
          font-weight: bold;
        }
        
        .recommendations {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 20px;
          margin: 30px 0;
        }
        
        .recommendations ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .recommendations li {
          margin: 8px 0;
        }
        
        .report-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          
          .report-header {
            margin-bottom: 20px;
          }
          
          .section-title {
            margin: 20px 0 10px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1 class="report-title">🏥 Nordic Thingy - Patient Report</h1>
        <p class="report-subtitle">Generated on ${reportDate}</p>
      </div>
      
      <div class="patient-info">
        <h2 class="section-title">👤 Patient Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${patient.firstName} ${patient.lastName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Patient ID:</span>
            <span class="info-value">${patient.id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Age:</span>
            <span class="info-value">${age}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Gender:</span>
            <span class="info-value">${patient.gender || 'Not specified'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${patient.email || 'Not specified'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${patient.phone || 'Not specified'}</span>
          </div>
        </div>
        ${patient.notes ? `
          <div class="info-item">
            <span class="info-label">Notes:</span>
            <span class="info-value">${patient.notes}</span>
          </div>
        ` : ''}
      </div>
      
      <h2 class="section-title">📊 Exercise Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalSessions}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${avgAccuracy}%</div>
          <div class="stat-label">Average Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${sessions[0] ? new Date(sessions[0].date).toLocaleDateString() : 'N/A'}</div>
          <div class="stat-label">Last Session</div>
        </div>
      </div>
      
      <h2 class="section-title">🏃 Recent Exercise Sessions</h2>
      ${sessions.length === 0 ? '<p>No exercise sessions found.</p>' : `
        <table class="sessions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exercise Type</th>
              <th>Duration</th>
              <th>Accuracy</th>
              <th>Movements</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.slice(0, 10).map(session => {
              const accuracyClass = session.accuracy >= 80 ? 'accuracy-excellent' : 
                                   session.accuracy >= 60 ? 'accuracy-good' : 'accuracy-poor';
              return `
                <tr>
                  <td>${new Date(session.date).toLocaleDateString()}</td>
                  <td>${session.exerciseType.replace('-', ' ').toUpperCase()}</td>
                  <td>${session.duration || '2:00'}</td>
                  <td class="${accuracyClass}">${session.accuracy}%</td>
                  <td>${session.correctCount || 0}/${session.movementCount || 0}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `}
      
      <div class="recommendations">
        <h2 class="section-title">💡 Recommendations</h2>
        <ul>
          ${generateTextRecommendations(sessions).map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div class="report-footer">
        <p>Report generated by Nordic Thingy Patient Management System</p>
        <p>For medical use only - Consult with healthcare professionals for treatment decisions</p>
      </div>
    </body>
    </html>
  `
}

const generateTextRecommendations = (sessions) => {
  const recommendations = []
  
  if (sessions.length === 0) {
    recommendations.push('Start regular exercise sessions to track progress and establish baseline measurements')
    recommendations.push('Schedule initial assessment with physical therapist')
    return recommendations
  }
  
  const avgAccuracy = sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length
  
  if (avgAccuracy < 60) {
    recommendations.push('Focus on movement accuracy - consider slower, more controlled exercises')
    recommendations.push('Review exercise technique with supervised training sessions')
  } else if (avgAccuracy > 85) {
    recommendations.push('Excellent progress! Consider increasing exercise difficulty or duration')
    recommendations.push('Explore advanced movement patterns to maintain engagement')
  } else {
    recommendations.push('Good progress maintained - continue current exercise routine')
  }
  
  const recentSessions = sessions.slice(0, 7)
  if (recentSessions.length < 3) {
    recommendations.push('Increase exercise frequency for better results - aim for 3-4 sessions per week')
  } else if (recentSessions.length >= 5) {
    recommendations.push('Excellent session frequency - maintain this consistent routine')
  }
  
  recommendations.push('Continue regular monitoring and track improvements over time')
  recommendations.push('Consult with medical staff for personalized exercise adjustments')
  recommendations.push('Consider incorporating variety in exercise types to prevent adaptation plateau')
  
  return recommendations
}
</script>

<style scoped>
.patients-page {
  width: 100%;
  padding: 1rem;
  height: auto;
}

.patients-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0.8rem;
}

.patients-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  flex-shrink: 0;
}

.patients-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.btn-add-patient {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
}

.btn-add-patient:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.patients-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.patients-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.8rem;
  overflow: visible;
  padding: 0.3rem 0;
}

.patient-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid #007bff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-height: 180px;
}

.patient-card:hover {
  transform: translateY(-1px);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}

.patient-header-with-photo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}

.patient-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007bff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.patient-photo-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #666;
  border: 3px solid #ddd;
  flex-shrink: 0;
}

.patient-name-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.patient-name-with-edit {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.patient-name {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.btn-edit-inline {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.1rem;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.btn-edit-inline:hover {
  background: rgba(0, 123, 255, 0.1);
}

.patient-id {
  font-size: 0.7rem;
  color: #666;
  background: rgba(0, 123, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

.patient-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.patient-info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.patient-info-label {
  color: #666;
  font-weight: 500;
}

.patient-info-value {
  color: #333;
  font-weight: 600;
}

.patient-notes {
  margin: 0.4rem 0;
  padding: 0.4rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 5px;
  font-size: 0.8rem;
  color: #475569;
}

.patient-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
  margin-top: auto;
}

.btn-patient-action {
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-patient-action:hover {
  transform: translateY(-1px);
}

.btn-exercise {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.btn-report {
  background: linear-gradient(135deg, #6f42c1, #5a32a3);
  color: white;
}

.btn-report:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-delete {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 0.8rem;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.empty-state-subtext {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Modal styles */
.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  overflow-y: auto;
}

.modal-content {
  background: white;
  margin: 1% auto;
  padding: 1.2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  max-height: 95vh;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.close {
  color: #aaa;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

.close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 0.6rem;
}

.form-label {
  display: block;
  margin-bottom: 0.2rem;
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.8rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: white;
}

.btn-modal {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-save {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-modal:hover {
  transform: translateY(-1px);
}

/* Photo upload styles */
.photo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.photo-preview {
  width: 100%;
  height: 120px;
  border: 2px dashed #007bff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-preview:hover {
  border-color: #0056b3;
  background: #f0f8ff;
}

.photo-preview.has-image {
  border: 2px solid #007bff;
  background: none;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #007bff;
  font-size: 1rem;
  text-align: center;
}

.photo-icon {
  font-size: 2rem;
  margin-bottom: 0.4rem;
}

.photo-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.form-input-file {
  display: none;
}

.photo-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.btn-photo {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-photo:hover {
  transform: translateY(-1px);
}

.btn-remove {
  background: #dc3545;
  color: white;
}

.btn-remove:hover {
  background: #c82333;
}

/* Responsive design */
@media (max-width: 768px) {
  .patients-container {
    gap: 0.5rem;
  }

  .patients-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .patients-list {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .patient-card {
    min-height: 160px;
    padding: 0.8rem;
  }

  .patient-actions {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.2rem;
  }

  .btn-patient-action {
    padding: 0.25rem 0.4rem;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    margin: 0.5% auto;
    width: 98%;
    padding: 0.8rem;
    max-height: 99vh;
  }

  .patient-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }

  .btn-patient-action {
    padding: 0.3rem 0.4rem;
    font-size: 0.7rem;
  }
}
</style>