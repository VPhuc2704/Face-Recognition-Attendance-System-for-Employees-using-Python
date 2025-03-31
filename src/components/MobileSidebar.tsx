import {
  BarChart3,
  Calendar,
  Camera,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

// Define prop types
interface NavItem {
  path: string
  icon: ReactNode
  title: string
}

interface MobileSidebarProps {
  theme: 'light' | 'dark' | 'system'
  handleNavigation: (path: string) => void
  toggleTheme: () => void
  handleLogout: () => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
  userRole: 'admin' | 'employee'
}

// Admin menu items
const adminNavItems: NavItem[] = [
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

// Employee menu items
const employeeNavItems: NavItem[] = [
  {
    title: 'Trang chủ',
    path: '/employee',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Thông tin cá nhân',
    path: '/employee/profile',
    icon: <User className="h-5 w-5" />,
  },
  {
    title: 'Lịch sử điểm danh',
    path: '/employee/attendance',
    icon: <ClipboardList className="h-5 w-5" />,
  },
]

export default function MobileSidebar({
  theme,
  handleNavigation,
  toggleTheme,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userRole,
}: MobileSidebarProps) {
  // Select the appropriate navigation items based on user role
  const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems
  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between h-16 p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {userRole === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Button>
                  </li>
                ))}
                <li className="pt-4 border-t dark:border-gray-700">
                  <Button
                    variant="ghost"
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
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Đăng xuất
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
