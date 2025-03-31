import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/employee/RegisterPage'
import EmployeeDashboard from './pages/employee/Dashboard'
import { ThemeProvider } from '@/components/theme-provider'
import './App.css'
import AdminDashboard from '@/pages/admin/Dashboard'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/employee/*" element={<EmployeeDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
