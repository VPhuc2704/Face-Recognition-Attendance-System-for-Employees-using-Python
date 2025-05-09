import api from '@/api/axios'
import { FaceRecognitionReqType, FaceRecognitionRes, FaceRecognitionResType } from '@/schemas/attendance.shema'

export const faceRecognitionService = {
  checkIn: async (body: FaceRecognitionReqType): Promise<FaceRecognitionResType> => {
    try {
      const res = await api.post('/face_recognition/check_in', body, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const parsed = FaceRecognitionRes.parse(res.data)
      return parsed
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
