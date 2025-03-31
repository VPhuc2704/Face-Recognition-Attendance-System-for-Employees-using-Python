import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

export default function EmployeeHome() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chào mừng, Nhân Viên!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Đã điểm danh
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cập nhật lúc: 08:25 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">22/23</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ngày đã điểm danh
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">1</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ngày vắng mặt
                </p>
              </div>
            </div>
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
        <CardHeader>
          <CardTitle>Lịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  )
}
