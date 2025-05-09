import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { UpdateEmployeeFormValues, UpdateEmployeeSchema } from '@/schemas/admin.shema'
import { useGetEmployee, useUpdateEmployee } from '@/hooks/useAdmin'
import {
  Department,
  DepartmentLabels,
  DepartmentType,
  Position,
  PositionLabels,
  PositionType,
  Status,
  StatusLabels
} from '@/constants/type'
import { formatDateForInput } from '@/lib/utils'

export default function EditEmployeeForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const employeeId = id ? parseInt(id) : 0

  const { data: employeeData, isLoading, error } = useGetEmployee(employeeId)
  const { mutate: updateEmployee, isPending } = useUpdateEmployee()

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(false)

  // Khởi tạo react-hook-form với resolver từ zod
  const form = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(UpdateEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      gender: '',
      date_of_birth: '',
      phone: '',
      address: '',
      department: Department.HR,
      position: Position.Staff,
      start_date: '',
      status: Status.Active
    },
    mode: 'onChange'
  })

  // Cập nhật giá trị mặc định khi có dữ liệu từ API
  useEffect(() => {
    if (employeeData) {
      // Cập nhật giá trị form từ dữ liệu nhân viên
      form.reset({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        password: '', // Mật khẩu trống khi cập nhật
        gender: employeeData.employee.gender || '',
        date_of_birth: employeeData.employee.date_of_birth
          ? formatDateForInput(employeeData.employee.date_of_birth)
          : '',
        phone: employeeData.employee.phone || '',
        address: employeeData.employee.address || '',
        department: employeeData.employee.department as DepartmentType, // Chuyển đổi từ string sang enum
        position: employeeData.employee.position as PositionType, // Chuyển đổi từ string sang enum
        start_date: employeeData.employee.start_date ? formatDateForInput(employeeData.employee.start_date) : '',
        status: employeeData.employee.status
      })

      // Hiển thị ảnh preview nếu có
      if (employeeData.employee.employeeImg) {
        setPreviewImage(`${import.meta.env.VITE_MEDIA_URL || ''}${employeeData.employee.employeeImg}`)
      }

      // Đánh dấu form đã sẵn sàng
      setFormReady(true)
    }
  }, [employeeData, form])

  // Xử lý khi upload ảnh
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // Cập nhật giá trị của form
      form.setValue('employeeImg', file)

      // Tạo URL preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý khi submit form
  const onSubmit = (data: UpdateEmployeeFormValues) => {
    updateEmployee(
      { id: employeeId, data },
      {
        onSuccess: () => {
          toast.success('Cập nhật nhân viên thành công')
          navigate('/admin/employees')
        },
        onError: (error) => {
          console.error('Lỗi khi cập nhật nhân viên:', error)
          toast.error('Có lỗi xảy ra khi cập nhật nhân viên')
        }
      }
    )
  }

  // Hiển thị skeleton loading khi đang tải dữ liệu or form chưa sẵn sàng
  if (isLoading || !formReady) {
    return (
      <div className='space-y-6'>
        <div>
          <Skeleton className='h-8 w-1/3 mb-2' />
          <Skeleton className='h-4 w-2/3' />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-1/4 mb-2' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hiển thị thông báo lỗi nếu không tìm thấy nhân viên
  if (error || !employeeData) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle>Đã xảy ra lỗi!</AlertTitle>
        <AlertDescription>
          Không thể tải thông tin nhân viên. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
        </AlertDescription>
        <div className='mt-4'>
          <Button onClick={() => navigate('/admin/employees')}>Quay lại danh sách</Button>
        </div>
      </Alert>
    )
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Cập nhật thông tin nhân viên</h1>
        <p className='text-muted-foreground'>
          Chỉnh sửa thông tin của nhân viên {employeeData?.firstName} {employeeData?.lastName}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Thông tin đăng nhập và thông tin cá nhân của nhân viên</CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Họ <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Nguyễn Văn' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='A' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='nhanvien@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='Để trống nếu không thay đổi' {...field} />
                      </FormControl>
                      <FormDescription>Chỉ nhập mật khẩu nếu muốn thay đổi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select onValueChange={onChange} defaultValue={value || undefined} value={value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn giới tính' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='male'>Nam</SelectItem>
                          <SelectItem value='female'>Nữ</SelectItem>
                          <SelectItem value='other'>Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='date_of_birth'
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <Input type='date' value={value || ''} onChange={onChange} {...fieldProps} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder='0912345678' value={value || ''} onChange={onChange} {...fieldProps} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Nhập địa chỉ nhân viên'
                          className='resize-none'
                          value={value || ''}
                          onChange={onChange}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin công việc */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
              <CardDescription>Thông tin liên quan đến công việc của nhân viên</CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='department'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phòng ban <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn phòng ban' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DepartmentLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='position'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vị trí <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn vị trí' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PositionLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='start_date'
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type='date' value={value || ''} onChange={onChange} {...fieldProps} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Trạng thái làm việc</FormLabel>
                      <FormDescription>
                        {field.value === Status.Active ? StatusLabels.Active : StatusLabels.Inactive}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === Status.Active}
                        onCheckedChange={(checked) => field.onChange(checked ? Status.Active : Status.Inactive)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Hình ảnh nhân viên */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh nhân viên</CardTitle>
              <CardDescription>Cập nhật hình ảnh nhận diện của nhân viên</CardDescription>
            </CardHeader>

            <CardContent>
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row items-start gap-4'>
                  <div className='w-32 h-32 rounded-md border overflow-hidden flex items-center justify-center'>
                    {previewImage ? (
                      <img src={previewImage} alt='Preview' className='w-full h-full object-cover' />
                    ) : (
                      <div className='text-center p-2 flex flex-col items-center justify-center text-muted-foreground h-full'>
                        <Upload className='w-10 h-10' />
                        <span className='text-xs mt-2'>Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className='flex-1 space-y-2'>
                    <FormLabel htmlFor='employeeImg'>Tải lên hình ảnh mới</FormLabel>
                    <Input id='employeeImg' type='file' accept='image/*' onChange={handleImageChange} />
                    <p className='text-xs text-muted-foreground'>
                      Hình ảnh khuôn mặt rõ ràng của nhân viên để sử dụng cho hệ thống nhận diện khuôn mặt
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className='flex justify-between pt-4'>
              <Button variant='outline' onClick={() => navigate('/admin/employees')} disabled={isPending}>
                Hủy bỏ
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Lưu thay đổi
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  )
}
