// Utility to create test users for development
export function createTestUsers() {
  const testUsers = [
    {
      id: 'USER_1',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bib.johnson@nordic.com',
      password: 'password123',
      role: 'physiotherapist',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]

  // Only create if no users exist
  const existingUsers = localStorage.getItem('nordic-thingy-users')
  if (!existingUsers) {
    localStorage.setItem('nordic-thingy-users', JSON.stringify(testUsers))
    console.log('✅ Test users created:', testUsers.length)
    console.log('📧 Login with: bob.johnson@nordic.com / password123')
  }
}