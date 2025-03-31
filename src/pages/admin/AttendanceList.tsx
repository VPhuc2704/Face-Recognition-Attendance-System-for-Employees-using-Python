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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Search,
  Calendar as CalendarIcon,
  Download,
  Filter,
} from 'lucide-react'

// Mock data
const attendanceData = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    department: 'IT',
    date: '2023-06-10',
    timeIn: '08:05',
    timeOut: '17:15',
    status: 'on-time',
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: 'Jane Smith',
    department: 'HR',
    date: '2023-06-10',
    timeIn: '08:45',
    timeOut: '17:30',
    status: 'late',
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: 'Robert Johnson',
    department: 'Marketing',
    date: '2023-06-10',
    timeIn: '07:55',
    timeOut: '16:50',
    status: 'on-time',
  },
  {
    id: 4,
    employeeId: 4,
    employeeName: 'Sarah Williams',
    department: 'Sales',
    date: '2023-06-10',
    timeIn: '09:15',
    timeOut: '18:05',
    status: 'late',
  },
  {
    id: 5,
    employeeId: 5,
    employeeName: 'Michael Brown',
    department: 'Accounting',
    date: '2023-06-10',
    timeIn: '08:10',
    timeOut: '17:00',
    status: 'on-time',
  },
]

export default function AttendanceList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Lọc dữ liệu điểm danh
  const filteredAttendance = attendanceData.filter((record) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase())

    // Lọc theo phòng ban
    const matchesDepartment =
      selectedDepartment === 'all' || record.department === selectedDepartment

    // Lọc theo trạng thái
    const matchesStatus =
      selectedStatus === 'all' || record.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lịch sử điểm danh</h1>
        <p className="text-muted-foreground">
          Xem và quản lý lịch sử điểm danh của nhân viên theo ngày.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Danh sách điểm danh</CardTitle>
              <CardDescription>
                Ngày:{' '}
                {selectedDate
                  ? format(selectedDate, 'dd/MM/yyyy')
                  : 'Chưa chọn'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm nhân viên..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, 'dd/MM/yyyy')
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">Nhân sự</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Kinh doanh</SelectItem>
                  <SelectItem value="Accounting">Kế toán</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="on-time">Đúng giờ</SelectItem>
                  <SelectItem value="late">Đi muộn</SelectItem>
                  <SelectItem value="absent">Vắng mặt</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Lọc
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employeeId}
                      </TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.timeIn}</TableCell>
                      <TableCell>{record.timeOut}</TableCell>
                      <TableCell>
                        {record.status === 'on-time' && (
                          <Badge className="bg-green-500">Đúng giờ</Badge>
                        )}
                        {record.status === 'late' && (
                          <Badge className="bg-amber-500">Đi muộn</Badge>
                        )}
                        {record.status === 'absent' && (
                          <Badge variant="destructive">Vắng mặt</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Không có dữ liệu điểm danh cho ngày đã chọn
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredAttendance.length} trên {attendanceData.length}{' '}
              bản ghi
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số nhân viên điểm danh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ngày{' '}
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '--/--/----'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                attendanceData.filter((record) => record.status === 'late')
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (attendanceData.filter((record) => record.status === 'late')
                  .length /
                  attendanceData.length) *
                  100,
              )}
              % tổng số nhân viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                attendanceData.filter((record) => record.status === 'absent')
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (attendanceData.filter((record) => record.status === 'absent')
                  .length /
                  attendanceData.length) *
                  100,
              )}
              % tổng số nhân viên
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
