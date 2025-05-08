import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AttendanceConfigFormSchema, AttendanceConfigFormValues } from '@/schemas/admin.shema'
import { useAttendanceConfig, useCreateAttendanceConfig, useUpdateAttendanceConfig } from '@/hooks/useAdmin'
import { toast } from 'sonner'

export function AttendanceConfigDialog() {
  const [open, setOpen] = useState(false)

  // Lấy cấu hình hiện tại
  const { data: configData, isLoading } = useAttendanceConfig()

  // Mutation để tạo hoặc cập nhật cấu hình
  const createConfigMutation = useCreateAttendanceConfig()
  const updateConfigMutation = useUpdateAttendanceConfig()

  // Form xử lý
  const form = useForm<AttendanceConfigFormValues>({
    resolver: zodResolver(AttendanceConfigFormSchema),
    defaultValues: {
      check_in_time: configData?.check_in_time || '08:00:00',
      check_out_time: configData?.check_out_time || '17:00:00'
    }
  })

  // Cập nhật giá trị mặc định khi có dữ liệu
  useState(() => {
    if (configData) {
      form.reset({
        check_in_time: configData?.check_in_time || '08:00:00',
        check_out_time: configData?.check_out_time || '17:00:00'
      })
    }
  })

  // Xử lý khi submit form
  const onSubmit = async (values: AttendanceConfigFormValues) => {
    try {
      if (configData) {
        // Cập nhật cấu hình hiện có
        await updateConfigMutation.mutateAsync(values)
        toast('Cập nhật thành công', {
          description: 'Đã cập nhật thời gian điểm danh.'
        })
      } else {
        // Tạo mới cấu hình
        await createConfigMutation.mutateAsync(values)
        toast('Cấu hình thành công', {
          description: 'Đã thiết lập thời gian điểm danh.'
        })
      }
      setOpen(false)
    } catch (error) {
      console.error('Lỗi khi cấu hình thời gian điểm danh:', error)
      toast.error('Lỗi', {
        description: 'Đã xảy ra lỗi khi cấu hình thời gian điểm danh.'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Clock className='w-4 h-4 mr-2' />
          {configData ? 'Cập nhật giờ điểm danh' : 'Thiết lập giờ điểm danh'}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{configData ? 'Cập nhật thời gian điểm danh' : 'Thiết lập thời gian điểm danh'}</DialogTitle>
          <DialogDescription>Thiết lập thời gian check-in và check-out cho hệ thống điểm danh.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='check_in_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ vào</FormLabel>
                  <FormControl>
                    <Input type='time' step='1' {...field} placeholder='08:00:00' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='check_out_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ ra</FormLabel>
                  <FormControl>
                    <Input type='time' step='1' {...field} placeholder='17:00:00' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='submit'
                disabled={isLoading || createConfigMutation.isPending || updateConfigMutation.isPending}
              >
                {createConfigMutation.isPending || updateConfigMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
