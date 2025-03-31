import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Mock data cho biểu đồ cột
const weeklyData = [
  { name: 'Thứ 2', onTime: 45, late: 5, absent: 2 },
  { name: 'Thứ 3', onTime: 48, late: 3, absent: 1 },
  { name: 'Thứ 4', onTime: 47, late: 4, absent: 1 },
  { name: 'Thứ 5', onTime: 46, late: 5, absent: 1 },
  { name: 'Thứ 6', onTime: 44, late: 6, absent: 2 },
  { name: 'Thứ 7', onTime: 40, late: 2, absent: 0 },
  { name: 'CN', onTime: 35, late: 1, absent: 0 },
]

// Mock data cho biểu đồ tròn
const statusDistribution = [
  { name: 'Đúng giờ', value: 305, color: '#22c55e' },
  { name: 'Đi muộn', value: 26, color: '#eab308' },
  { name: 'Vắng mặt', value: 7, color: '#ef4444' },
]

// Mock data cho biểu đồ phân bố theo phòng ban
const departmentData = [
  { name: 'IT', onTime: 95, late: 4, absent: 1 },
  { name: 'HR', onTime: 45, late: 3, absent: 2 },
  { name: 'Marketing', onTime: 58, late: 7, absent: 0 },
  { name: 'Sales', onTime: 65, late: 8, absent: 3 },
  { name: 'Accounting', onTime: 42, late: 4, absent: 1 },
]

// Component báo cáo
export default function Reports() {
  const [timeRange, setTimeRange] = useState('weekly')

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Báo cáo & Thống kê
        </h1>
        <p className="text-muted-foreground">
          Xem báo cáo, thống kê và phân tích dữ liệu điểm danh theo thời gian.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="attendance" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
              <TabsTrigger value="employees">Nhân viên</TabsTrigger>
              <TabsTrigger value="departments">Phòng ban</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hôm nay</SelectItem>
                  <SelectItem value="weekly">Tuần này</SelectItem>
                  <SelectItem value="monthly">Tháng này</SelectItem>
                  <SelectItem value="quarterly">Quý này</SelectItem>
                  <SelectItem value="yearly">Năm nay</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Cập nhật</Button>
            </div>
          </div>

          <TabsContent value="attendance" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số điểm danh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">338</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 7%</span> so với tuần
                    trước
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Đi muộn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">26</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-red-500">↑ 4%</span> so với tuần trước
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Vắng mặt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↓ 12%</span> so với tuần
                    trước
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ điểm danh theo tuần</CardTitle>
                  <CardDescription>
                    Thống kê số lượng nhân viên điểm danh theo từng ngày
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weeklyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="onTime" name="Đúng giờ" fill="#22c55e" />
                        <Bar dataKey="late" name="Đi muộn" fill="#eab308" />
                        <Bar dataKey="absent" name="Vắng mặt" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phân bố trạng thái điểm danh</CardTitle>
                  <CardDescription>
                    Tỷ lệ các trạng thái điểm danh trong tuần
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê theo nhân viên</CardTitle>
                <CardDescription>
                  Nhân viên có tỷ lệ đúng giờ cao nhất và thấp nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <p className="text-center text-muted-foreground">
                    Đang phát triển...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Điểm danh theo phòng ban</CardTitle>
                <CardDescription>
                  So sánh tỷ lệ điểm danh giữa các phòng ban
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="onTime" name="Đúng giờ" fill="#22c55e" />
                      <Bar dataKey="late" name="Đi muộn" fill="#eab308" />
                      <Bar dataKey="absent" name="Vắng mặt" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
