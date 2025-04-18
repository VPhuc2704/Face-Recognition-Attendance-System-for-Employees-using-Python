import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Camera, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFaceRecognition } from '@/hooks/useAttendance'
import { toast } from 'sonner'
import { DepartmentLabels, DepartmentType, PositionLabels, PositionType } from '@/constants/type'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useCamera } from '@/hooks/useCamera'
import { useAutoCapture } from '@/hooks/useAutoCapture'
import { useEffect, useState } from 'react'

// Khai báo các hằng số
const MIN_FACE_SIZE = 10000 // kích thước khuôn mặt tối thiểu

export default function AttendanceCapture() {
  // State người được nhận diện
  const [recognizedPerson, setRecognizedPerson] = useState<any | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureImageRef = useRef<(() => void) | undefined>(undefined)
  const lastApiRequestTime = useRef<number>(0)
  const isProcessingApi = useRef<boolean>(false)

  // Custom hooks
  const { videoRef, cameraActive, videoReady, videoReadyRef, cameraError, startCamera, stopCamera } = useCamera()

  const { modelsLoaded, faceDetected, faceSize, startDetection, isFaceSufficient } = useFaceDetection({
    minFaceSize: MIN_FACE_SIZE
  })

  const {
    autoCapture,
    isAutoCapturing,
    lastCaptureTime,
    toggleAutoCapture,
    pauseAndResume,
    updateLastCaptureTime,
    canCapture
  } = useAutoCapture()

  const autoCaptuteRef = useRef(autoCapture)
  const isAutoCapturingRef = useRef(isAutoCapturing)

  const { mutate: checkIn, isPending: recognizing, data: recognitionData } = useFaceRecognition()

  // Bắt đầu phát hiện khuôn mặt khi video sẵn sàng
  useEffect(() => {
    if (videoReady && videoRef.current) {
      const cleanup = startDetection(videoRef.current)
      return cleanup
    }
  }, [videoReady, videoRef, startDetection])

  // Optimize image capture
  const optimizeImageBase64 = useCallback((imageBase64: string, maxWidth = 640): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Không thể tạo context canvas'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        resolve(optimizedBase64)
      }
      img.onerror = reject
      img.src = imageBase64
    })
  }, [])

  // Capture image function
  const captureImage = useCallback(async () => {
    if (isProcessingApi.current) {
      console.log('Đang xử lý API trước đó, bỏ qua')
      return
    }
    // Ghi log để debug
    console.log('Capture attempt', {
      faceDetected,
      faceSize,
      isFaceSufficient,
      videoReady,
      videoReadyRef: videoReadyRef?.current,
      recognizing,
      canCapture: canCapture(),
      isAutoCapturing,
      time: new Date().toISOString()
    })

    // Kiểm tra điều kiện cơ bản sử dụng ref thay vì state
    // Kiểm tra điều kiện cơ bản
    if (!videoRef.current || !canvasRef.current || !videoReadyRef.current || recognizing) {
      console.log('Không đủ điều kiện để chụp')
      return
    }

    if (!canCapture()) {
      console.log('Chưa đến thời gian chụp tiếp theo')
      return
    }

    // Kiểm tra thời gian từ lần gửi API trước
    const now = Date.now()
    if (now - lastApiRequestTime.current < 3000) {
      // 3 giây
      console.log(`Bỏ qua, vừa gửi API cách đây ${now - lastApiRequestTime.current}ms`)
      return
    }

    // Kiểm tra có khuôn mặt không
    if (!faceDetected) {
      // Chỉ hiển thị cảnh báo khi chụp thủ công
      if (!isAutoCapturing) {
        toast.warning('Không phát hiện khuôn mặt', {
          description: 'Vui lòng đảm bảo khuôn mặt của bạn nằm trong khung hình'
        })
      }
      return
    }

    // Kiểm tra khuôn mặt đủ lớn
    if (!isFaceSufficient) {
      // Chỉ hiển thị cảnh báo khi chụp thủ công
      if (!isAutoCapturing) {
        toast.warning('Khuôn mặt quá nhỏ', {
          description: 'Vui lòng di chuyển gần camera hơn'
        })
      }
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return

      // Cập nhật kích thước canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Lật ngang cho selfie view
      context.translate(canvas.width, 0)
      context.scale(-1, 1)

      // Vẽ khung hình hiện tại vào canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Chuyển đổi canvas thành ảnh base64
      let imageBase64 = canvas.toDataURL('image/jpeg', 0.8)

      // Tối ưu kích thước ảnh
      imageBase64 = await optimizeImageBase64(imageBase64)

      isProcessingApi.current = true
      lastApiRequestTime.current = now

      // Cập nhật thời gian chụp gần nhất
      updateLastCaptureTime()

      // Tạm dừng tự động chụp trong khi gửi API
      const wasAutoCapturing = isAutoCapturing
      if (wasAutoCapturing) {
        console.log('Tạm dừng tự động chụp trong khi gửi API')
        toggleAutoCapture(false)
      }

      // Gửi lên server để nhận diện
      console.log('Sending image for recognition')
      checkIn(imageBase64)
    } catch (err) {
      console.error('Error capturing image:', err)
      isProcessingApi.current = false
    }
  }, [
    videoRef,
    videoReadyRef,
    canvasRef,
    videoReady,
    recognizing,
    faceDetected,
    isFaceSufficient,
    isAutoCapturing,
    canCapture,
    optimizeImageBase64,
    updateLastCaptureTime,
    checkIn,
    faceSize
  ])

  // Gán captureImage vào ref sau khi nó đã được tạo
  useEffect(() => {
    captureImageRef.current = captureImage
  }, [captureImage])

  // Sửa handleStartCamera
  const handleStartCamera = async () => {
    // Đảm bảo tắt auto-capture hiện tại nếu có
    if (isAutoCapturing) {
      toggleAutoCapture(false)
    }

    const success = await startCamera()
    console.log('Camera started:', success)

    if (success) {
      // Đợi một chút để đảm bảo video đã sẵn sàng
      setTimeout(() => {
        // Kiểm tra trạng thái thực tế của video qua ref
        console.log('Checking video status after delay:', {
          stateReady: videoReady,
          refReady: videoReadyRef.current
        })

        if (videoReadyRef.current && captureImageRef.current && autoCapture) {
          console.log('Khởi tạo tự động chụp sau khi chắc chắn video sẵn sàng')
          toggleAutoCapture(true, captureImageRef.current)
        }
      }, 2000) // Đợi 2 giây
    }
  }

  // Handle camera stop
  const handleStopCamera = () => {
    toggleAutoCapture(false)
    stopCamera()
  }

  // Manual capture trigger
  const handleManualCapture = () => {
    toast('Đang nhận diện', {
      description: 'Vui lòng nhìn thẳng vào camera để được nhận diện'
    })
    captureImage()
  }

  // Reset state for next attendance
  const resetRecognition = () => {
    setRecognizedPerson(null)
  }

  // Sửa hàm handleToggleAutoCapture
  const handleToggleAutoCapture = (enabled: boolean) => {
    if (captureImageRef.current) {
      toggleAutoCapture(enabled, enabled ? captureImageRef.current : undefined)

      toast.info(enabled ? 'Tự động nhận diện đã bật' : 'Tự động nhận diện đã tắt', {
        description: enabled
          ? 'Hệ thống sẽ tự động nhận diện khuôn mặt mỗi 5 giây'
          : 'Bạn có thể nhấn nút "Nhận diện" để kiểm tra thủ công'
      })
    }
  }
  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    autoCaptuteRef.current = autoCapture
    isAutoCapturingRef.current = isAutoCapturing
  }, [autoCapture, isAutoCapturing])

  // Process recognition results
  useEffect(() => {
    if (!recognitionData) return
    isProcessingApi.current = false

    // Định nghĩa hành động khôi phục có độ trễ
    const resumeAutoCaptureLater = (delay = 2000) => {
      if (autoCapture && captureImageRef.current && !isAutoCapturing) {
        setTimeout(() => {
          console.log(`Khôi phục tự động chụp sau ${delay}ms`)
          toggleAutoCapture(true, captureImageRef.current)
        }, delay)
      }
    }

    // Thêm ID để tránh toast trùng lặp
    const toastId = `${recognitionData?.status}-${Date.now()}`

    switch (recognitionData?.status) {
      case 'success':
        if (recognitionData.employee) {
          setRecognizedPerson({
            id: recognitionData.employee.employeeId,
            name: recognitionData.employee.employee_name,
            department: recognitionData.employee.department,
            position: recognitionData.employee.position,
            employeeCode: recognitionData.employee.employee_code,
            checkInTime: recognitionData.attendance?.check_in || new Date().toLocaleString()
          })

          toast.success('Điểm danh thành công', {
            description: recognitionData.message,
            id: toastId
          })

          // Tạm dừng tự động chụp sau khi nhận diện thành công
          // Tạm dừng tự động chụp sau khi nhận diện thành công
          if (isAutoCapturing && captureImageRef.current) {
            console.log('Tạm dừng interval sau nhận diện thành công')
            pauseAndResume(captureImageRef.current)
          }
        }
        break

      case 'warning':
        toast.warning('Thông báo', {
          description: recognitionData.message,
          id: toastId
        })
        break

      case 'fail':
        // Chỉ hiển thị thông báo khi chụp thủ công để tránh quá nhiều thông báo
        if (!isAutoCapturing) {
          toast.error('Không nhận diện được', {
            description: recognitionData.message,
            id: toastId
          })
        }
        break

      case 'error':
        toast.error('Lỗi', {
          description: recognitionData.message,
          id: toastId
        })
        resumeAutoCaptureLater(7000)
        break
    }
  }, [recognitionData])

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Điểm danh nhân viên</h1>
        <p className='text-muted-foreground'>Hệ thống điểm danh tự động bằng nhận diện khuôn mặt</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='col-span-1 lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle>Camera nhận diện</CardTitle>
              <CardDescription>Đặt khuôn mặt trong khung hình để hệ thống nhận diện</CardDescription>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='auto-mode'
                checked={autoCapture}
                onCheckedChange={handleToggleAutoCapture}
                disabled={!cameraActive || !videoReady}
              />
              <Label htmlFor='auto-mode'>Tự động nhận diện</Label>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative w-full aspect-video border rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800'>
                {/* Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute top-0 left-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Camera waiting state */}
                {cameraActive && !videoReady && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
                    <span className='ml-2 text-sm text-gray-500'>Đang khởi động camera...</span>
                  </div>
                )}

                {/* Recognition interface overlay */}
                {cameraActive && videoReady && (
                  <div className='absolute inset-0'>
                    {/* Face scanning UI */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div
                        className={cn(
                          'w-48 h-48 border-2 rounded-full border-dashed transition-all duration-300',
                          recognizing ? 'animate-pulse border-yellow-400' : 'border-white/70',
                          faceDetected ? 'border-blue-400 scale-105' : '',
                          autoCapture && isAutoCapturing ? 'border-green-400/70' : ''
                        )}
                      >
                        {recognizing && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-yellow-400' />
                          </div>
                        )}
                      </div>

                      {/* Status indicator */}
                      <div className='absolute bottom-4 left-0 right-0 text-center flex justify-center'>
                        <Badge
                          variant={recognizing ? 'outline' : 'secondary'}
                          className={cn(
                            'px-3 py-1',
                            faceDetected ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : '',
                            autoCapture && isAutoCapturing
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : '',
                            recognizing ? 'animate-pulse' : ''
                          )}
                        >
                          {recognizing
                            ? 'Đang nhận diện...'
                            : !faceDetected
                              ? 'Không phát hiện khuôn mặt'
                              : faceSize < 10000
                                ? 'Vui lòng đến gần camera hơn'
                                : autoCapture && isAutoCapturing
                                  ? 'Đã phát hiện khuôn mặt - Tự động nhận diện'
                                  : 'Đã phát hiện khuôn mặt - Nhấn nút nhận diện'}
                        </Badge>
                      </div>
                    </div>

                    {/* Recently recognized person overlay - briefly show */}
                    {recognizedPerson && (
                      <div className='absolute top-4 left-4 right-4'>
                        <Alert className='bg-green-100/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top duration-300'>
                          <Check className='h-4 w-4 text-green-700 dark:text-green-300' />
                          <AlertDescription className='text-green-700 dark:text-green-300 flex items-center justify-between'>
                            <span>
                              Điểm danh thành công: <strong>{recognizedPerson.name}</strong>
                            </span>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={resetRecognition}
                              className='h-7 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200'
                            >
                              <RefreshCw className='h-3.5 w-3.5 mr-1' />
                              Tiếp tục
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                )}

                {/* Inactive camera state */}
                {!cameraActive && (
                  <div className='flex flex-col items-center justify-center w-full h-full'>
                    <Camera className='h-12 w-12 text-gray-400' />
                    <p className='mt-2 text-sm text-gray-500'>Kích hoạt camera để bắt đầu điểm danh</p>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capturing frames */}
              <canvas ref={canvasRef} className='hidden' />

              {/* Camera error display */}
              {cameraError && (
                <Alert variant='destructive' className='mt-4'>
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {/* Camera controls */}
              <div className='flex space-x-2'>
                {!cameraActive ? (
                  <Button onClick={handleStartCamera}>
                    <Camera className='mr-2 h-4 w-4' />
                    Bắt đầu điểm danh
                  </Button>
                ) : (
                  <>
                    <Button variant='outline' onClick={handleStopCamera}>
                      Dừng camera
                    </Button>
                    <Button disabled={!videoReady || recognizing} onClick={handleManualCapture}>
                      {recognizing ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Đang nhận diện...
                        </>
                      ) : (
                        'Nhận diện ngay'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between text-xs text-muted-foreground pt-0'>
            {autoCapture && cameraActive
              ? 'Chế độ tự động: Hệ thống sẽ liên tục kiểm tra khuôn mặt'
              : 'Chế độ thủ công: Nhấn nút "Nhận diện ngay" để điểm danh'}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả nhận diện</CardTitle>
            <CardDescription>Thông tin nhân viên vừa điểm danh</CardDescription>
          </CardHeader>
          <CardContent>
            {recognizedPerson ? (
              <div className='space-y-4'>
                <div className='flex flex-col items-center'>
                  <div className='w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2'>
                    <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
                  </div>
                  <h3 className='text-xl font-semibold'>{recognizedPerson.name}</h3>
                  {recognizedPerson.department && (
                    <Badge className='mt-1'>
                      {DepartmentLabels[recognizedPerson.department as DepartmentType] || recognizedPerson.department}
                    </Badge>
                  )}
                </div>

                <div className='space-y-2'>
                  {recognizedPerson.position && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Vị trí:</span>
                      <span className='font-medium'>
                        {PositionLabels[recognizedPerson.position as PositionType] || recognizedPerson.position}
                      </span>
                    </div>
                  )}
                  {recognizedPerson.employeeCode && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Mã nhân viên:</span>
                      <span className='font-medium'>{recognizedPerson.employeeCode}</span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Điểm danh lúc:</span>
                    <span className='font-medium'>{recognizedPerson.checkInTime}</span>
                  </div>
                </div>

                <Button className='w-full' variant='outline' disabled={true}>
                  <Check className='mr-2 h-4 w-4' />
                  Đã điểm danh thành công
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-[240px] text-center'>
                <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
                  <Camera className='h-6 w-6 text-gray-400' />
                </div>
                <p className='text-muted-foreground'>Chưa có nhân viên nào điểm danh</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {cameraActive
                    ? 'Hệ thống sẽ tự động nhận diện khi phát hiện khuôn mặt'
                    : 'Vui lòng kích hoạt camera để bắt đầu'}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className='block text-center'>
            <div className='text-xs text-muted-foreground mt-2'>
              {cameraActive
                ? recognizing
                  ? 'Đang xử lý khuôn mặt...'
                  : 'Sẵn sàng nhận diện'
                : 'Camera chưa được kích hoạt'}
            </div>
            {recognizedPerson && (
              <Button variant='ghost' size='sm' onClick={resetRecognition} className='mt-2 w-full text-xs'>
                <RefreshCw className='h-3 w-3 mr-1' />
                Xóa kết quả và tiếp tục điểm danh
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
