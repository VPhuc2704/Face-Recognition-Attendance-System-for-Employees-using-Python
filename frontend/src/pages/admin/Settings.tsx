import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AttendanceConfigDialog } from '@/components/AttendanceConfigDialog'
import { useAttendanceConfig } from '@/hooks/useAdmin'
import { Clock, Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  // Lấy thông tin cấu hình thời gian điểm danh
  const { data: configData, isLoading: configLoading } = useAttendanceConfig()

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Cài đặt hệ thống</h1>
        <p className='text-muted-foreground'>Quản lý các cài đặt cho hệ thống điểm danh</p>
      </div>

      <Tabs defaultValue='attendance' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='attendance'>Điểm danh</TabsTrigger>
          <TabsTrigger value='general'>Chung</TabsTrigger>
        </TabsList>

        <TabsContent value='attendance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thời gian làm việc</CardTitle>
              <CardDescription>Cấu hình thời gian ra - vào cho nhân viên</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='space-y-1'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='p-2 rounded-full bg-blue-100 dark:bg-blue-900'>
                      <Clock className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium'>Giờ vào</h3>
                      <p className='text-2xl font-bold'>{configData ? configData.check_in_time : 'Chưa thiết lập'}</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='p-2 rounded-full bg-emerald-100 dark:bg-emerald-900'>
                      <Clock className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium'>Giờ ra</h3>
                      <p className='text-2xl font-bold'>{configData ? configData.check_out_time : 'Chưa thiết lập'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <AttendanceConfigDialog />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt điểm danh nâng cao</CardTitle>
              <CardDescription>Cấu hình các thông số cho hệ thống nhận diện khuôn mặt</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <p className='text-sm text-muted-foreground'>Tính năng đang được phát triển.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='general'>
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>Quản lý các cài đặt chung của hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-center p-6'>
                <div className='flex flex-col items-center text-center'>
                  <SettingsIcon className='h-10 w-10 text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>Tính năng đang được phát triển.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
