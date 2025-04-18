import api from '@/api/axios'
import { FaceRecognitionRes, FaceRecognitionResType } from '@/schemas/attendance.shema'

export const faceRecognitionService = {
  checkIn: async (imageBase64: string): Promise<FaceRecognitionResType> => {
    try {
      const res = await api.post(
        '/face_recognition/check_in',
        {
          image: imageBase64
        },
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.timeEnd('API Request Time')
      const parsed = FaceRecognitionRes.parse(res.data)
      return parsed
    } catch (error) {
      console.timeEnd('API Request Time')
      throw error
    }
  }
}
