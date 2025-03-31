import {
  BarChart3,
  Calendar,
  Camera,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
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

export default function MobileSidebar({
  theme,
  handleNavigation,
  toggleTheme,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: MobileSidebarProps) {
  return (
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
  )
}
