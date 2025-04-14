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
