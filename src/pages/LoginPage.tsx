import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { LoginBody, LoginBodyType } from '@/schemas/auth.schema'
import { useAuth } from '@/contexts/auth'
import { useLogin } from '@/hooks/useAuthentication'
import { useEffect, useState } from 'react'
import { Role } from '@/constants/type'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const { isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()
  const login = useLogin()
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee')
  const location = useLocation()
  const registrationSuccess = location.state?.registrationSuccess
  const message = location.state?.message

  useEffect(() => {
    if (isAuthenticated) {
      if (hasRole(Role.Admin)) {
        navigate('/admin')
      } else {
        navigate('/employee')
      }
    }
  }, [isAuthenticated, hasRole, navigate])

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginBodyType) => {
    try {
      const loginData = {
        ...data,
        expectRole: activeTab === 'admin' ? Role.Admin : Role.Employee
      }
      const res = await login.mutateAsync(loginData)
      // Kiểm tra vai trò trước khi xác thực
      const isAdmin = res.role === Role.Admin
      if ((activeTab === 'admin' && !isAdmin) || (activeTab === 'employee' && isAdmin)) {
        toast.error('Lỗi đăng nhập', {
          description: 'Bạn không có quyền đăng nhập với vai trò này. Vui lòng chọn đúng loại tài khoản.'
        })
        return // Không tiếp tục xử lý đăng nhập
      }
    } catch (error) {
      // Xử lý lỗi
      toast.error('Đăng nhập thất bại', {
        description: 'Vui lòng kiểm tra thông tin đăng nhập và thử lại'
      })
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Face Recognition Attendance System</CardTitle>
          <CardDescription>Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          {registrationSuccess && (
            <Alert className='mb-4 bg-green-50 border-green-200'>
              <AlertDescription className='text-green-800'>{message}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue='employee' onValueChange={(value) => setActiveTab(value as 'employee' | 'admin')}>
            <TabsList className='grid w-full grid-cols-2 mb-6'>
              <TabsTrigger value='employee'>Nhân viên</TabsTrigger>
              <TabsTrigger value='admin'>Quản trị viên</TabsTrigger>
            </TabsList>

            <TabsContent value='employee'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='employee@company.com' {...field} />
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
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='••••••' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full' disabled={login.isPending}>
                    {login.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>
              </Form>
              <div className='mt-4 text-center'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Chưa có tài khoản?{' '}
                  <Link to='/register' className='font-medium text-primary hover:underline'>
                    Đăng ký
                  </Link>
                </p>
              </div>
            </TabsContent>

            <TabsContent value='admin'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email quản trị viên</FormLabel>
                        <FormControl>
                          <Input placeholder='admin@company.com' {...field} />
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
                        <FormLabel>Mật khẩu quản trị viên</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='••••••' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full' disabled={login.isPending}>
                    {login.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập quản trị'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className='flex justify-center border-t pt-4'>
          <p className='text-xs text-gray-500'>© 2025 Face Recognition Attendance System</p>
        </CardFooter>
      </Card>
    </div>
  )
}
