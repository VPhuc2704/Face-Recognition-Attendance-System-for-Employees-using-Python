import {
  BarChart3,
  Calendar,
  Camera,
  Home,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { Button } from './ui/button'
import { ReactNode } from 'react'

// Define prop types
interface NavItem {
  path: string
  icon: ReactNode
  title: string
}

interface DesktopSidebarProps {
  currentPath: string
  theme: 'light' | 'dark' | 'system'
  handleNavigation: (path: string) => void
  toggleTheme: () => void
  handleLogout: () => void
}

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

export default function DesktopSidebar({
  currentPath,
  theme,
  handleNavigation,
  toggleTheme,
  handleLogout,
}: DesktopSidebarProps) {
  return (
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
                  currentPath === item.path
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
  )
}
