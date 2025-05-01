import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Users, CalendarClock, UserCheck, Clock, AlertCircle, ChevronRight, Camera, Loader2 } from 'lucide-react'
import { useAttendanceHistory, useEmployeeList } from '@/hooks/useAdmin'
import { useState, useEffect, useMemo } from 'react'
import { formatDate, formatAttendanceTime } from '@/lib/utils'
import { AttendanceStatus, AttendanceStatusLabels } from '@/constants/type'
import { AttendanceHistoryResponseType } from '@/schemas/admin.shema'

export default function AdminHome() {
  const today = useMemo(() => new Date(), [])

  // Lấy dữ liệu điểm danh từ API
  const { data: attendances, isLoading: isLoadingAttendances, error: attendanceError } = useAttendanceHistory()
  const { data: employees } = useEmployeeList()

  // State để lưu trữ các số liệu thống kê
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    todayLate: 0,
    todayAbsent: 0
  })

  // State để lưu trữ 5 bản ghi điểm danh gần nhất
  const [recentAttendance, setRecentAttendance] = useState<AttendanceHistoryResponseType>([])

  // Tính toán số liệu thống kê khi dữ liệu thay đổi
  useEffect(() => {
    if (employees && attendances) {
      const totalEmployees = employees.length

      // Lọc các bản ghi điểm danh cho ngày hôm nay
      const todayAttendanceRecords = attendances.filter((record) => record.date === format(today, 'yyyy-MM-dd'))

      // Đếm số người có mặt, đi muộn và vắng mặt
      const todayAttendance = todayAttendanceRecords.length
      const todayLate = todayAttendanceRecords.filter((record) => record.status === AttendanceStatus.Late).length
      const todayAbsent = totalEmployees - todayAttendance

      setStats({
        totalEmployees,
        todayAttendance,
        todayLate,
        todayAbsent
      })

      // Lấy 5 bản ghi điểm danh gần nhất
      setRecentAttendance(attendances.slice(0, 5))
    }
  }, [employees, attendances, today])

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Tổng quan hệ thống</h1>
        <p className='text-muted-foreground'>
          Xem tổng quan hoạt động điểm danh của hôm nay: {format(today, 'dd/MM/yyyy')}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng nhân viên</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalEmployees}</div>
            <p className='text-xs text-muted-foreground mt-1'>Số lượng nhân viên trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Điểm danh hôm nay</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.todayAttendance}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              {stats.totalEmployees > 0
                ? `${Math.round((stats.todayAttendance / stats.totalEmployees) * 100)}% tổng số nhân viên`
                : 'Chưa có dữ liệu'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đi muộn</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.todayLate}</div>
            <p className='text-xs text-muted-foreground mt-1'>Số nhân viên đi muộn hôm nay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Vắng mặt</CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.todayAbsent}</div>
            <p className='text-xs text-muted-foreground mt-1'>Số nhân viên chưa điểm danh hôm nay</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4'>
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>Điểm danh gần đây</CardTitle>
            <CardDescription>Các nhân viên điểm danh gần đây trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAttendances ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : attendanceError ? (
              <div className='text-center py-8 text-red-500'>Có lỗi xảy ra khi tải dữ liệu</div>
            ) : recentAttendance.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>Chưa có dữ liệu điểm danh</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giờ vào</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center'>{record.employee.employeeName}</div>
                      </TableCell>
                      <TableCell>{record.employee.department}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{formatAttendanceTime(record.check_in)}</TableCell>
                      <TableCell>
                        {record.status === 'Present' && (
                          <Badge className='bg-green-500'>{AttendanceStatusLabels[record.status]}</Badge>
                        )}
                        {record.status === 'Late' && (
                          <Badge className='bg-amber-500'>{AttendanceStatusLabels[record.status]}</Badge>
                        )}
                        {record.status === 'Absent' && (
                          <Badge variant='destructive'>{AttendanceStatusLabels[record.status]}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Link to='/admin/attendance-list'>
              <Button variant='outline' className='w-full'>
                Xem tất cả <ChevronRight className='ml-1 h-4 w-4' />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các tác vụ phổ biến trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Link to='/admin/attendance-capture'>
              <Button variant='outline' className='w-full text-left flex items-center justify-between'>
                <div className='flex items-center'>
                  <Camera className='mr-2 h-4 w-4' />
                  Điểm danh nhân viên
                </div>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </Link>
            <Link to='/admin/employees'>
              <Button variant='outline' className='w-full text-left flex items-center justify-between'>
                <div className='flex items-center'>
                  <Users className='mr-2 h-4 w-4' />
                  Quản lý nhân viên
                </div>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </Link>
            <Link to='/admin/reports'>
              <Button variant='outline' className='w-full text-left flex items-center justify-between'>
                <div className='flex items-center'>
                  <CalendarClock className='mr-2 h-4 w-4' />
                  Xem báo cáo & thống kê
                </div>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
          <CardFooter className='border-t pt-4'>
            <div className='w-full text-center text-sm text-muted-foreground'>
              Hệ thống điểm danh nhận diện khuôn mặt v1.0
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
