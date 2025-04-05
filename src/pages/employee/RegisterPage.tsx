import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Camera, Check } from 'lucide-react'
import { RegisterBody, RegisterBodyType } from '@/schemas/auth.schema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  // Thêm state để theo dõi khi video stream đã sẵn sàng hiển thị
  const [videoReady, setVideoReady] = useState(false)
  const [isCameraSupported, setIsCameraSupported] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      position: ''
    }
  })

  // Khởi động camera khi cần
  const startCamera = async () => {
    if (!cameraActive) {
      try {
        // Reset trạng thái
        setCameraError(null)
        setVideoReady(false)
        console.log('Starting camera...')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // Force update UI immediately
          setCameraActive(true)

          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded')
            videoRef.current
              ?.play()
              .then(() => {
                console.log('Video playback started')
                // Đánh dấu video đã sẵn sàng hiển thị sau khi chạy thành công
                setVideoReady(true)
              })
              .catch((e) => {
                console.error('Failed to play video:', e)
                setCameraError('Không thể hiển thị video từ camera.')
              })
          }
        } else {
          console.error('Video ref is null')
        }
      } catch (err) {
        console.error('Không thể kết nối với camera:', err)
        setCameraError('Không thể kết nối với camera. Vui lòng kiểm tra quyền truy cập và thử lại.')
      }
    }
  }

  // Tắt camera khi không dùng
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setVideoReady(false) // Reset trạng thái video
    }
  }

  // Chụp ảnh từ webcam
  // Cập nhật hàm captureImage để tạo hiệu ứng flash
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Tạo hiệu ứng flash
      const flashElement = document.createElement('div')
      flashElement.style.position = 'absolute'
      flashElement.style.top = '0'
      flashElement.style.left = '0'
      flashElement.style.width = '100%'
      flashElement.style.height = '100%'
      flashElement.style.backgroundColor = 'white'
      flashElement.style.opacity = '0.8'
      flashElement.style.zIndex = '10'
      flashElement.style.transition = 'opacity 0.3s ease-out'

      if (video.parentElement) {
        video.parentElement.appendChild(flashElement)
      }

      // Fade out hiệu ứng flash
      setTimeout(() => {
        flashElement.style.opacity = '0'
        setTimeout(() => {
          if (flashElement.parentElement) {
            flashElement.parentElement.removeChild(flashElement)
          }
        }, 300)
      }, 50)

      // Thiết lập kích thước canvas bằng với video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Vẽ frame hiện tại từ video lên canvas
      if (context) {
        // Đảo ngược lại ảnh nếu đã áp dụng scaleX(-1) cho video
        context.save()
        context.scale(-1, 1)
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        context.restore()

        // Chuyển đổi canvas thành base64 image
        const imageDataURL = canvas.toDataURL('image/png')
        setCapturedImage(imageDataURL)

        // Chuyển đổi base64 thành File object để lưu vào form
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'face-image.png', {
              type: 'image/png'
            })
            form.setValue('faceImage', file)
          }
        })

        // Dừng camera sau khi chụp ảnh thành công
        stopCamera()
      }
    }
  }

  // Chụp lại ảnh
  const retakeImage = () => {
    setCapturedImage(null)
    startCamera()
  }

  // Thêm vào useEffect
  useEffect(() => {
    // Kiểm tra xem trình duyệt có hỗ trợ getUserMedia không
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false)
        setCameraError('Trình duyệt của bạn không hỗ trợ truy cập camera.')
      }
    }

    checkCameraSupport()

    return () => {
      stopCamera()
    }
  }, [])

  // Thêm trình xử lý sự kiện onPlaying để đảm bảo video thực sự đang chạy
  useEffect(() => {
    const currentVideo = videoRef.current

    if (currentVideo) {
      const handlePlaying = () => {
        setVideoReady(true)
      }

      currentVideo.addEventListener('playing', handlePlaying)

      return () => {
        currentVideo.removeEventListener('playing', handlePlaying)
      }
    }
  }, [])

  // Clean up khi component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Xử lý submit form
  const onSubmit = async (data: RegisterBodyType) => {
    try {
      setIsLoading(true)

      if (!capturedImage) {
        form.setError('faceImage', {
          type: 'manual',
          message: 'Vui lòng chụp ảnh khuôn mặt của bạn'
        })
        setIsLoading(false)
        return
      }

      console.log('Register data:', data)

      // TODO: Gửi data đến API, bao gồm ảnh khuôn mặt
      // Ví dụ: tạo FormData và gửi đến server
      const formData = new FormData()
      formData.append('lastName', data.lastName)
      formData.append('firstName', data.firstName)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      formData.append('department', data.department)
      formData.append('position', data.position)

      if (data.faceImage) {
        formData.append('faceImage', data.faceImage)
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Di chuyển đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login')
    } catch (error) {
      console.error('Đăng ký thất bại:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
      <Card className='w-full max-w-2xl shadow-lg'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Đăng ký tài khoản nhân viên mới</CardTitle>
          <CardDescription>Vui lòng nhập thông tin và chụp ảnh khuôn mặt để hoàn tất đăng ký</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <FormControl>
                          <Input placeholder='Nguyễn' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đệm và tên</FormLabel>
                        <FormControl>
                          <Input placeholder='Văn A' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='email@example.com' {...field} />
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
                          <Input type='password' placeholder='Nhập mật khẩu' {...field} />
                        </FormControl>
                        <FormDescription>Mật khẩu phải có ít nhất 6 ký tự</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='Nhập lại mật khẩu' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='department'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phòng ban</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn phòng ban' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='it'>Công nghệ thông tin</SelectItem>
                            <SelectItem value='hr'>Nhân sự</SelectItem>
                            <SelectItem value='accounting'>Kế toán</SelectItem>
                            <SelectItem value='marketing'>Marketing</SelectItem>
                            <SelectItem value='sales'>Kinh doanh</SelectItem>
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
                        <FormLabel>Vị trí công việc</FormLabel>
                        <FormControl>
                          <Input placeholder='Nhân viên, Quản lý...' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-4'>
                  <FormItem>
                    <FormLabel>Ảnh khuôn mặt</FormLabel>
                    <div className='flex flex-col items-center space-y-4'>
                      <div className='relative w-full h-[200px] border rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800'>
                        {/* Video element luôn tồn tại, chỉ ẩn khi không cần */}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`absolute top-0 left-0 w-full h-full object-cover ${
                            cameraActive && !capturedImage ? 'block' : 'hidden'
                          }`}
                          style={{ transform: 'scaleX(-1)' }}
                        />

                        {/* Hiệu ứng loading khi camera đang khởi động */}
                        {cameraActive && !capturedImage && !videoReady && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
                            <span className='ml-2 text-sm text-gray-500'>Đang khởi động camera...</span>
                          </div>
                        )}

                        {/* Các phần hiển thị khác */}
                        {capturedImage && (
                          <div className='relative w-full h-full'>
                            <img
                              src={capturedImage}
                              alt='Captured face'
                              className='absolute top-0 left-0 w-full h-full object-cover'
                            />
                            <div className='absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full'>
                              <Check size={16} />
                            </div>
                          </div>
                        )}

                        {!cameraActive && !capturedImage && (
                          <div className='flex flex-col items-center justify-center w-full h-full'>
                            <Camera className='h-12 w-12 text-gray-400' />
                            <p className='mt-2 text-sm text-gray-500'>Kích hoạt camera để chụp ảnh</p>
                          </div>
                        )}
                      </div>
                      {/* Ẩn canvas để xử lý ảnh */}
                      <canvas ref={canvasRef} className='hidden' />
                      {/* Hiển thị lỗi camera */}
                      {cameraError && (
                        <Alert variant='destructive'>
                          <AlertDescription>{cameraError}</AlertDescription>
                        </Alert>
                      )}
                      {!isCameraSupported && (
                        <Alert variant='destructive'>
                          <AlertTitle>Không hỗ trợ camera</AlertTitle>
                          <AlertDescription>
                            Trình duyệt của bạn không hỗ trợ truy cập camera. Vui lòng sử dụng trình duyệt hiện đại như
                            Chrome, Firefox hoặc Edge.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className='flex space-x-2'>
                        {!cameraActive && !capturedImage && (
                          <Button type='button' variant='outline' onClick={startCamera}>
                            <Camera className='mr-2 h-4 w-4' />
                            Kích hoạt camera
                          </Button>
                        )}

                        {cameraActive && !capturedImage && (
                          <Button type='button' onClick={captureImage}>
                            Chụp ảnh
                          </Button>
                        )}

                        {capturedImage && (
                          <Button type='button' variant='outline' onClick={retakeImage}>
                            Chụp lại
                          </Button>
                        )}

                        {cameraActive && (
                          <Button type='button' variant='ghost' onClick={stopCamera}>
                            Tắt camera
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                </div>
              </div>

              <Separator />

              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => navigate('/login')} disabled={isLoading}>
                  Đã có tài khoản? Đăng nhập
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
