import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export default function Loader({ tip = 'Đang tải dữ liệu...' }: { tip?: string }) {
  const antIcon = <LoadingOutlined className="text-[48px] !text-[#ff4655]" spin />

  return (
    <div className="flex flex-col items-center justify-center h-[400px] w-full text-white">
      <Spin indicator={antIcon} />
      <p className="mt-5 tracking-[2px] text-[#8f9499] text-sm uppercase font-['Outfit',sans-serif]">
        {tip}
      </p>
    </div>
  )
}
