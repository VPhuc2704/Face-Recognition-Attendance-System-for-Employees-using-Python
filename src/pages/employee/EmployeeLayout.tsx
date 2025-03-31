import { useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'

// import EmployeeProfile from './EmployeeProfile'
// import EmployeeAttendance from './EmployeeAttendance'
import DesktopSidebar from '@/components/DesktopSidebar'
import MobileSidebar from '@/components/MobileSidebar'
import EmployeeHome from './EmployeeHome'
import Profile from './Profile'
import Attendance from './Attendance'

export default function EmployeeLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // Xử lý đăng xuất
  const handleLogout = () => {
    // TODO: Thực hiện các tác vụ đăng xuất (xóa token, xóa dữ liệu người dùng...)
    navigate('/login')
  }

  // Xử lý chuyển hướng menu
  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  // Toggle chế độ sáng/tối
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        currentPath={location.pathname}
        theme={theme}
        handleNavigation={handleNavigation}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        userRole="employee"
      />

      {/* Mobile Header & Menu */}
      <div className="flex flex-col flex-1">
        <MobileSidebar
          theme={theme}
          handleNavigation={handleNavigation}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userRole="employee"
        />
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<EmployeeHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
