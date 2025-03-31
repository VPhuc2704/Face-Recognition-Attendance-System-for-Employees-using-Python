import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { Camera } from 'lucide-react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    department: 'Phòng Kỹ thuật',
    position: 'Nhân viên',
  })

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    // TODO: Lưu thông tin cá nhân
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>NA</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Thay đổi ảnh
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thông tin chi tiết</CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={handleEdit}>
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSave}>Lưu</Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Input
                    id="department"
                    name="department"
                    value={userData.department}
                    onChange={handleInputChange}
                    readOnly={true}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input
                    id="position"
                    name="position"
                    value={userData.position}
                    onChange={handleInputChange}
                    readOnly={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
