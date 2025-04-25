import { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'

interface UseFaceDetectionOptions {
  minFaceSize?: number
  detectionInterval?: number
}

export function useFaceDetection(options: UseFaceDetectionOptions = {}) {
  const { minFaceSize = 10000, detectionInterval = 200 } = options

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceSize, setFaceSize] = useState(0)
  const [lastFrameProcessed, setLastFrameProcessed] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Tải models face detection
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ])
        setModelsLoaded(true)
        console.log('Face detection models loaded successfully')
      } catch (error) {
        console.error('Error loading face detection models:', error)
      }
    }

    loadModels()
  }, [])

  // Phát hiện khuôn mặt logic
  const startDetection = useCallback(
    (videoElement: HTMLVideoElement) => {
      videoRef.current = videoElement

      const detectFace = async () => {
        if (!videoRef.current) return

        const now = Date.now()
        if (now - lastFrameProcessed < detectionInterval) return
        setLastFrameProcessed(now)

        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.5
            })
          )

          const faceFound = detections.length > 0
          setFaceDetected(faceFound)

          if (faceFound) {
            const primaryFace = detections.sort((a, b) => b.box.area - a.box.area)[0]
            setFaceSize(primaryFace.box.area)
          } else {
            setFaceSize(0)
          }
        } catch (err) {
          console.error('Error during face detection:', err)
        }
      }

      const interval = setInterval(detectFace, detectionInterval)
      return () => clearInterval(interval)
    },
    [detectionInterval, lastFrameProcessed]
  )

  return {
    modelsLoaded,
    faceDetected,
    faceSize,
    startDetection,
    setFaceDetected,
    setFaceSize,
    isFaceSufficient: faceSize >= minFaceSize
  }
}
