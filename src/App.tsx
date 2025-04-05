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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <Toaster richColors />
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/employee/*' element={<EmployeeLayout />} />
              <Route path='/admin/*' element={<AdminLayout />} />
              <Route path='/' element={<Navigate to='/login' replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
