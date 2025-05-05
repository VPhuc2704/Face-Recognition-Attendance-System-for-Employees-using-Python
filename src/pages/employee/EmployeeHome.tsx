import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { useAttendanceHistory } from '@/hooks/useEmployee'
import { formatAttendanceTime, formatDate } from '@/lib/utils'
import { AttendanceStatusLabels } from '@/constants/type'
import { Loader2 } from 'lucide-react'

export default function EmployeeHome() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Lấy dữ liệu điểm danh từ API
  const { data: attendanceHistory, isLoading } = useAttendanceHistory()

  // Tìm bản ghi điểm danh của ngày hôm nay
  const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  const todayAttendance = attendanceHistory?.find((record) => record.date === today)

  // Tính toán thống kê điểm danh
  const totalRecords = attendanceHistory?.length || 0
  const presentDays =
    attendanceHistory?.filter((record) => record.status === 'Present' || record.status === 'Late').length || 0
  const absentDays = attendanceHistory?.filter((record) => record.status === 'Absent').length || 0

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Chào mừng!</h1>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                <span>Đang tải...</span>
              </div>
            ) : todayAttendance ? (
              <>
                <div
                  className={`text-2xl font-bold ${
                    todayAttendance.status === 'Present'
                      ? 'text-green-600'
                      : todayAttendance.status === 'Late'
                        ? 'text-amber-500'
                        : 'text-red-500'
                  }`}
                >
                  {AttendanceStatusLabels[todayAttendance.status]}
                </div>
                {todayAttendance.check_in && (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Check in: {formatAttendanceTime(todayAttendance.check_in)}
                  </p>
                )}
                {todayAttendance.check_out && (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Check out: {formatAttendanceTime(todayAttendance.check_out)}
                  </p>
                )}
              </>
            ) : (
              <div className='text-2xl font-bold text-gray-400'>Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                <span>Đang tải...</span>
              </div>
            ) : (
              <div className='flex justify-between'>
                <div>
                  <div className='text-2xl font-bold'>
                    {presentDays}/{totalRecords}
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Ngày đã điểm danh</p>
                </div>
                <div>
                  <div className='text-2xl font-bold'>{absentDays}</div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Ngày vắng mặt</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Không có thông báo mới</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Lịch điểm danh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Calendar mode='single' selected={date} onSelect={setDate} className='rounded-md border' />

            {date && (
              <div className='space-y-4'>
                <h3 className='font-medium'>Thông tin điểm danh ngày {formatDate(date?.toISOString())}</h3>
                {isLoading ? (
                  <div className='flex items-center'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    <span>Đang tải...</span>
                  </div>
                ) : (
                  (() => {
                    const formattedDate = date?.toISOString().split('T')[0]
                    const selectedDateAttendance = attendanceHistory?.find((record) => record.date === formattedDate)

                    if (selectedDateAttendance) {
                      return (
                        <div className='p-4 border rounded-md bg-background'>
                          <div className='flex items-center mb-2'>
                            <span className='font-medium mr-2'>Trạng thái:</span>
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                selectedDateAttendance.status === 'Present'
                                  ? 'bg-green-100 text-green-800'
                                  : selectedDateAttendance.status === 'Late'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {AttendanceStatusLabels[selectedDateAttendance.status]}
                            </span>
                          </div>
                          {selectedDateAttendance.check_in && (
                            <p className='text-sm mb-1'>
                              <span className='font-medium'>Check-in:</span>{' '}
                              {formatAttendanceTime(selectedDateAttendance.check_in)}
                            </p>
                          )}
                          {selectedDateAttendance.check_out && (
                            <p className='text-sm'>
                              <span className='font-medium'>Check-out:</span>{' '}
                              {formatAttendanceTime(selectedDateAttendance.check_out)}
                            </p>
                          )}
                        </div>
                      )
                    } else {
                      return <p className='text-gray-500'>Không có dữ liệu điểm danh cho ngày này</p>
                    }
                  })()
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
