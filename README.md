# Nordic Thingy Vue 🔬

A professional web application for sensor monitoring using Vue 3 and Vite, designed for real-time data surveillance of Nordic Thingy and Mbient Lab sensors.

## 📋 Project Description

This application provides a modern and intuitive interface for:
- **Real-time monitoring** of Nordic Thingy and Mbient Lab sensors
- **Graphical visualization** of temperature, humidity, pressure data, etc.
- **Patient management** and exercise tracking
- **Responsive interface** adapted to all devices
- **Secure authentication** with user role management

## 🚀 Key Features

### 📊 Dashboard
- Real-time overview of sensor data
- Interactive charts (Charts.js)
- Sensor health indicators
- Performance metrics

### 🌡️ Sensor Monitoring
- **Nordic Thingy**: Temperature, humidity, pressure, air quality
- **Mbient Lab**: Acceleration and motion data
- Automatic updates every 3 seconds
- Alerts for abnormal values

### 🏃 Motion Tracking
- 3D visualization of acceleration data
- Movement pattern detection
- Exercise quality analysis

### 👥 Patient Management
- Complete patient profiles
- Exercise session history
- Individual progress tracking

### 🎯 Therapeutic Exercises
- Library of predefined exercises
- Real-time guided sessions
- Automatic performance evaluation

## 🏗️ Project Architecture

```
src/
├── 📁 components/          # Reusable components
│   ├── Charts.vue         # Data charts
│   ├── Motion.vue         # Motion visualization
│   └── Sensors.vue        # Sensor data display
├── 📁 composables/        # Shared reactive logic
│   └── useAuth.js         # Authentication management
├── 📁 middleware/         # Routing middlewares
│   └── auth.js            # Route protection
├── 📁 router/             # Router configuration
│   └── index.js           # Route definitions
├── 📁 utils/              # Utilities
│   └── createTestUsers.js # Test user creation
├── 📁 views/              # Main pages
│   ├── Dashboard.vue      # Dashboard
│   ├── LoginPage.vue      # Login/registration
│   ├── ChartsPage.vue     # Dedicated charts page
│   ├── SensorsPage.vue    # Sensors page
│   ├── MotionPage.vue     # Motion page
│   ├── PatientsPage.vue   # Patient management
│   ├── ExercisesPage.vue  # Exercise list
│   └── CurrentExercisePage.vue # Active exercise session
├── 📁 assets/             # Static resources
│   └── main.css          # Global styles
├── App.vue               # Root component
└── main.js              # Entry point
```

## 🔧 Main Classes and Components

### 🎨 Vue Components

#### `App.vue`
- **Role**: Application root component
- **Features**:
  - Main navigation management
  - Automatic sensor data updates
  - Global authentication
  - Shared data injection

#### `Dashboard.vue`
- **Role**: Home page with overview
- **Components**: Charts, Motion, Sensors
- **Data**: Real-time metrics

#### `LoginPage.vue`
- **Role**: User authentication
- **Features**:
  - Login and registration
  - Form validation
  - Error handling
  - Responsive interface

### 🔌 Composables

#### `useAuth.js`
```javascript
// Centralized authentication management
export function useAuth() {
  return {
    currentUser,      // Connected user
    isAuthenticated,  // Connection state
    login(),          // Login
    logout(),         // Logout
    hasRole()         // Role verification
  }
}
```

### 🛡️ Middlewares

#### `auth.js`
```javascript
// Route protection
export function requireAuth(to, from, next)
export function redirectIfAuthenticated(to, from, next)
```

### 📊 Sensor Data

#### Nordic Thingy Data Structure
```javascript
{
  temperature: 22.5,    // °C
  humidity: 45.2,       // %
  pressure: 1013.25,    // hPa
  airQuality: 95,       // %
  timestamp: "2025-01-14T15:30:00Z"
}
```

#### Mbient Lab Data Structure
```javascript
{
  acceleration: {
    x: 0.12,            // m/s²
    y: -0.08,           // m/s²
    z: 9.81             // m/s²
  },
  timestamp: "2025-01-14T15:30:00Z"
}
```

## 🎯 User Roles

### 🏥 Physiotherapist
- Exercise session management
- Assigned patient tracking
- Motion data access

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step-by-Step Installation Guide

#### Step 1: Clone the project
```sh
git clone https://github.com/julienblanchla/BachelorProjectWepApp.git
cd BachelorProjectWithoutMendix
```

#### Step 2: Install dependencies
```sh
npm install
```

If an error occurs (conflicts in node_modules or package-lock.json), delete them and reinstall:

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

**macOS/Linux:**
```sh
rm -rf node_modules package-lock.json
npm install
```

#### Step 3: Start the development server
```sh
npm run dev
```

The application will be available at: **http://localhost:5173**

### Development
```sh
# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

### Production
```sh
# Build for production
npm run build

# Preview the build
npm run preview
```

### Troubleshooting

If you encounter issues during installation:

1. **Clear npm cache:**
   ```sh
   npm cache clean --force
   ```

2. **Update npm:**
   ```sh
   npm install -g npm@latest
   ```

3. **Check Node.js version:**
   ```sh
   node --version
   npm --version
   ```

4. **Alternative package manager (if npm fails):**
   ```sh
   # Using yarn
   yarn install
   yarn dev
   ```
```
## 🛠️ Technologies Used

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Ultra-fast build tool
- **Vue Router** - SPA routing
- **Chart.js** - Interactive charts

### Styling
- **CSS3** - Modern styles
- **Flexbox/Grid** - Responsive layout
- **Custom Properties** - CSS variables
- **Gradient Backgrounds** - Modern design

### Development
- **ESLint** - Code linting
- **Prettier** - Automatic formatting
- **Hot Reload** - Hot reloading

## 📱 Responsive Design

The application adapts to all screen sizes:

- **Desktop** (≥1200px): Full interface
- **Tablet** (768px-1199px): Adapted layout
- **Mobile** (≤767px): Optimized interface

## 🔄 Data Updates

- **Frequency**: Every 3 seconds
- **Method**: Realistic data simulation
- **Optimization**: Pause on inactivity

## 📈 Metrics and Analytics

- User session tracking
- Sensor performance metrics
- Patient data history
- Usage reports

**Nordic Thingy Vue** - Professional sensor monitoring for medical innovation 🚀
