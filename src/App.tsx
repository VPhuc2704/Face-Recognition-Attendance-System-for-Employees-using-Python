import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import RegisterPage from '@/pages/employee/RegisterPage'
import { ThemeProvider } from '@/components/theme-provider'
import './App.css'
import AdminLayout from '@/pages/admin/AdminLayout'
import EmployeeLayout from './pages/employee/EmployeeLayout'
import { AuthProvider } from './contexts/auth'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Role } from './constants/type'
import AdminHome from './pages/admin/AdminHome'
import EmployeeList from './pages/admin/EmployeeList'
import AttendanceCapture from './pages/admin/AttendanceCapture'
import AttendanceList from './pages/admin/AttendanceList'
import Reports from './pages/admin/Report'
import { Settings } from 'lucide-react'
import EmployeeHome from './pages/employee/EmployeeHome'
import Profile from './pages/employee/Profile'
import Attendance from './pages/employee/Attendance'
import CreateEmployeeForm from './pages/admin/CreateEmployeeForm'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <Toaster richColors />

            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />

              {/* Admin Routes */}
              <Route
                path='/admin'
                element={
                  <ProtectedRoute allowedRoles={[Role.Admin]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminHome />} />
                <Route path='employees' element={<EmployeeList />} />
                <Route path='employees/create' element={<CreateEmployeeForm />} />
                <Route path='attendance-capture' element={<AttendanceCapture />} />
                <Route path='attendance-list' element={<AttendanceList />} />
                <Route path='reports' element={<Reports />} />
                <Route path='settings' element={<Settings />} />
              </Route>
              {/* Employee Routes */}
              <Route
                path='/employee'
                element={
                  <ProtectedRoute allowedRoles={[Role.Employee]}>
                    <EmployeeLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<EmployeeHome />} />
                <Route path='profile' element={<Profile />} />
                <Route path='attendance' element={<Attendance />} />
              </Route>
              <Route path='/' element={<Navigate to='/login' replace />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
