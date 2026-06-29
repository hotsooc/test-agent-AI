import { motion } from 'framer-motion'
import { Card } from 'antd'
import { Skin } from '../../types/valorant'
import { useGame } from '../../context/GameContext'

export default function SkinCard({ skin, onClick }: { skin: Skin; onClick: () => void }) {
  const { colorPrimary } = useGame()

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="h-full">
      <Card
        hoverable
        onClick={onClick}
        className="!bg-white/[0.02] !border !rounded-lg !h-full !text-center !cursor-pointer !overflow-hidden"
        style={{ borderColor: `${colorPrimary}22` }}
        styles={{ body: { padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minHeight: '130px' } }}
      >
        <div className="h-[60px] flex items-center justify-center mb-2.5">
          <img src={skin.displayIcon || ''} alt={skin.displayName} className="max-w-full max-h-[55px] object-contain" />
        </div>
        <div className="text-[11px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">
          {skin.displayName}
        </div>
      </Card>
    </motion.div>
  )
}
