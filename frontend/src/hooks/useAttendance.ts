import { faceRecognitionService } from '@/services/attendance.service'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useFaceRecognition = () => {
  return useMutation({
    mutationFn: faceRecognitionService.checkIn,
    onError: (error) => {
      console.error('Face recognition error:', error)
      toast.error('Lỗi kết nối', {
        description: error.message || 'Đã xảy ra lỗi khi kết nối với máy chủ.'
      })
    }
  })
}
