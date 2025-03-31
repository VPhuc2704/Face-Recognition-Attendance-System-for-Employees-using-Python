import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, MoreVertical, Filter, UserPlus } from 'lucide-react'

// Mock data
const employeesData = [
  {
    id: 1,
    username: 'john_doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    department: 'IT',
    position: 'Developer',
    registerDate: '2023-03-15',
  },
  {
    id: 2,
    username: 'jane_smith',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'HR',
    position: 'Manager',
    registerDate: '2023-02-10',
  },
  {
    id: 3,
    username: 'robert_johnson',
    fullName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    department: 'Marketing',
    position: 'Specialist',
    registerDate: '2023-04-22',
  },
  {
    id: 4,
    username: 'sarah_williams',
    fullName: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    department: 'Sales',
    position: 'Representative',
    registerDate: '2023-01-05',
  },
  {
    id: 5,
    username: 'michael_brown',
    fullName: 'Michael Brown',
    email: 'michael.brown@example.com',
    department: 'Accounting',
    position: 'Accountant',
    registerDate: '2023-05-18',
  },
]

export default function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Lọc nhân viên theo từ khóa tìm kiếm
  const filteredEmployees = employeesData.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Xem chi tiết nhân viên
  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý nhân viên</h1>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả nhân viên đã đăng ký trong hệ thống.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                Tổng số {employeesData.length} nhân viên trong hệ thống.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm nhân viên..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.username}
                      </TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.registerDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Mở menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewEmployee(employee)}
                            >
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog xem chi tiết nhân viên */}
      {selectedEmployee && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thông tin nhân viên</DialogTitle>
              <DialogDescription>
                Chi tiết thông tin của nhân viên {selectedEmployee.fullName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${selectedEmployee.fullName.replace(' ', '+')}&background=random`}
                    alt={selectedEmployee.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">
                  {selectedEmployee.fullName}
                </h3>
                <Badge variant="outline" className="mt-1">
                  {selectedEmployee.position}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Tên đăng nhập:</div>
                <div className="col-span-2">{selectedEmployee.username}</div>

                <div className="font-medium">Email:</div>
                <div className="col-span-2">{selectedEmployee.email}</div>

                <div className="font-medium">Phòng ban:</div>
                <div className="col-span-2">{selectedEmployee.department}</div>

                <div className="font-medium">Vị trí:</div>
                <div className="col-span-2">{selectedEmployee.position}</div>

                <div className="font-medium">Ngày đăng ký:</div>
                <div className="col-span-2">
                  {selectedEmployee.registerDate}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Đóng
              </Button>
              <Button>Xem lịch sử điểm danh</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
