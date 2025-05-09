import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, Loader2, Upload } from 'lucide-react'
import { ProfileUpdateBody, ProfileUpdateBodyType } from '@/schemas/employee.shema'
import { useProfile, useUpdateProfile } from '@/hooks/useEmployee'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn, formatDate } from '@/lib/utils'
import { vi } from 'date-fns/locale/vi'
import { format } from 'date-fns/format'
import { DepartmentLabels, DepartmentType, PositionLabels, PositionType, Status, StatusLabels } from '@/constants/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

export default function Profile() {
  const { data: profileData, isLoading, error, refetch } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formReady, setFormReady] = useState(false)

  // Khởi tạo form với react-hook-form và zod
  const form = useForm<ProfileUpdateBodyType>({
    resolver: zodResolver(ProfileUpdateBody),
    defaultValues: {
      gender: null,
      date_of_birth: null,
      phone: null,
      address: null
    }
  })

  // Cập nhật giá trị form khi dữ liệu từ API được tải
  useEffect(() => {
    if (profileData) {
      form.reset({
        gender: profileData.gender,
        date_of_birth: profileData.date_of_birth,
        phone: profileData.phone,
        address: profileData.address
      })
      // Đánh dấu form đã sẵn sàng
      setFormReady(true)

      // Reset trạng thái preview image
      setPreviewImage(null)
      setSelectedFile(null)
    }
  }, [profileData, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Tạo URL để preview ảnh
      const previewURL = URL.createObjectURL(file)
      setPreviewImage(previewURL)
    }
  }

  const onSubmit = (formData: ProfileUpdateBodyType) => {
    // Thêm file ảnh nếu có
    if (selectedFile) {
      formData.employeeImg = selectedFile
    }
    updateProfile(formData, {
      onSuccess: () => {
        toast.success('Thông tin cá nhân đã được cập nhật', {
          description: 'Thành công'
        })
        // Clean up preview URL to avoid memory leaks
        if (previewImage) {
          URL.revokeObjectURL(previewImage)
          setPreviewImage(null)
        }
        setSelectedFile(null)
      },
      onError: (error: any) => {
        toast.error('Đã có lỗi xảy ra', {
          description: 'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.'
        })
      }
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Xử lý trạng thái loading
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Đang tải thông tin...</span>
      </div>
    )
  }

  // Xử lý lỗi
  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <p className='text-red-500 mb-2'>Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    )
  }
  // console.log('Profile data:', profileData)
  console.log(form.getValues())
  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Thông tin cá nhân</h1>

      <div className='grid gap-6 md:grid-cols-12'>
        <div className='md:col-span-4'>
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center space-y-4'>
              <Avatar className='w-32 h-32'>
                {previewImage ? (
                  <AvatarImage
                    src={previewImage}
                    alt={profileData.user}
                    className='object-cover'
                    style={{
                      objectPosition: 'center 30%' // Điều chỉnh theo vị trí khuôn mặt, thường ở phần trên ảnh
                    }}
                  />
                ) : profileData.employeeImg ? (
                  <AvatarImage
                    src={`${import.meta.env.VITE_MEDIA_URL || ''}${profileData.employeeImg}`}
                    alt={profileData.user}
                    className='object-cover'
                    style={{
                      objectPosition: 'center 30%'
                    }}
                  />
                ) : (
                  <AvatarFallback>
                    {profileData.user
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Thêm input ẩn để upload file */}
              <input type='file' ref={fileInputRef} onChange={handleImageChange} accept='image/*' className='hidden' />
              <Button variant='outline' size='sm' className='mt-2 flex items-center' onClick={triggerFileInput}>
                <Upload className='mr-2 h-4 w-4' />
                Thay đổi ảnh
              </Button>

              {selectedFile && <p className='text-sm text-green-600'>Đã chọn: {selectedFile.name}</p>}

              <p className='text-sm text-gray-500 text-center mt-2'>Ảnh sẽ được cập nhật khi bạn lưu thay đổi</p>
            </CardContent>
          </Card>

          <Card className='mt-4'>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label>Mã nhân viên</Label>
                <p className='text-md mt-1 font-medium'>{profileData.employee_code || 'Chưa cấp'}</p>
              </div>
              <div>
                <Label>Phòng ban</Label>
                <p className='text-md mt-1 font-medium'>
                  {profileData.department?.name
                    ? DepartmentLabels[profileData.department.name as DepartmentType] || profileData.department.name
                    : 'Chưa phân công'}
                </p>
              </div>
              <div>
                <Label>Chức vụ</Label>
                <p className='text-md mt-1 font-medium'>
                  {profileData.position?.name
                    ? PositionLabels[profileData.position.name as PositionType] || profileData.position.name
                    : 'Chưa phân công'}
                </p>
              </div>
              <div>
                <Label>Ngày bắt đầu</Label>
                <p className='text-md mt-1 font-medium'>
                  {profileData.start_date ? formatDate(profileData.start_date) : 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <p
                  className={`text-md mt-1 font-medium ${profileData.status === Status.Active ? 'text-green-600' : 'text-red-600'}`}
                >
                  {profileData.status === Status.Active ? StatusLabels.Active : StatusLabels.Inactive}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='md:col-span-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              {formReady ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid gap-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='user'>Họ và tên</Label>
                        <Input id='user' name='user' value={profileData.user} readOnly disabled />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input id='email' name='email' value={profileData.email} readOnly disabled />
                      </div>
                      <FormField
                        control={form.control}
                        name='gender'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới tính</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn giới tính'>
                                    {field.value === 'male'
                                      ? 'Nam'
                                      : field.value === 'female'
                                        ? 'Nữ'
                                        : field.value === 'other'
                                          ? 'Khác'
                                          : 'Chọn giới tính'}
                                  </SelectValue>
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
                      {/* <FormField
                        control={form.control}
                        name='date_of_birth'
                        render={({ field }) => (
                          <FormItem className='flex flex-col'>
                            <FormLabel>Ngày sinh</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {field.value ? (
                                      format(new Date(field.value), 'dd/MM/yyyy')
                                    ) : (
                                      <span>Chọn ngày sinh</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(date.toISOString().split('T')[0])
                                    }
                                  }}
                                  initialFocus
                                  locale={vi}
                                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}

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

                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input placeholder='Nhập số điện thoại' {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                              <Input placeholder='Nhập địa chỉ' {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex justify-end space-x-2'>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => {
                          // Reset form về giá trị ban đầu từ profileData
                          form.reset({
                            gender: profileData.gender,
                            date_of_birth: profileData.date_of_birth,
                            phone: profileData.phone,
                            address: profileData.address
                          })

                          // Xóa hình ảnh preview nếu có
                          if (previewImage) {
                            URL.revokeObjectURL(previewImage)
                            setPreviewImage(null)
                          }
                          setSelectedFile(null)
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type='submit' disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Đang lưu...
                          </>
                        ) : (
                          'Lưu thay đổi'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className='flex justify-center p-6'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
