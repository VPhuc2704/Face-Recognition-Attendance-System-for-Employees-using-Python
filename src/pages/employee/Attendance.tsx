import { useMemo, useState } from 'react'
import { Calendar, Clock, Calendar as CalendarIcon, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn, formatAttendanceTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAttendanceHistory } from '@/hooks/useEmployee'
import { AttendanceRecordType } from '@/schemas/employee.shema'
import { AttendanceStatus, AttendanceStatusLabels } from '@/constants/type'
import { Skeleton } from '@/components/ui/skeleton'

interface UIAttendanceRecord {
  id: string
  date: Date
  timeIn: string
  timeOut: string
  status: string
}

export default function EmployeeAttendance() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, error } = useAttendanceHistory()

  // Chuyển đổi dữ liệu API sang định dạng UI bằng useMemo
  const attendanceRecords = useMemo(() => {
    if (!data) return []

    return data.map(
      (record: AttendanceRecordType): UIAttendanceRecord => ({
        id: record.id.toString(),
        date: parseISO(record.date),
        timeIn: formatAttendanceTime(record.check_in),
        timeOut: formatAttendanceTime(record.check_out),
        // Sử dụng giá trị status trực tiếp từ API
        status: record.status
      })
    )
  }, [data])

  // Lọc bản ghi dựa trên tìm kiếm, ngày và trạng thái
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return []

    return attendanceRecords.filter((record) => {
      const matchesSearch = format(record.date, 'dd/MM/yyyy').includes(searchQuery)
      const matchesDate = date ? record.date.toDateString() === date.toDateString() : true

      // Chuyển đổi trạng thái API sang giá trị hiển thị cho việc lọc
      const recordStatus = record.status.toLowerCase()
      const displayStatus =
        recordStatus === AttendanceStatus.Present.toLowerCase()
          ? 'on-time'
          : recordStatus === AttendanceStatus.Late.toLowerCase()
            ? 'late'
            : recordStatus === AttendanceStatus.Absent.toLowerCase()
              ? 'absent'
              : 'on-time'

      const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter

      return matchesSearch && matchesDate && matchesStatus
    })
  }, [attendanceRecords, searchQuery, date, statusFilter])

  // Tính toán thống kê
  const totalDays = attendanceRecords?.length || 0

  const onTimeDays = useMemo(
    () =>
      attendanceRecords?.filter((record) => record.status.toLowerCase() === AttendanceStatus.Present.toLowerCase())
        .length || 0,
    [attendanceRecords]
  )

  const lateDays = useMemo(
    () =>
      attendanceRecords?.filter((record) => record.status.toLowerCase() === AttendanceStatus.Late.toLowerCase())
        .length || 0,
    [attendanceRecords]
  )

  const absentDays = useMemo(
    () =>
      attendanceRecords?.filter((record) => record.status.toLowerCase() === AttendanceStatus.Absent.toLowerCase())
        .length || 0,
    [attendanceRecords]
  )

  // Hàm hiển thị badge dựa trên trạng thái
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower === AttendanceStatus.Present.toLowerCase()) {
      return <Badge className='bg-green-500'>{AttendanceStatusLabels[AttendanceStatus.Present]}</Badge>
    } else if (statusLower === AttendanceStatus.Late.toLowerCase()) {
      return <Badge className='bg-amber-500'>{AttendanceStatusLabels[AttendanceStatus.Late]}</Badge>
    } else if (statusLower === AttendanceStatus.Absent.toLowerCase()) {
      return <Badge className='bg-red-500'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</Badge>
    } else {
      return <Badge>Không xác định</Badge>
    }
  }

  // Component hiển thị skeleton khi đang tải
  const StatisticsSkeleton = () => (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-4 rounded-full' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-12 mb-1' />
            <Skeleton className='h-3 w-32' />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Xử lý lỗi
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='text-red-500 text-xl font-semibold mb-2'>Đã xảy ra lỗi khi tải dữ liệu điểm danh</div>
          <p className='text-muted-foreground'>Vui lòng thử lại sau hoặc liên hệ với quản trị viên</p>
          <Button variant='outline' className='mt-4' onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Lịch sử điểm danh</h2>
          <p className='text-muted-foreground'>Xem lịch sử điểm danh và thông tin chi tiết</p>
        </div>
      </div>

      {/* Thẻ thống kê */}
      {isLoading ? (
        <StatisticsSkeleton />
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{AttendanceStatusLabels[AttendanceStatus.Present]}</CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{onTimeDays}</div>
              <p className='text-xs text-muted-foreground'>
                {totalDays > 0 ? Math.round((onTimeDays / totalDays) * 100) : 0}% ngày làm việc
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{AttendanceStatusLabels[AttendanceStatus.Late]}</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{lateDays}</div>
              <p className='text-xs text-muted-foreground'>
                {totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0}% ngày làm việc
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{absentDays}</div>
              <p className='text-xs text-muted-foreground'>
                {totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}% ngày làm việc
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm theo ngày (DD/MM/YYYY)'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-8'
            />
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full md:w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date ? format(date, 'PPP', { locale: vi }) : 'Chọn ngày'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <CalendarComponent mode='single' selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả</SelectItem>
            <SelectItem value='on-time'>{AttendanceStatusLabels[AttendanceStatus.Present]}</SelectItem>
            <SelectItem value='late'>{AttendanceStatusLabels[AttendanceStatus.Late]}</SelectItem>
            <SelectItem value='absent'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</SelectItem>
          </SelectContent>
        </Select>
        {date && (
          <Button variant='ghost' onClick={() => setDate(undefined)}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết điểm danh</CardTitle>
          <CardDescription>Danh sách tất cả các lượt điểm danh của bạn</CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className='font-medium'>
                      {format(record.date, 'EEEE dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>{record.timeIn || '—'}</TableCell>
                    <TableCell>{record.timeOut || '—'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-6'>
                    Không tìm thấy dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Phần lịch tháng - cũng cần được cập nhật */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch điểm danh</CardTitle>
          <CardDescription>Xem tổng quan điểm danh theo tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode='single'
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            className='rounded-md border'
            modifiers={{
              onTime: attendanceRecords
                .filter((r) => r.status.toLowerCase() === AttendanceStatus.Present.toLowerCase())
                .map((r) => r.date),
              late: attendanceRecords
                .filter((r) => r.status.toLowerCase() === AttendanceStatus.Late.toLowerCase())
                .map((r) => r.date),
              absent: attendanceRecords
                .filter((r) => r.status.toLowerCase() === AttendanceStatus.Absent.toLowerCase())
                .map((r) => r.date)
            }}
            modifiersStyles={{
              onTime: { color: 'white', backgroundColor: 'green' },
              late: { color: 'white', backgroundColor: 'orange' },
              absent: { color: 'white', backgroundColor: 'red' }
            }}
          />
          <div className='mt-4 flex flex-wrap gap-2'>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-green-500 rounded-full mr-1'></div>
              <span className='text-sm'>{AttendanceStatusLabels[AttendanceStatus.Present]}</span>
            </div>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-amber-500 rounded-full mr-1'></div>
              <span className='text-sm'>{AttendanceStatusLabels[AttendanceStatus.Late]}</span>
            </div>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-red-500 rounded-full mr-1'></div>
              <span className='text-sm'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
