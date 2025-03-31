import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Camera, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AttendanceCapture() {
  const [cameraActive, setCameraActive] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [isCameraSupported, setIsCameraSupported] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizedPerson, setRecognizedPerson] = useState<any | null>(null)
  const [attendanceRecorded, setAttendanceRecorded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Khởi động camera
  const startCamera = async () => {
    if (!cameraActive) {
      try {
        setCameraError(null)
        setVideoReady(false)
        setRecognizedPerson(null)
        setAttendanceRecorded(false)

        console.log('Starting camera...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                console.log('Video playback started')
                setVideoReady(true)
              })
              .catch((e) => {
                console.error('Failed to play video:', e)
                setCameraError('Không thể hiển thị video từ camera.')
              })
          }
        }
      } catch (err) {
        console.error('Không thể kết nối với camera:', err)
        setCameraError(
          'Không thể kết nối với camera. Vui lòng kiểm tra quyền truy cập và thử lại.',
        )
      }
    }
  }

  // Tắt camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setVideoReady(false)
      setRecognizing(false)
    }
  }

  // Nhận diện khuôn mặt (giả lập)
  const recognizeFace = async () => {
    if (!cameraActive || !videoReady) return

    setRecognizing(true)

    // Giả lập API nhận diện
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Random nhận diện thành công hoặc thất bại để demo
    const recognized = Math.random() > 0.3

    if (recognized) {
      // Giả lập dữ liệu nhân viên được nhận diện
      setRecognizedPerson({
        id: 2,
        name: 'Jane Smith',
        department: 'HR',
        position: 'Manager',
        lastAttendance: '2023-06-10 08:45',
      })
    } else {
      setRecognizedPerson(null)
      setCameraError(
        'Không thể nhận diện khuôn mặt. Vui lòng thử lại hoặc kiểm tra ánh sáng.',
      )
    }

    setRecognizing(false)
  }

  // Ghi nhận điểm danh
  const recordAttendance = async () => {
    if (!recognizedPerson) return

    // Giả lập API ghi nhận điểm danh
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setAttendanceRecorded(true)

    // Sau 3 giây, reset lại trạng thái để tiếp tục điểm danh người khác
    setTimeout(() => {
      setRecognizedPerson(null)
      setAttendanceRecorded(false)
    }, 3000)
  }

  // Clean up khi component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Trình xử lý sự kiện onPlaying để đảm bảo video thực sự đang chạy
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

  // Tự động nhận diện khi camera sẵn sàng
  useEffect(() => {
    if (cameraActive && videoReady && !recognizing && !recognizedPerson) {
      const timer = setTimeout(() => {
        recognizeFace()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [cameraActive, videoReady, recognizing, recognizedPerson])

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Điểm danh nhân viên
        </h1>
        <p className="text-muted-foreground">
          Sử dụng nhận diện khuôn mặt để điểm danh nhân viên một cách nhanh
          chóng và chính xác.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Camera nhận diện</CardTitle>
            <CardDescription>
              Đặt khuôn mặt trong khung hình để hệ thống nhận diện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute top-0 left-0 w-full h-full object-cover ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Camera waiting state */}
                {cameraActive && !videoReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">
                      Đang khởi động camera...
                    </span>
                  </div>
                )}

                {/* Face recognition interface */}
                {cameraActive && videoReady && (
                  <div className="absolute inset-0">
                    {/* Scanning interface */}
                    {!recognizedPerson && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={cn(
                            'w-48 h-48 border-2 rounded-full border-dashed',
                            recognizing
                              ? 'animate-pulse border-yellow-400'
                              : 'border-white',
                          )}
                        >
                          {recognizing && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <Badge
                            variant={recognizing ? 'outline' : 'secondary'}
                            className="animate-pulse"
                          >
                            {recognizing
                              ? 'Đang nhận diện...'
                              : 'Đặt khuôn mặt trong khung hình'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inactive camera state */}
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Camera className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Kích hoạt camera để bắt đầu điểm danh
                    </p>
                  </div>
                )}
              </div>

              {/* Canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera error display */}
              {cameraError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {/* Camera controls */}
              <div className="flex space-x-2">
                {!cameraActive ? (
                  <Button onClick={startCamera}>
                    <Camera className="mr-2 h-4 w-4" />
                    Bắt đầu điểm danh
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={stopCamera}>
                      Dừng camera
                    </Button>
                    <Button
                      disabled={!videoReady || recognizing}
                      onClick={recognizeFace}
                    >
                      {recognizing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang nhận diện...
                        </>
                      ) : (
                        'Nhận diện thủ công'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả nhận diện</CardTitle>
            <CardDescription>
              Thông tin nhân viên được nhận diện
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recognizedPerson ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {recognizedPerson.name}
                  </h3>
                  <Badge className="mt-1">{recognizedPerson.department}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vị trí:</span>
                    <span className="font-medium">
                      {recognizedPerson.position}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Điểm danh gần đây:
                    </span>
                    <span className="font-medium">
                      {recognizedPerson.lastAttendance}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={attendanceRecorded}
                  onClick={recordAttendance}
                >
                  {attendanceRecorded ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Đã điểm danh thành công
                    </>
                  ) : (
                    'Xác nhận điểm danh'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-muted-foreground">
                  Chưa có khuôn mặt nào được nhận diện
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hãy đảm bảo người cần điểm danh đứng trong khung hình
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <div className="text-xs text-muted-foreground text-center mt-2">
              {cameraActive
                ? 'Camera đang hoạt động'
                : 'Camera chưa được kích hoạt'}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
