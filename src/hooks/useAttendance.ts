import { faceRecognitionService } from '@/services/attendance.service'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useFaceRecognition = () => {
  return useMutation({
    mutationFn: (imageBase64: string) => faceRecognitionService.checkIn(imageBase64),
    onError: (error) => {
      console.error('Face recognition error:', error)
      toast.error('lỗi', {
        description: 'Đã xảy ra lỗi khi kết nối với máy chủ.'
      })
    }
  })
}
