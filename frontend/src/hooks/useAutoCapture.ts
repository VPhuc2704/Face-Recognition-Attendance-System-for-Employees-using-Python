import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAutoCaptureOptions {
  initialDelay?: number
  subsequentDelay?: number
  minCaptureDelay?: number
}

export function useAutoCapture(options: UseAutoCaptureOptions = {}) {
  const {
    initialDelay = 50, // Giảm xuống gần như gọi ngay lập tức
    subsequentDelay = 5000, // Tăng lên để đảm bảo toast biến mất
    minCaptureDelay = 3000
  } = options

  const [autoCapture, setAutoCapture] = useState(true)
  const [lastCaptureTime, setLastCaptureTime] = useState(0)
  const [isAutoCapturing, setIsAutoCapturing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstCapture = useRef<boolean>(true)

  // Kiểm tra có thể chụp không dựa trên thời gian
  const canCapture = useCallback(() => {
    return Date.now() - lastCaptureTime >= minCaptureDelay
  }, [lastCaptureTime, minCaptureDelay])

  // Cập nhật thời gian chụp
  const updateLastCaptureTime = useCallback(() => {
    setLastCaptureTime(Date.now())
  }, [])

  // Dừng timeout hiện tại
  const stopAutoCapture = useCallback(() => {
    console.log('Stopping current auto capture process')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setIsAutoCapturing(false)
    }
  }, [])

  // Thay đổi từ setInterval thành setTimeout để có thể kiểm soát thời gian chờ giữa các lần
  const scheduleNextCapture = useCallback((captureFunction: () => void, delay: number) => {
    console.log(`Scheduling next capture in ${delay}ms`)

    // Xóa timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Đặt timeout mới
    timeoutRef.current = setTimeout(() => {
      console.log('Auto capture triggered')
      setIsAutoCapturing(true)

      try {
        captureFunction()
      } catch (error) {
        console.error('Error in auto capture function:', error)
      }

      // Sau khi capture, reset lại firstCapture flag
      isFirstCapture.current = false
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  // Bắt đầu quá trình tự động chụp
  const startAutoCapture = useCallback(
    (captureFunction: () => void) => {
      // Đặt cờ lần chụp đầu tiên
      isFirstCapture.current = true

      // Xác định thời gian chờ dựa vào là lần đầu hay không
      const delay = isFirstCapture.current ? initialDelay : subsequentDelay

      console.log(`Starting auto capture with initial delay: ${delay}ms`)
      setIsAutoCapturing(true)

      return scheduleNextCapture(captureFunction, delay)
    },
    [initialDelay, subsequentDelay, scheduleNextCapture]
  )

  // Tạm dừng và tiếp tục sau một khoảng thời gian
  const pauseAndResume = useCallback(
    (captureFunction: () => void) => {
      console.log('Pausing auto capture')
      stopAutoCapture()

      // Đặt lịch chụp tiếp theo sau khi có kết quả nhận diện
      if (autoCapture) {
        console.log(`Will resume after ${subsequentDelay}ms`)
        scheduleNextCapture(captureFunction, subsequentDelay)
      }
    },
    [autoCapture, subsequentDelay, scheduleNextCapture, stopAutoCapture]
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
    canCapture,
    scheduleNextCapture
  }
}
