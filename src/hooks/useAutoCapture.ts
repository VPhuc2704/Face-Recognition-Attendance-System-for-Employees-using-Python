import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAutoCaptureOptions {
  captureInterval?: number
  pauseAfterRecognition?: number
  minCaptureDelay?: number
}

export function useAutoCapture(options: UseAutoCaptureOptions = {}) {
  const { captureInterval = 5000, pauseAfterRecognition = 10000, minCaptureDelay = 3000 } = options

  const [autoCapture, setAutoCapture] = useState(true)
  const [lastCaptureTime, setLastCaptureTime] = useState(0)
  const [isAutoCapturing, setIsAutoCapturing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Kiểm tra có thể chụp không dựa trên thời gian
  const canCapture = useCallback(() => {
    return Date.now() - lastCaptureTime >= minCaptureDelay
  }, [lastCaptureTime, minCaptureDelay])

  // Cập nhật thời gian chụp
  const updateLastCaptureTime = useCallback(() => {
    setLastCaptureTime(Date.now())
  }, [])

  // Hàm bắt đầu interval chụp tự động
  const startAutoCapture = useCallback((captureFunction: () => void) => {
    console.log('Starting auto capture with interval:', captureInterval)

    // Xóa interval cũ nếu có
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Tạo interval mới
    intervalRef.current = setInterval(() => {
      console.log('Auto capture interval triggered')
      // Bao bọc bằng try-catch để tránh lỗi
      try {
        captureFunction()
      } catch (error) {
        console.error('Error in auto capture function:', error)
      }
    }, captureInterval)

    setIsAutoCapturing(true)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setIsAutoCapturing(false)
      }
    }
  }, [])

  // Hàm dừng chụp tự động
  const stopAutoCapture = useCallback(() => {
    console.log('Stopping auto capture')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsAutoCapturing(false)
    }
  }, [])

  // Tạm dừng và tiếp tục sau một khoảng thời gian
  const pauseAndResume = useCallback(
    (captureFunction: () => void) => {
      console.log('Pausing auto capture')
      stopAutoCapture()

      // Đặt lịch tạo interval mới sau pauseAfterRecognition ms
      if (autoCapture) {
        console.log(`Will resume after ${pauseAfterRecognition}ms`)
        setTimeout(() => {
          if (autoCapture) {
            console.log('Resuming auto capture')
            startAutoCapture(captureFunction)
          }
        }, pauseAfterRecognition)
      }
    },
    [autoCapture, pauseAfterRecognition, startAutoCapture, stopAutoCapture]
  )

  // Bật/tắt chế độ tự động
  const toggleAutoCapture = useCallback(
    (enabled: boolean, captureFunction?: () => void) => {
      console.log(`Toggling auto capture: ${enabled}`)
      setAutoCapture(enabled)

      if (enabled && typeof captureFunction === 'function') {
        startAutoCapture(captureFunction)
      } else {
        stopAutoCapture()
      }
    },
    [startAutoCapture, stopAutoCapture]
  )

  // Export tất cả các hàm và state
  return {
    autoCapture,
    isAutoCapturing,
    lastCaptureTime,
    toggleAutoCapture,
    startAutoCapture,
    stopAutoCapture,
    pauseAndResume,
    updateLastCaptureTime,
    canCapture
  }
}
