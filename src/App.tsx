import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/employee/RegisterPage'
import EmployeeDashboard from './pages/employee/Dashboard'
import { ThemeProvider } from '@/components/theme-provider'
import './App.css'
import AdminLayout from '@/pages/admin/AdminLayout'
import EmployeeLayout from './pages/employee/EmployeeLayout'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route path="/employee/*" element={<EmployeeDashboard />} /> */}
          <Route path="/employee/*" element={<EmployeeLayout />} />

          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
