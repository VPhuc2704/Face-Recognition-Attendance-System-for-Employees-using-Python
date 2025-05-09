import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Search, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useAttendanceHistory } from '@/hooks/useAdmin'
import { AttendanceHistoryItemType } from '@/schemas/admin.shema'
import { AttendanceStatus, AttendanceStatusLabels, Department, DepartmentLabels } from '@/constants/type'
import { formatAttendanceTime } from '@/lib/utils'
import { ExportExcelDialog } from '../../components/ExportExcelDialog'

export default function AttendanceList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Gọi API lấy dữ liệu điểm danh
  const { data: attendanceData, isLoading, isError } = useAttendanceHistory()

  const filteredAttendance =
    attendanceData?.filter((record: AttendanceHistoryItemType) => {
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch =
        record.employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee.department.toLowerCase().includes(searchTerm.toLowerCase())

      // Lọc theo phòng ban
      const matchesDepartment = selectedDepartment === 'all' || record.employee.department === selectedDepartment

      // Lọc theo trạng thái
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'on-time' && record.status === AttendanceStatus.Present) ||
        (selectedStatus === 'late' && record.status === AttendanceStatus.Late) ||
        (selectedStatus === 'absent' && record.status === AttendanceStatus.Absent)

      // Lọc theo ngày (nếu có)
      const recordDate = record.date.split('T')[0]
      const formattedSelectedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      const matchesDate = !formattedSelectedDate || recordDate === formattedSelectedDate

      return matchesSearch && matchesDepartment && matchesStatus && matchesDate
    }) || []

  // Tính toán thống kê
  const totalEmployees = filteredAttendance.length
  const lateEmployees = filteredAttendance.filter((record) => record.status === AttendanceStatus.Late).length
  const absentEmployees = filteredAttendance.filter((record) => record.status === AttendanceStatus.Absent).length

  // Tính phần trăm
  const latePercentage = totalEmployees > 0 ? Math.round((lateEmployees / totalEmployees) * 100) : 0
  const absentPercentage = totalEmployees > 0 ? Math.round((absentEmployees / totalEmployees) * 100) : 0

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Lịch sử điểm danh</h1>
        <p className='text-muted-foreground'>Xem và quản lý lịch sử điểm danh của nhân viên theo ngày.</p>
      </div>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <CardTitle>Danh sách điểm danh</CardTitle>
              <CardDescription>Ngày: {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chưa chọn'}</CardDescription>
            </div>
            <div className='flex flex-wrap gap-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
                <Input
                  type='search'
                  placeholder='Tìm kiếm nhân viên...'
                  className='pl-8 w-full md:w-[200px]'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-[180px] justify-start'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Phòng ban' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả phòng ban</SelectItem>
                  <SelectItem value={Department.IT}>{DepartmentLabels[Department.IT]}</SelectItem>
                  <SelectItem value={Department.HR}>{DepartmentLabels[Department.HR]}</SelectItem>
                  <SelectItem value={Department.Marketing}>{DepartmentLabels[Department.Marketing]}</SelectItem>
                  <SelectItem value={Department.Sales}>{DepartmentLabels[Department.Sales]}</SelectItem>
                  <SelectItem value={Department.Accounting}>{DepartmentLabels[Department.Accounting]}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                  <SelectItem value='on-time'>{AttendanceStatusLabels[AttendanceStatus.Present]}</SelectItem>
                  <SelectItem value='late'>{AttendanceStatusLabels[AttendanceStatus.Late]}</SelectItem>
                  <SelectItem value='absent'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</SelectItem>
                </SelectContent>
              </Select>
              <ExportExcelDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-10'>
                      <div className='flex justify-center items-center'>
                        <Loader2 className='h-6 w-6 animate-spin mr-2' />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-6 text-red-500'>
                      Đã xảy ra lỗi khi tải dữ liệu điểm danh
                    </TableCell>
                  </TableRow>
                ) : filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className='font-medium'>{record.employee.employee_code}</TableCell>
                      <TableCell>{record.employee.employeeName}</TableCell>
                      <TableCell>
                        {DepartmentLabels[record.employee.department as keyof typeof DepartmentLabels] ||
                          record.employee.department}
                      </TableCell>
                      <TableCell>{formatAttendanceTime(record.check_in)}</TableCell>
                      <TableCell>{formatAttendanceTime(record.check_out)}</TableCell>
                      <TableCell>
                        {record.status === AttendanceStatus.Present && (
                          <Badge className='bg-green-500'>{AttendanceStatusLabels[AttendanceStatus.Present]}</Badge>
                        )}
                        {record.status === AttendanceStatus.Late && (
                          <Badge className='bg-amber-500'>{AttendanceStatusLabels[AttendanceStatus.Late]}</Badge>
                        )}
                        {record.status === AttendanceStatus.Absent && (
                          <Badge variant='destructive'>{AttendanceStatusLabels[AttendanceStatus.Absent]}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-6 text-muted-foreground'>
                      Không có dữ liệu điểm danh cho ngày đã chọn
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex items-center justify-between mt-4'>
            <div className='text-sm text-muted-foreground'>
              Hiển thị {filteredAttendance.length} {attendanceData ? `trên ${attendanceData.length}` : ''} bản ghi
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' disabled>
                Trang trước
              </Button>
              <Button variant='outline' size='sm' className='bg-primary text-primary-foreground'>
                1
              </Button>
              <Button variant='outline' size='sm'>
                2
              </Button>
              <Button variant='outline' size='sm'>
                3
              </Button>
              <Button variant='outline' size='sm'>
                Trang sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số nhân viên điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalEmployees}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Ngày {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '--/--/----'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Đi muộn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{lateEmployees}</div>
            <p className='text-xs text-muted-foreground mt-1'>{latePercentage}% tổng số nhân viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Vắng mặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{absentEmployees}</div>
            <p className='text-xs text-muted-foreground mt-1'>{absentPercentage}% tổng số nhân viên</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
