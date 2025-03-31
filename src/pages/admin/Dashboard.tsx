import { useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'
import {
  BarChart3,
  Users,
  Calendar,
  Camera,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Home,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import EmployeeList from './EmployeeList'
import AttendanceCapture from './AttendanceCapture'
import AttendanceList from './AttendanceList'
import Reports from './Report'
import AdminHome from './AdminHome'

type NavItem = {
  title: string
  path: string
  icon: React.ReactNode
}

export default function AdminDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // Các mục menu chính
  const navItems: NavItem[] = [
    {
      title: 'Trang chủ',
      path: '/admin',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Danh sách nhân viên',
      path: '/admin/employees',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Điểm danh',
      path: '/admin/attendance-capture',
      icon: <Camera className="h-5 w-5" />,
    },
    {
      title: 'Lịch sử điểm danh',
      path: '/admin/attendance-list',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Báo cáo & Thống kê',
      path: '/admin/reports',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Cài đặt',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

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
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
        </div>
        <nav className="flex-1 pt-4 pb-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 ${
                    location.pathname === item.path
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t dark:border-gray-700 p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 mr-2" />
                Chế độ sáng
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 mr-2" />
                Chế độ tối
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="flex flex-col flex-1">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Đăng xuất
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/attendance-capture" element={<AttendanceCapture />} />
            <Route path="/attendance-list" element={<AttendanceList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
