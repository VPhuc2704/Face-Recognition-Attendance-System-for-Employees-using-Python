import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Users,
  CalendarClock,
  UserCheck,
  Clock,
  AlertCircle,
  ChevronRight,
  Camera,
} from 'lucide-react'

// Mock data
const recentAttendance = [
  {
    id: 1,
    name: 'John Doe',
    department: 'IT',
    time: '08:05',
    status: 'on-time',
    photo: 'https://github.com/shadcn.png',
  },
  {
    id: 2,
    name: 'Jane Smith',
    department: 'HR',
    time: '08:45',
    status: 'late',
    photo: 'https://github.com/shadcn.png',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    department: 'Marketing',
    time: '07:55',
    status: 'on-time',
    photo: 'https://github.com/shadcn.png',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    department: 'Sales',
    time: '09:15',
    status: 'late',
    photo: 'https://github.com/shadcn.png',
  },
  {
    id: 5,
    name: 'Michael Brown',
    department: 'Accounting',
    time: '08:10',
    status: 'on-time',
    photo: 'https://github.com/shadcn.png',
  },
]

export default function AdminHome() {
  const today = new Date()

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Tổng quan hệ thống
        </h1>
        <p className="text-muted-foreground">
          Xem tổng quan hoạt động điểm danh của hôm nay:{' '}
          {format(today, 'dd/MM/yyyy')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nhân viên
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+2</span> nhân viên mới trong
              tháng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm danh hôm nay
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground mt-1">
              92% tổng số nhân viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↓ 5%</span> so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">↑ 2</span> so với hôm qua
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Điểm danh gần đây</CardTitle>
            <CardDescription>
              5 nhân viên điểm danh gần nhất trong ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          <img
                            src={record.photo}
                            alt={record.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {record.name}
                      </div>
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>
                      {record.status === 'on-time' && (
                        <Badge className="bg-green-500">Đúng giờ</Badge>
                      )}
                      {record.status === 'late' && (
                        <Badge className="bg-amber-500">Đi muộn</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Link to="/admin/attendance-list">
              <Button variant="outline" className="w-full">
                Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Các tác vụ phổ biến trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/attendance-capture">
              <Button
                variant="outline"
                className="w-full text-left flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Camera className="mr-2 h-4 w-4" />
                  Điểm danh nhân viên
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/employees">
              <Button
                variant="outline"
                className="w-full text-left flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Quản lý nhân viên
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button
                variant="outline"
                className="w-full text-left flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Xem báo cáo & thống kê
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              Hệ thống điểm danh nhận diện khuôn mặt v1.0
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
