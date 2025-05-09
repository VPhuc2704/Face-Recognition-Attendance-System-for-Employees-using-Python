import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  CalendarClock,
  User,
  AlertCircle,
  Check,
  Calendar,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

export default function EmployeeHome() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceRate, setAttendanceRate] = useState(85)

  // Mock data
  const user = {
    name: 'Nguyễn Văn A',
    department: 'IT',
    position: 'Nhân viên',
    joinedDate: '15/01/2023',
  }

  const recentAttendance = [
    {
      date: '2023-06-15',
      timeIn: '08:05',
      timeOut: '17:15',
      status: 'on-time',
    },
    {
      date: '2023-06-14',
      timeIn: '07:55',
      timeOut: '17:30',
      status: 'on-time',
    },
    {
      date: '2023-06-13',
      timeIn: '08:45',
      timeOut: '17:20',
      status: 'late',
    },
    {
      date: '2023-06-12',
      timeIn: '08:02',
      timeOut: '17:10',
      status: 'on-time',
    },
  ]

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xin chào, {user.name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Đây là trang tổng quan thông tin điểm danh của bạn.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="text-3xl font-bold tracking-tighter">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">{user.position}</div>
                <div className="text-sm text-muted-foreground">
                  {user.department}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tham gia từ {user.joinedDate}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/employee/profile')}
            >
              Xem thông tin chi tiết
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Tỷ lệ điểm danh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div
                className={`bg-${
                  attendanceRate > 80
                    ? 'green'
                    : attendanceRate > 60
                      ? 'yellow'
                      : 'red'
                }-500/10 p-3 rounded-full`}
              >
                <CalendarClock
                  className={`h-6 w-6 text-${
                    attendanceRate > 80
                      ? 'green'
                      : attendanceRate > 60
                        ? 'yellow'
                        : 'red'
                  }-500`}
                />
              </div>
              <div className="space-y-3 w-full">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tháng này</span>
                  <span className="text-sm font-medium">{attendanceRate}%</span>
                </div>
                <Progress value={attendanceRate} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {30 - 4} ngày đi làm / {30} ngày làm việc
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/employee/attendance')}
            >
              Xem lịch sử điểm danh
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Trạng thái hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Đã điểm danh</div>
                <div className="text-sm text-muted-foreground">
                  Thời gian vào: 08:05
                </div>
                <div className="flex items-center text-xs text-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Đúng giờ
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/employee/attendance')}
            >
              Chi tiết hôm nay
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent attendance */}
      <div>
        <h3 className="text-lg font-medium mb-4">Lịch sử điểm danh gần đây</h3>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{record.timeIn}</TableCell>
                    <TableCell>{record.timeOut}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === 'on-time'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {record.status === 'on-time' ? 'Đúng giờ' : 'Đi muộn'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end p-4 pt-2">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/employee/attendance')}
              className="p-0"
            >
              Xem tất cả
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
