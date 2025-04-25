import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns/format'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hàm định dạng ngày từ chuỗi ISO
export const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy')
  } catch (e) {
    return dateStr
  }
}

// Hàm định dạng thời gian check-in/check-out
export const formatAttendanceTime = (timeString: string | null): string => {
  if (!timeString) return ''
  try {
    const date = new Date(timeString)
    return format(date, 'HH:mm:ss')
  } catch (e) {
    return ''
  }
}

// Hàm định dạng chuỗi thời gian YYYY-MM-DD HH:MM:SS thành định dạng địa phương
export const formatDateTime = (dateTimeStr: string | null | undefined) => {
  if (!dateTimeStr) return null
  try {
    // Xử lý chuỗi thời gian có định dạng "YYYY-MM-DD HH:MM:SS"
    const [datePart, timePart] = dateTimeStr.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute, second] = timePart.split(':').map(Number)

    const date = new Date(year, month - 1, day, hour, minute, second)

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  } catch (e) {
    console.error('Lỗi khi định dạng thời gian:', e)
    return dateTimeStr
  }
}

// Hàm chuyển đổi date string (dạng DD/MM/YYYY) thành định dạng YYYY-MM-DD cho input date
export const formatDateForInput = (dateString: string) => {
  try {
    if (!dateString) return ''

    // Nếu đã ở định dạng YYYY-MM-DD
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      return dateString
    }

    // Chuyển từ DD/MM/YYYY sang YYYY-MM-DD
    const parts = dateString.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }

    // Chuyển từ định dạng ISO string
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch (e) {
    console.error('Lỗi chuyển đổi định dạng ngày:', e)
    return ''
  }
}
