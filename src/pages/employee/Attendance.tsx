import { useState } from 'react'
import { Calendar, Clock, Calendar as CalendarIcon, Search } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Mock data for demonstration
interface AttendanceRecord {
  id: string
  date: Date
  timeIn: string
  timeOut: string
  status: 'on-time' | 'late' | 'early-leave' | 'absent'
}

const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    date: new Date(2024, 2, 15),
    timeIn: '08:00',
    timeOut: '17:05',
    status: 'on-time',
  },
  {
    id: '2',
    date: new Date(2024, 2, 16),
    timeIn: '08:15',
    timeOut: '17:00',
    status: 'late',
  },
  {
    id: '3',
    date: new Date(2024, 2, 17),
    timeIn: '07:55',
    timeOut: '16:30',
    status: 'early-leave',
  },
  {
    id: '4',
    date: new Date(2024, 2, 18),
    timeIn: '08:00',
    timeOut: '17:10',
    status: 'on-time',
  },
  {
    id: '5',
    date: new Date(2024, 2, 19),
    timeIn: '',
    timeOut: '',
    status: 'absent',
  },
]

export default function EmployeeAttendance() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter records based on search query, date and status
  const filteredRecords = mockAttendanceData.filter((record) => {
    const matchesSearch = format(record.date, 'dd/MM/yyyy').includes(
      searchQuery,
    )
    const matchesDate = date
      ? record.date.toDateString() === date.toDateString()
      : true
    const matchesStatus =
      statusFilter === 'all' || record.status === statusFilter

    return matchesSearch && matchesDate && matchesStatus
  })

  // Calculate statistics
  const totalDays = mockAttendanceData.length
  const onTimeDays = mockAttendanceData.filter(
    (record) => record.status === 'on-time',
  ).length
  const lateDays = mockAttendanceData.filter(
    (record) => record.status === 'late',
  ).length
  const earlyLeave = mockAttendanceData.filter(
    (record) => record.status === 'early-leave',
  ).length
  const absentDays = mockAttendanceData.filter(
    (record) => record.status === 'absent',
  ).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return <Badge className="bg-green-500">Đúng giờ</Badge>
      case 'late':
        return <Badge className="bg-amber-500">Đi muộn</Badge>
      case 'early-leave':
        return <Badge className="bg-orange-500">Về sớm</Badge>
      case 'absent':
        return <Badge className="bg-red-500">Vắng mặt</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Lịch sử điểm danh
          </h2>
          <p className="text-muted-foreground">
            Xem lịch sử điểm danh và thông tin chi tiết
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đúng giờ</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTimeDays}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((onTimeDays / totalDays) * 100)}% ngày làm việc
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateDays}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((lateDays / totalDays) * 100)}% ngày làm việc
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Về sớm</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earlyLeave}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((earlyLeave / totalDays) * 100)}% ngày làm việc
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentDays}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((absentDays / totalDays) * 100)}% ngày làm việc
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          {/* <Input
            placeholder="Tìm kiếm theo ngày (DD/MM/YYYY)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          /> */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo ngày (DD/MM/YYYY)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full md:w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: vi }) : 'Chọn ngày'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="on-time">Đúng giờ</SelectItem>
            <SelectItem value="late">Đi muộn</SelectItem>
            <SelectItem value="early-leave">Về sớm</SelectItem>
            <SelectItem value="absent">Vắng mặt</SelectItem>
          </SelectContent>
        </Select>
        {date && (
          <Button variant="ghost" onClick={() => setDate(undefined)}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết điểm danh</CardTitle>
          <CardDescription>
            Danh sách tất cả các lượt điểm danh của bạn
          </CardDescription>
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
                    <TableCell className="font-medium">
                      {format(record.date, 'EEEE dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>{record.timeIn || '—'}</TableCell>
                    <TableCell>{record.timeOut || '—'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Không tìm thấy dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch điểm danh</CardTitle>
          <CardDescription>Xem tổng quan điểm danh theo tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            modifiers={{
              onTime: mockAttendanceData
                .filter((record) => record.status === 'on-time')
                .map((record) => record.date),
              late: mockAttendanceData
                .filter((record) => record.status === 'late')
                .map((record) => record.date),
              earlyLeave: mockAttendanceData
                .filter((record) => record.status === 'early-leave')
                .map((record) => record.date),
              absent: mockAttendanceData
                .filter((record) => record.status === 'absent')
                .map((record) => record.date),
            }}
            modifiersStyles={{
              onTime: { color: 'white', backgroundColor: 'green' },
              late: { color: 'white', backgroundColor: 'orange' },
              earlyLeave: { color: 'white', backgroundColor: '#f97316' },
              absent: { color: 'white', backgroundColor: 'red' },
            }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-sm">Đúng giờ</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
              <span className="text-sm">Đi muộn</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              <span className="text-sm">Về sớm</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-sm">Vắng mặt</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
