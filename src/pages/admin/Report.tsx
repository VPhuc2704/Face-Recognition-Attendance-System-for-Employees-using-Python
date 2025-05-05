import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Legend
} from 'recharts'
import { useAttendanceReport } from '@/hooks/useAdmin'
import { Loader2 } from 'lucide-react'

// Component báo cáo
export default function Reports() {
  const [timeRange, setTimeRange] = useState('weekly')

  // Lấy dữ liệu báo cáo từ API
  const { data, isLoading, error } = useAttendanceReport(timeRange)

  // Tạo dữ liệu cho biểu đồ sử dụng useMemo để tối ưu hóa hiệu năng
  const reportData = useMemo(() => {
    if (!data) {
      return {
        weeklyData: [],
        statusDistribution: [],
        departmentData: [],
        summary: { total: 0, onTime: 0, late: 0, absent: 0 }
      }
    }

    return {
      weeklyData: data.weeklyData || [],
      statusDistribution: data.statusDistribution || [],
      departmentData: data.departmentData || [],
      summary: data.summary || { total: 0, onTime: 0, late: 0, absent: 0 }
    }
  }, [data])

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Báo cáo & Thống kê</h1>
        <p className='text-muted-foreground'>Xem báo cáo, thống kê và phân tích dữ liệu điểm danh theo thời gian.</p>
      </div>

      <div className='flex items-center justify-between mb-4'>
        <Tabs defaultValue='attendance' className='w-full'>
          <div className='flex items-center justify-between mb-4'>
            <TabsList>
              <TabsTrigger value='attendance'>Điểm danh</TabsTrigger>
              <TabsTrigger value='departments'>Phòng ban</TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-2'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Chọn thời gian' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Hôm nay</SelectItem>
                  <SelectItem value='weekly'>Tuần này</SelectItem>
                  <SelectItem value='monthly'>Tháng này</SelectItem>
                  <SelectItem value='quarterly'>Quý này</SelectItem>
                  <SelectItem value='yearly'>Năm nay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='attendance' className='mt-0'>
            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : error ? (
              <div className='text-center py-8 text-red-500'>Có lỗi xảy ra khi tải dữ liệu</div>
            ) : (
              <>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Tổng số điểm danh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{reportData.summary.total}</div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Tổng số lượt điểm danh trong khoảng thời gian
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Đi muộn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{reportData.summary.late}</div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {reportData.summary.total > 0
                          ? `${Math.round((reportData.summary.late / reportData.summary.total) * 100)}% tổng điểm danh`
                          : 'Không có dữ liệu'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Vắng mặt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{reportData.summary.absent}</div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {reportData.summary.total > 0
                          ? `${Math.round((reportData.summary.absent / reportData.summary.total) * 100)}% tổng điểm danh`
                          : 'Không có dữ liệu'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu đồ điểm danh theo tuần</CardTitle>
                      <CardDescription>Thống kê số lượng nhân viên điểm danh theo từng ngày</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='h-[300px]'>
                        {reportData.weeklyData.length > 0 ? (
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                              data={reportData.weeklyData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5
                              }}
                            >
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='name' />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey='onTime' name='Đúng giờ' fill='#22c55e' />
                              <Bar dataKey='late' name='Đi muộn' fill='#eab308' />
                              <Bar dataKey='absent' name='Vắng mặt' fill='#ef4444' />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className='flex items-center justify-center h-full text-muted-foreground'>
                            Không có dữ liệu điểm danh trong khoảng thời gian này
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phân bố trạng thái điểm danh</CardTitle>
                      <CardDescription>Tỷ lệ các trạng thái điểm danh trong tuần</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='h-[300px]'>
                        {reportData.statusDistribution.some((item) => item.value > 0) ? (
                          <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                              <Pie
                                data={reportData.statusDistribution}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                outerRadius={80}
                                fill='#8884d8'
                                dataKey='value'
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {reportData.statusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className='flex items-center justify-center h-full text-muted-foreground'>
                            Không có dữ liệu điểm danh trong khoảng thời gian này
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value='departments'>
            <Card>
              <CardHeader>
                <CardTitle>Điểm danh theo phòng ban</CardTitle>
                <CardDescription>So sánh tỷ lệ điểm danh giữa các phòng ban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[400px]'>
                  {isLoading ? (
                    <div className='flex justify-center items-center h-full'>
                      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                  ) : reportData.departmentData && reportData.departmentData.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={reportData.departmentData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                        layout='vertical'
                      >
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis type='number' />
                        <YAxis dataKey='name' type='category' />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='onTime' name='Đúng giờ' fill='#22c55e' />
                        <Bar dataKey='late' name='Đi muộn' fill='#eab308' />
                        <Bar dataKey='absent' name='Vắng mặt' fill='#ef4444' />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-full text-muted-foreground'>
                      Không có dữ liệu phòng ban hoặc điểm danh
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
