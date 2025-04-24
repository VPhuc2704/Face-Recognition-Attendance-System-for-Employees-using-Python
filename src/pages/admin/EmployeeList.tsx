import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Search, MoreVertical, Filter, UserPlus, Loader2, AlertTriangle } from 'lucide-react'
import { EmployeeType } from '@/schemas/admin.shema'
import { useDeleteEmployee, useEmployeeList } from '@/hooks/useAdmin'
import { DepartmentLabels, DepartmentType, PositionLabels, PositionType, Status, StatusLabels } from '@/constants/type'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function EmployeeList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeType | null>(null)

  // Sử dụng hook để lấy dữ liệu và xóa nhân viên
  const { data: employeesData, isLoading, error } = useEmployeeList()
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee()

  // Lọc nhân viên theo từ khóa tìm kiếm
  const filteredEmployees =
    employeesData?.filter(
      (employee) =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  // Xem chi tiết nhân viên
  const handleViewEmployee = (employee: EmployeeType) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  // Thêm nhân viên mới
  const handleAddEmployee = () => {
    navigate('/admin/employees/create')
  }

  // Chỉnh sửa thông tin nhân viên
  const handleEditEmployee = (employeeId: number) => {
    navigate(`/admin/employees/edit/${employeeId}`)
  }

  // Mở dialog xác nhận xóa nhân viên
  const handleConfirmDelete = (employee: EmployeeType) => {
    setEmployeeToDelete(employee)
    setIsDeleteDialogOpen(true)
  }

  // Xóa nhân viên sau khi xác nhận
  const handleDeleteEmployee = () => {
    if (!employeeToDelete) return

    deleteEmployee(employeeToDelete.id, {
      onSuccess: () => {
        toast.success('Xóa nhân viên thành công')
        setIsDeleteDialogOpen(false)
        setEmployeeToDelete(null)
      },
      onError: (error) => {
        console.error('Lỗi khi xóa nhân viên:', error)
        toast.error('Có lỗi xảy ra khi xóa nhân viên')
      }
    })
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý nhân viên</h1>
        <p className='text-muted-foreground'>Xem và quản lý tất cả nhân viên đã đăng ký trong hệ thống.</p>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>Tổng số {employeesData?.length || 0} nhân viên trong hệ thống.</CardDescription>
            </div>
            <div className='flex flex-col sm:flex-row gap-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
                <Input
                  type='search'
                  placeholder='Tìm kiếm nhân viên...'
                  className='pl-8 w-full md:w-[250px]'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant='outline' className='flex items-center'>
                <Filter className='mr-2 h-4 w-4' />
                Bộ lọc
              </Button>
              <Button onClick={handleAddEmployee}>
                <UserPlus className='mr-2 h-4 w-4' />
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className='flex justify-center items-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <span className='ml-2'>Đang tải dữ liệu...</span>
            </div>
          )}
          {error && (
            <div className='py-8 text-center text-red-500'>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</div>
          )}
          {!isLoading && !error && (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className='font-medium'>{employee.employee.employee_code || 'Chưa có mã'}</TableCell>
                        <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          {employee.employee.department &&
                          DepartmentLabels[employee.employee.department as DepartmentType] ? (
                            <Badge variant='outline'>
                              {DepartmentLabels[employee.employee.department as DepartmentType]}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>{PositionLabels[employee.employee.position as PositionType]}</TableCell>
                        <TableCell>
                          <Badge variant={employee.employee.status === Status.Active ? 'default' : 'secondary'}>
                            {StatusLabels[employee.employee.status]}
                          </Badge>
                        </TableCell>

                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Mở menu</span>
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEmployee(employee.id)}>
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className='text-red-500' onClick={() => handleConfirmDelete(employee)}>
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-6 text-muted-foreground'>
                        Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog xem chi tiết nhân viên */}
      {selectedEmployee && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Thông tin nhân viên</DialogTitle>
              <DialogDescription>Chi tiết thông tin của nhân viên {selectedEmployee.firstName}</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='flex flex-col items-center mb-4'>
                <div className='w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden'>
                  {selectedEmployee.employee.employeeImg ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL || ''}${selectedEmployee.employee.employeeImg}`}
                      alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${selectedEmployee.firstName.replace(' ', '+')}+${selectedEmployee.lastName.replace(' ', '+')}&background=random`}
                      alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                      className='w-full h-full object-cover'
                    />
                  )}
                </div>
                <h3 className='font-semibold text-lg'>
                  {' '}
                  {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                </h3>
                <Badge variant='outline' className='mt-1'>
                  {selectedEmployee.employee.position}
                </Badge>
              </div>

              <div className='grid grid-cols-3 gap-2 text-sm'>
                <div className='font-medium'>Mã nhân viên:</div>
                <div className='col-span-2'>{selectedEmployee.employee.employee_code || 'Chưa có mã'}</div>

                <div className='font-medium'>Email:</div>
                <div className='col-span-2'>{selectedEmployee.email}</div>

                <div className='font-medium'>Số điện thoại:</div>
                <div className='col-span-2'>{selectedEmployee.employee.phone || 'Chưa cập nhật'}</div>

                <div className='font-medium'>Ngày sinh:</div>
                <div className='col-span-2'>
                  {selectedEmployee.employee.date_of_birth
                    ? formatDate(selectedEmployee.employee.date_of_birth)
                    : 'Chưa cập nhật'}
                </div>

                <div className='font-medium'>Phòng ban:</div>
                <div className='col-span-2'>
                  {DepartmentLabels[selectedEmployee.employee.department as DepartmentType]}
                </div>

                <div className='font-medium'>Vị trí:</div>
                <div className='col-span-2'>{PositionLabels[selectedEmployee.employee.position as PositionType]}</div>

                <div className='font-medium'>Ngày bắt đầu:</div>
                <div className='col-span-2'>
                  {selectedEmployee.employee.start_date
                    ? formatDate(selectedEmployee.employee.start_date)
                    : 'Chưa cập nhật'}
                </div>

                <div className='font-medium'>Địa chỉ:</div>
                <div className='col-span-2'>{selectedEmployee.employee.address || 'Chưa cập nhật'}</div>

                <div className='font-medium'>Trạng thái:</div>
                <div className='col-span-2'>
                  <Badge variant={selectedEmployee.employee.status === 'Active' ? 'default' : 'secondary'}>
                    {StatusLabels[selectedEmployee.employee.status]}
                  </Badge>
                </div>
              </div>
            </div>
            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setIsViewDialogOpen(false)}>
                Đóng
              </Button>
              <div className='space-x-2'>
                <Button
                  variant='destructive'
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleConfirmDelete(selectedEmployee)
                  }}
                >
                  Xóa
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditEmployee(selectedEmployee.id)
                  }}
                >
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận xóa nhân viên */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-red-500 gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Xác nhận xóa nhân viên
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên{' '}
              <span className='font-semibold'>
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </span>{' '}
              không? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn tất cả dữ liệu của nhân viên này.
            </DialogDescription>
          </DialogHeader>

          <Alert variant='destructive' className='mb-4'>
            <AlertTitle className='flex items-center'>
              <AlertTriangle className='h-4 w-4 mr-2' />
              Cảnh báo quan trọng
            </AlertTitle>
            <AlertDescription className='pl-6'>
              Việc xóa nhân viên sẽ đồng thời xóa tất cả dữ liệu liên quan như lịch sử điểm danh, thông tin cá nhân. Hãy
              chắc chắn rằng bạn đã sao lưu dữ liệu cần thiết.
            </AlertDescription>
          </Alert>

          <DialogFooter className='sm:justify-between'>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Hủy bỏ
            </Button>
            <Button variant='destructive' onClick={handleDeleteEmployee} disabled={isDeleting}>
              {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
