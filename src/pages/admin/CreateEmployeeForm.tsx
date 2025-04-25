import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { CreateEmployeeFormValues, CreateEmployeeSchema } from '@/schemas/admin.shema'
import { useCreateEmployee } from '@/hooks/useAdmin'
import { Department, DepartmentLabels, Position, PositionLabels, Status } from '@/constants/type'

export default function CreateEmployeeForm() {
  const navigate = useNavigate()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { mutate: createEmployee, isPending } = useCreateEmployee()

  // Khởi tạo react-hook-form với resolver từ zod
  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      gender: '',
      date_of_birth: '',
      phone: '',
      address: '',
      department: Department.IT,
      position: Position.Staff,
      employee_code: '',
      start_date: '',
      status: Status.Active,
      employeeImg: null
    }
  })

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
  const onSubmit = (data: CreateEmployeeFormValues) => {
    createEmployee(data, {
      onSuccess: () => {
        toast.success('Tạo nhân viên thành công')
        navigate('/admin/employees') // Chuyển về trang danh sách nhân viên
      },
      onError: (error) => {
        console.error('Lỗi khi tạo nhân viên:', error)
        toast.error('Có lỗi xảy ra khi tạo nhân viên')
      }
    })
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Thêm nhân viên mới</h1>
        <p className='text-muted-foreground'>Tạo tài khoản và thông tin cho nhân viên mới trong hệ thống.</p>
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
                      <FormLabel>
                        Mật khẩu <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='Nhập mật khẩu' {...field} />
                      </FormControl>
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
                      <Select onValueChange={onChange} defaultValue={value || undefined}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-1'>
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
              </div>
            </CardContent>
          </Card>

          {/* Hình ảnh nhân viên */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh nhân viên</CardTitle>
              <CardDescription>Tải lên hình ảnh nhận diện của nhân viên</CardDescription>
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
                    <FormLabel htmlFor='employeeImg'>Tải lên hình ảnh nhân viên</FormLabel>
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
                Tạo nhân viên
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  )
}
