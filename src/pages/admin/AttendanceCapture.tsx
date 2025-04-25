import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Camera, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFaceRecognition } from '@/hooks/useAttendance'
import { toast } from 'sonner'
import {
  ActionStatus,
  ActionStatusType,
  DepartmentLabels,
  DepartmentType,
  FaceRecognitionStatus,
  FaceRecognitionStatusType,
  PositionLabels,
  PositionType
} from '@/constants/type'
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
  const [attendanceMode, setAttendanceMode] = useState<ActionStatusType>(ActionStatus.CheckIn)

  // Custom hooks
  const { videoRef, cameraActive, videoReady, videoReadyRef, cameraError, startCamera, stopCamera } = useCamera()

  const { modelsLoaded, faceDetected, faceSize, startDetection, isFaceSufficient, setFaceDetected, setFaceSize } =
    useFaceDetection({
      minFaceSize: MIN_FACE_SIZE
    })

  const {
    autoCapture,
    isAutoCapturing,
    lastCaptureTime,
    toggleAutoCapture,
    pauseAndResume,
    updateLastCaptureTime,
    canCapture,
    scheduleNextCapture,
    stopAutoCapture
  } = useAutoCapture()

  const autoCaptuteRef = useRef(autoCapture)
  const isAutoCapturingRef = useRef(isAutoCapturing)
  const faceDetectedRef = useRef(faceDetected)
  const isFaceSufficientRef = useRef(isFaceSufficient)
  const delayedCaptureTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const defaultAutoCaptureRef = useRef(true) // Giá trị mặc định là true

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
      faceDetected: faceDetectedRef.current,
      faceSize,
      isFaceSufficient: isFaceSufficientRef.current,
      videoReady,
      videoReadyRef: videoReadyRef?.current,
      recognizing,
      canCapture: canCapture(),
      isAutoCapturing,
      time: new Date().toISOString()
    })
    // Kiểm tra điều kiện cơ bản
    if (!videoRef.current || !canvasRef.current || !videoReadyRef.current || recognizing) {
      console.log('Không đủ điều kiện để chụp')

      // THAY ĐỔI: Nếu đang ở chế độ tự động, lên lịch chụp lại
      if (isAutoCapturing && captureImageRef.current) {
        scheduleNextCapture(captureImageRef.current, 1000) // 1 giây sau sẽ thử lại
        console.log('Lên lịch thử lại sau 1 giây do camera chưa sẵn sàng hoặc đang xử lý')
      }
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

    // Thay vì return luôn, chỉ hiển thị toast và lên lịch chụp lại nếu đang ở chế độ tự động
    if (!faceDetectedRef.current) {
      if (!isAutoCapturing) {
        toast.warning('Không phát hiện khuôn mặt', {
          description: 'Vui lòng đảm bảo khuôn mặt của bạn nằm trong khung hình'
        })
      } else {
        // Đang ở chế độ tự động, lên lịch chụp lại sau 1 giây
        console.log('Không phát hiện được khuôn mặt, sẽ thử lại sau 1 giây')
        if (captureImageRef.current) {
          scheduleNextCapture(captureImageRef.current, 1000)
        }
      }
      return
    }

    if (!isFaceSufficientRef.current) {
      if (!isAutoCapturing) {
        toast.warning('Khuôn mặt quá nhỏ', {
          description: 'Vui lòng di chuyển gần camera hơn'
        })
      } else {
        // Đang ở chế độ tự động, lên lịch chụp lại sau 1 giây
        console.log('Khuôn mặt quá nhỏ, sẽ thử lại sau 1 giây')
        if (captureImageRef.current) {
          scheduleNextCapture(captureImageRef.current, 1000)
        }
      }
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) {
        if (isAutoCapturing && captureImageRef.current) {
          scheduleNextCapture(captureImageRef.current, 1000) // Thử lại sau 1 giây
        }
        return
      }

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
        stopAutoCapture()
      }

      // Gửi lên server để nhận diện
      console.log('Sending image for recognition')
      checkIn({
        image: imageBase64,
        action: attendanceMode
      })
    } catch (err) {
      console.error('Error capturing image:', err)
      isProcessingApi.current = false

      // Hiển thị thông báo lỗi chụp ảnh
      toast.error('Lỗi chụp ảnh', {
        description: 'Không thể xử lý hình ảnh. Vui lòng thử lại.'
      })

      // THAY ĐỔI: Nếu đang ở chế độ tự động, lên lịch chụp lại sau lỗi
      if (isAutoCapturing && captureImageRef.current) {
        scheduleNextCapture(captureImageRef.current, 3000) // 3 giây sau khi có lỗi
      }
    }
  }, [
    videoRef,
    videoReadyRef,
    canvasRef,
    videoReady,
    recognizing,
    faceDetected,
    faceDetectedRef,
    isFaceSufficient,
    isFaceSufficientRef,
    isAutoCapturing,
    canCapture,
    optimizeImageBase64,
    updateLastCaptureTime,
    checkIn,
    faceSize,
    toggleAutoCapture,
    attendanceMode,
    scheduleNextCapture
  ])

  // Gán captureImage vào ref sau khi nó đã được tạo
  useEffect(() => {
    captureImageRef.current = captureImage
  }, [captureImage])

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    faceDetectedRef.current = faceDetected
  }, [faceDetected])

  // Thêm useEffect để cập nhật ref khi state thay đổi
  useEffect(() => {
    isFaceSufficientRef.current = isFaceSufficient
  }, [isFaceSufficient])

  // Sửa handleStartCamera
  const handleStartCamera = async () => {
    // Reset trạng thái khi bắt đầu camera mới
    isProcessingApi.current = false
    lastApiRequestTime.current = 0

    // Reset face detection state
    setFaceDetected(false)
    faceDetectedRef.current = false
    setFaceSize(0)

    // Lưu lại trạng thái tự động chụp hiện tại trước khi tắt nó
    const shouldResumeAutoCapture = defaultAutoCaptureRef.current

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
          refReady: videoReadyRef.current,
          shouldResumeAutoCapture
        })

        if (videoReadyRef.current && captureImageRef.current && shouldResumeAutoCapture) {
          console.log('Khởi tạo tự động chụp sau khi chắc chắn video sẵn sàng')
          toggleAutoCapture(true, captureImageRef.current)
        }
      }, 2000) // Đợi 2 giây
    }
  }

  // Handle camera stop
  const handleStopCamera = () => {
    toggleAutoCapture(false)

    // Xóa tất cả các timeout đang chờ
    clearAllDelayedCaptures()

    // Reset các state và ref liên quan
    isProcessingApi.current = false
    processedDataRef.current = null
    setRecognizedPerson(null)

    // Reset các ref quan trọng
    videoReadyRef.current = false // QUAN TRỌNG: Đánh dấu video đã không còn sẵn sàng
    faceDetectedRef.current = false // Reset trạng thái nhận diện khuôn mặt
    isFaceSufficientRef.current = false // Reset trạng thái khuôn mặt đủ lớn
    autoCaptuteRef.current = false // Reset trạng thái tự động chụp
    isAutoCapturingRef.current = false // Reset trạng thái đang tự động chụp

    stopCamera()
    console.log(videoReadyRef.current)
    console.log(captureImageRef.current)
    console.log(autoCapture)
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

  // Sửa hàm handleToggleAutoCapture với useCallback
  const handleToggleAutoCapture = useCallback(
    (enabled: boolean) => {
      // Lưu trạng thái mới vào ref
      defaultAutoCaptureRef.current = enabled

      if (captureImageRef.current) {
        toggleAutoCapture(enabled, enabled ? captureImageRef.current : undefined)
      }
    },
    [toggleAutoCapture] // Chỉ phụ thuộc vào toggleAutoCapture
  )

  // Thêm hàm để hủy tất cả các timeout đang chờ
  const clearAllDelayedCaptures = useCallback(() => {
    console.log(`Clearing ${delayedCaptureTimeoutsRef.current.length} pending capture timeouts`)
    delayedCaptureTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    delayedCaptureTimeoutsRef.current = []
  }, [])

  useEffect(() => {
    if (cameraActive && videoReady && videoRef.current) {
      // console.log('Reinitializing face detection after camera restart')
      const cleanup = startDetection(videoRef.current)
      return cleanup
    }
  }, [cameraActive, videoReady, videoRef, startDetection])

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    autoCaptuteRef.current = autoCapture
    isAutoCapturingRef.current = isAutoCapturing
    // Nếu đang bật tự động chụp nhưng không có hoạt động nào được lên lịch
    if (autoCapture && !isAutoCapturing && captureImageRef.current) {
      console.log('Phát hiện chế độ tự động đang bật nhưng không có chụp đang diễn ra, khởi động lại')
      // Thử khởi động lại chế độ tự động sau 2 giây
      const timer = setTimeout(() => {
        if (autoCapture && captureImageRef.current && !isAutoCapturing) {
          scheduleNextCapture(captureImageRef.current, 50)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [autoCapture, isAutoCapturing])

  const processedDataRef = useRef<string | null>(null)

  // Process recognition results
  useEffect(() => {
    // Nếu mutation đang lỗi, cũng reset trạng thái xử lý API
    if (recognizing === false && isProcessingApi.current) {
      console.log('API có thể đã gặp lỗi, reset trạng thái')
      isProcessingApi.current = false
    }

    // Nếu không có dữ liệu mới hoặc đã xử lý dữ liệu này rồi, thoát
    if (!recognitionData || processedDataRef.current === JSON.stringify(recognitionData)) {
      return
    }

    console.log('Xử lý dữ liệu nhận diện mới', recognitionData.status)
    isProcessingApi.current = false

    switch (recognitionData?.status) {
      case 'success':
        if (recognitionData.employee) {
          setRecognizedPerson({
            id: recognitionData.employee.employeeId,
            name: recognitionData.employee.employee_name,
            department: recognitionData.employee.department,
            position: recognitionData.employee.position,
            employeeCode: recognitionData.employee.employee_code,
            checkInTime:
              recognitionData.attendance?.check_in ||
              recognitionData.attendance?.check_out ||
              new Date().toLocaleString(),
            mode: recognitionData.status || attendanceMode // lưu mode để hiển thị đúng
          })

          toast.success('Điểm danh thành công', {
            description: recognitionData.message
          })
        }
        break

      case 'warning':
        // Hiển thị nhiều thông tin hơn trong toast
        toast.warning('Nhân viên đã điểm danh', {
          description: recognitionData.message
        })

        // Vẫn cập nhật thông tin người dùng để hiển thị
        if (recognitionData.employee) {
          setRecognizedPerson({
            id: recognitionData.employee.employeeId,
            name: recognitionData.employee.employee_name,
            department: recognitionData.employee.department,
            position: recognitionData.employee.position,
            employeeCode: recognitionData.employee.employee_code,
            checkInTime:
              recognitionData.attendance?.check_in ||
              recognitionData.attendance?.check_out ||
              new Date().toLocaleString(),
            mode: recognitionData.status || attendanceMode
          })
        }
        break

      case 'fail':
        toast.error('Không nhận diện được', {
          description: recognitionData.message
        })
        break

      case 'error':
        toast.error('Lỗi', {
          description: recognitionData.message
        })
        break
    }
  }, [recognitionData, scheduleNextCapture])

  // Tạo useEffect riêng cho việc xử lý auto capture sau khi nhận diện
  useEffect(() => {
    if (!recognitionData) return

    // Nếu đang ở chế độ tự động và có kết quả API, lên lịch cho lần chụp tiếp theo
    if (autoCapture && captureImageRef.current) {
      const delay = getDelayBasedOnStatus(recognitionData.status)

      // Chờ một khoảng thời gian trước khi tiếp tục tự động nhận diện
      const timeoutId = setTimeout(() => {
        console.log(`Tiếp tục tự động nhận diện sau ${delay}ms`)

        // Bắt đầu chu kỳ chụp tiếp theo nếu vẫn đang ở chế độ tự động
        if (autoCapture && captureImageRef.current) {
          scheduleNextCapture(captureImageRef.current, 50) // Bắt đầu chụp ngay lần tiếp theo
        }
      }, delay)

      // Lưu timeout ID để có thể hủy khi cần
      delayedCaptureTimeoutsRef.current.push(timeoutId)
      // Cleanup function
      return () => {
        clearTimeout(timeoutId)
        // Xóa timeout này khỏi danh sách
        delayedCaptureTimeoutsRef.current = delayedCaptureTimeoutsRef.current.filter((id) => id !== timeoutId)
      }
    }
  }, [recognitionData, autoCapture])

  // Hàm helper để xác định thời gian chờ dựa trên kết quả API
  const getDelayBasedOnStatus = (status: FaceRecognitionStatusType) => {
    switch (status) {
      case 'success':
        return 5000 // 5 giây để người dùng xem kết quả thành công
      case 'warning':
        return 5000 // 5 giây cho cảnh báo đã điểm danh
      case 'error':
        return 5000 // 5 giây cho lỗi
      case 'fail':
        return 3000 // 3 giây khi không nhận diện được
      default:
        return 5000
    }
  }

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
            <div className='flex flex-col gap-2'>
              {/* Thêm switch chọn mode check-in/check-out */}
              <div className='flex items-center space-x-2'>
                <Switch
                  id='attendance-mode'
                  checked={attendanceMode === 'check_out'}
                  onCheckedChange={(checked) => setAttendanceMode(checked ? 'check_out' : 'check_in')}
                  // disabled={!cameraActive || !videoReady || recognizing}
                />
                <Label htmlFor='attendance-mode'>
                  {attendanceMode === 'check_in' ? 'Chế độ Check-in' : 'Chế độ Check-out'}
                </Label>
              </div>

              {/* Switch tự động điểm danh giữ nguyên */}
              <div className='flex items-center space-x-2'>
                <Switch
                  id='auto-mode'
                  checked={autoCapture}
                  onCheckedChange={handleToggleAutoCapture}
                  disabled={!cameraActive || !videoReady}
                />
                <Label htmlFor='auto-mode'>Tự động nhận diện</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <div className='flex flex-col items-center space-y-4'>
              {/* Sử dụng chiều cao cố định thay vì aspect-ratio */}
              <div
                className='relative w-full border rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800'
                style={{ height: 'calc(min(60vh, 56.25vw))' }} // 16:9 ratio but capped at 60vh
              >
                {/* Reset cách hiển thị của video */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`max-w-full max-h-full ${cameraActive ? 'block' : 'hidden'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
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
                    {recognizedPerson && recognizedPerson.mode === FaceRecognitionStatus.Success && (
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

        {/* Card hiển thị kết quả nhận diện */}
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
                  {/* Hiển thị trạng thái là check-in hay check-out thành công */}
                  <Badge
                    className='mt-1'
                    variant={recognizedPerson.mode === ActionStatus.CheckIn ? 'default' : 'secondary'}
                  >
                    {recognizedPerson.mode === 'check_in' ? 'Check-in' : 'Check-out'}
                  </Badge>
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
