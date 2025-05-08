import React, { useState } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, Download, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useExportAttendanceExcel } from '@/hooks/useAdmin'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type ExportOption = 'all' | 'today' | 'specific-date' | 'date-range'

export function ExportExcelDialog() {
  const [open, setOpen] = useState(false)
  const [exportOption, setExportOption] = useState<ExportOption>('today')
  const [specificDate, setSpecificDate] = useState<Date | undefined>(new Date())
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date())
  const [toDate, setToDate] = useState<Date | undefined>(new Date())

  const exportExcelMutation = useExportAttendanceExcel()

  const handleExportExcel = async () => {
    try {
      const params: { date?: string; fromDate?: string; toDate?: string } = {}

      switch (exportOption) {
        case 'today':
          params.date = format(new Date(), 'dd/MM/yyyy')
          break
        case 'specific-date':
          if (specificDate) {
            params.date = format(specificDate, 'dd/MM/yyyy')
          }
          break
        case 'date-range':
          if (fromDate) {
            params.fromDate = format(fromDate, 'dd/MM/yyyy')
          }
          if (toDate) {
            params.toDate = format(toDate, 'dd/MM/yyyy')
          }
          break
        case 'all':
        default:
          // Không cần tham số, sẽ xuất tất cả dữ liệu
          break
      }

      // Gọi API xuất Excel
      await exportExcelMutation.mutateAsync(params)

      // Hiện thông báo thành công và đóng dialog
      toast.success('Xuất Excel thành công', {
        description: 'File đã được tải xuống máy của bạn'
      })
      setOpen(false)
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error)
      toast.error('Xuất Excel thất bại', {
        description: 'Có lỗi xảy ra khi xuất file Excel'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='secondary'>
          <Download className='mr-2 h-4 w-4' />
          Xuất Excel
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Xuất báo cáo Excel</DialogTitle>
          <DialogDescription>Chọn thời gian điểm danh bạn muốn xuất báo cáo</DialogDescription>
        </DialogHeader>
        <div className='py-4 space-y-4'>
          <RadioGroup
            value={exportOption}
            onValueChange={(value) => setExportOption(value as ExportOption)}
            className='space-y-3'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='all' id='all' />
              <Label htmlFor='all'>Tất cả dữ liệu điểm danh</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='today' id='today' />
              <Label htmlFor='today'>Hôm nay ({format(new Date(), 'dd/MM/yyyy')})</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='specific-date' id='specific-date' />
              <Label htmlFor='specific-date'>Ngày cụ thể</Label>
            </div>
            {exportOption === 'specific-date' && (
              <div className='ml-6'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={'outline'} className='w-full justify-start text-left font-normal'>
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {specificDate ? format(specificDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={specificDate}
                      onSelect={setSpecificDate}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='date-range' id='date-range' />
              <Label htmlFor='date-range'>Khoảng thời gian</Label>
            </div>
            {exportOption === 'date-range' && (
              <div className='ml-6 space-y-2'>
                <div className='space-y-1'>
                  <Label>Từ ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={'outline'} className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {fromDate ? format(fromDate, 'dd/MM/yyyy') : 'Chọn ngày bắt đầu'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar mode='single' selected={fromDate} onSelect={setFromDate} initialFocus locale={vi} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='space-y-1'>
                  <Label>Đến ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={'outline'} className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {toDate ? format(toDate, 'dd/MM/yyyy') : 'Chọn ngày kết thúc'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        locale={vi}
                        fromDate={fromDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleExportExcel} disabled={exportExcelMutation.isPending}>
            {exportExcelMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Xuất Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
