import { motion } from 'framer-motion'
import { Card } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { MapData } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function MapCard({ map, onClick }: { map: MapData; onClick: () => void }) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
      <Card
        hoverable
        onClick={onClick}
        className="!bg-[rgba(15,25,35,0.75)] !border !rounded-lg !overflow-hidden"
        style={{ borderColor: `${colorPrimary}26` }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="h-[180px] relative overflow-hidden">
          <img src={map.splash} alt={map.displayName} className="w-full h-full object-cover transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-full h-[60px]" style={{ background: 'linear-gradient(to top, rgba(12,16,21,1) 0%, rgba(12,16,21,0) 100%)' }} />
        </div>

        <div className="p-5 text-left">
          <h3 className="text-xl font-bold text-white m-0 mb-1 tracking-[1px]">{map.displayName.toUpperCase()}</h3>
          <div className="text-[#8f9499] text-xs flex items-center gap-1.5">
            <GlobalOutlined style={{ color: colorPrimary }} />
            <span>{map.coordinates || (isVi ? 'Tọa độ không rõ' : 'Unknown Coordinates')}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
