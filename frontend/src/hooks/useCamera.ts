import { useState, useRef, useCallback } from 'react'

export function useCamera() {
  const [cameraActive, setCameraActive] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoReadyRef = useRef(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      setVideoReady(false)
      videoReadyRef.current = false

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        return new Promise<boolean>((resolve) => {
          if (!videoRef.current) return resolve(false)

          // Đặt một timeout an toàn để tránh treo vô hạn
          const timeoutId = setTimeout(() => {
            console.warn('Video loading timed out, resolving anyway')
            setVideoReady(true)
            resolve(true)
          }, 5000)

          // Xử lý sự kiện khi dữ liệu video được tải
          videoRef.current.onloadeddata = () => {
            console.log('Video element data loaded')
            clearTimeout(timeoutId)
            videoReadyRef.current = true
            setVideoReady(true)

            // Chỉ resolve sau khi video đã sẵn sàng
            setTimeout(() => {
              resolve(true)
            }, 500)
          }

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                console.log('Video is playing')
                videoReadyRef.current = true
                setVideoReady(true)
              })
              .catch((e) => {
                console.error('Failed to play video:', e)
                setCameraError('Không thể hiển thị video từ camera.')
                clearTimeout(timeoutId)
                resolve(false)
              })
          }
        })
      }
      return false
    } catch (err) {
      console.error('Không thể kết nối với camera:', err)
      setCameraError('Không thể kết nối với camera. Vui lòng kiểm tra quyền truy cập và thử lại.')
      return false
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setVideoReady(false)
    }
  }, [])

  return {
    videoRef,
    cameraActive,
    videoReady,
    videoReadyRef,
    cameraError,
    startCamera,
    stopCamera
  }
}
