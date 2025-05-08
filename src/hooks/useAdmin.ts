import { adminService } from '@/services/admin.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AttendanceConfigFormValues,
  AttendanceConfigType,
  AttendanceHistoryResponseType,
  CreateEmployeeFormValues,
  EmployeeListResponseType,
  UpdateEmployeeFormValues
} from '@/schemas/admin.shema'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'
import { AttendanceStatus } from '@/constants/type'

// Hook để xuất file Excel
export const useExportAttendanceExcel = () => {
  return useMutation({
    mutationFn: (params: { date?: string; fromDate?: string; toDate?: string }) =>
      adminService.exportAttendanceExcel(params)
  })
}

export const useAttendanceHistory = () => {
  return useQuery({
    queryKey: ['attendance-history'],
    // queryFn: adminService.getHistory,
    queryFn: async () => {
      try {
        // Thêm log để theo dõi việc gọi API
        console.log('Đang gọi API lấy danh sách nhân viên...')
        const result = await adminService.getHistory()
        console.log('API trả về dữ liệu thành công', result.length, 'nhân viên')
        return result
      } catch (error) {
        console.error('Lỗi khi gọi API:', error)
        throw error
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

// Hook để lấy dữ liệu thống kê báo cáo theo thời gian
export const useAttendanceReport = (timeRange: string) => {
  const { data: attendances, isLoading, error } = useAttendanceHistory()
  const { data: employees } = useEmployeeList()

  // Trả về các dữ liệu đã được xử lý cho biểu đồ
  return {
    data: {
      summary: attendances ? generateSummaryData(attendances, timeRange) : null,
      weeklyData: attendances ? generateWeeklyData(attendances) : null,
      statusDistribution: attendances ? generateStatusDistributionData(attendances) : null,
      departmentData: attendances ? generateDepartmentData(attendances, employees) : null
    },
    isLoading,
    error
  }
}

// Hàm tạo dữ liệu tổng quan
const generateSummaryData = (attendances: AttendanceHistoryResponseType, timeRange: string) => {
  const today = new Date()
  let filteredData = attendances

  // Lọc dữ liệu theo thời gian được chọn
  if (timeRange === 'daily') {
    filteredData = attendances.filter((record) => record.date === format(today, 'yyyy-MM-dd'))
  } else if (timeRange === 'weekly') {
    const startDate = startOfWeek(today, { weekStartsOn: 1 }) // Tuần bắt đầu từ thứ 2
    const endDate = endOfWeek(today, { weekStartsOn: 1 })
    filteredData = attendances.filter((record) => {
      const recordDate = parseISO(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  } else if (timeRange === 'monthly') {
    filteredData = attendances.filter((record) => record.date.substring(0, 7) === format(today, 'yyyy-MM'))
  }

  const total = filteredData.length
  const onTime = filteredData.filter((record) => record.status === AttendanceStatus.Present).length
  const late = filteredData.filter((record) => record.status === AttendanceStatus.Late).length
  const absent = filteredData.filter((record) => record.status === AttendanceStatus.Absent).length

  return {
    total,
    onTime,
    late,
    absent
  }
}

// Hàm tạo dữ liệu cho biểu đồ cột theo tuần
const generateWeeklyData = (attendances: AttendanceHistoryResponseType) => {
  const today = new Date()
  const startDate = startOfWeek(today, { weekStartsOn: 1 }) // Bắt đầu từ thứ 2
  const endDate = endOfWeek(today, { weekStartsOn: 1 })
  const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate })

  const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

  return daysInWeek.map((day, index) => {
    const formattedDay = format(day, 'yyyy-MM-dd')
    const dayRecords = attendances.filter((record) => record.date === formattedDay)

    return {
      name: dayLabels[index],
      onTime: dayRecords.filter((record) => record.status === AttendanceStatus.Present).length,
      late: dayRecords.filter((record) => record.status === AttendanceStatus.Late).length,
      absent: dayRecords.filter((record) => record.status === AttendanceStatus.Absent).length
    }
  })
}

// Hàm tạo dữ liệu cho biểu đồ tròn
const generateStatusDistributionData = (attendances: AttendanceHistoryResponseType) => {
  const today = new Date()
  const startDate = startOfWeek(today, { weekStartsOn: 1 })
  const endDate = endOfWeek(today, { weekStartsOn: 1 })

  // Lọc dữ liệu của tuần hiện tại
  const weeklyRecords = attendances.filter((record) => {
    const recordDate = parseISO(record.date)
    return recordDate >= startDate && recordDate <= endDate
  })

  const onTime = weeklyRecords.filter((record) => record.status === AttendanceStatus.Present).length
  const late = weeklyRecords.filter((record) => record.status === AttendanceStatus.Late).length
  const absent = weeklyRecords.filter((record) => record.status === AttendanceStatus.Absent).length

  return [
    { name: 'Đúng giờ', value: onTime, color: '#22c55e' },
    { name: 'Đi muộn', value: late, color: '#eab308' },
    { name: 'Vắng mặt', value: absent, color: '#ef4444' }
  ]
}

// Hàm tạo dữ liệu cho biểu đồ phân bố theo phòng ban
const generateDepartmentData = (
  attendances: AttendanceHistoryResponseType,
  employees: EmployeeListResponseType | undefined
) => {
  if (!employees) return []

  // Tổng hợp nhân viên theo phòng ban
  const departmentMap = new Map()

  employees.forEach((emp) => {
    const department = emp.employee.department
    if (!departmentMap.has(department)) {
      departmentMap.set(department, [])
    }
    departmentMap.get(department).push(emp.employee.employee_code)
  })

  // Chuyển map thành mảng dữ liệu cho biểu đồ
  const result = []

  for (const [dept, empIds] of departmentMap.entries()) {
    // Lọc các bản ghi điểm danh thuộc phòng ban này
    const deptRecords = attendances.filter((record) => {
      // Kiểm tra employee_code có thuộc nhóm nhân viên của phòng ban này không
      return empIds.includes(record.employee.employee_code)
    })

    result.push({
      name: dept,
      onTime: deptRecords.filter((record) => record.status === AttendanceStatus.Present).length,
      late: deptRecords.filter((record) => record.status === AttendanceStatus.Late).length,
      absent: deptRecords.filter((record) => record.status === AttendanceStatus.Absent).length
    })
  }

  return result
}

export const useEmployeeList = () => {
  return useQuery({
    queryKey: ['employee-list'],
    queryFn: async () => {
      try {
        const result = await adminService.getEmployeeList()
        return result
      } catch (error) {
        console.error('Lỗi khi gọi API:', error)
        throw error
      }
    }
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeFormValues) => adminService.createEmployee(data),
    onSuccess: () => {
      // Khi tạo nhân viên thành công, cập nhật lại danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: ['employee-list'] })
    }
  })
}

// Hook để lấy thông tin chi tiết của một nhân viên
export const useGetEmployee = (id: number) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => adminService.getEmployee(id),
    enabled: !!id, // Chỉ thực hiện khi có id
    refetchOnWindowFocus: false
  })
}

// Hook để cập nhật thông tin nhân viên
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeFormValues }) => adminService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      // Khi cập nhật thành công, làm mới cache của nhân viên đã cập nhật
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
      // Cập nhật luôn danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: ['employee-list'] })
    }
  })
}

// Hook để xóa nhân viên
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminService.deleteEmployee(id),
    onSuccess: () => {
      // Khi xóa nhân viên thành công, cập nhật lại danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: ['employee-list'] })
    }
  })
}

// Hook để lấy cấu hình thời gian điểm danh
export const useAttendanceConfig = () => {
  return useQuery({
    queryKey: ['attendance-config'],
    queryFn: adminService.getAttendanceConfig,
    refetchOnWindowFocus: false
  })
}

// Hook để cập nhật cấu hình thời gian điểm danh
export const useUpdateAttendanceConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceConfigFormValues) => adminService.updateAttendanceConfig(data),
    onSuccess: () => {
      // Khi cập nhật thành công, làm mới cache của cấu hình
      queryClient.invalidateQueries({ queryKey: ['attendance-config'] })
    }
  })
}

// Hook để tạo mới cấu hình thời gian điểm danh
export const useCreateAttendanceConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceConfigFormValues) => adminService.createAttendanceConfig(data),
    onSuccess: () => {
      // Khi tạo mới thành công, làm mới cache của cấu hình
      queryClient.invalidateQueries({ queryKey: ['attendance-config'] })
    }
  })
}
