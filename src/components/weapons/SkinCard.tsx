import { motion } from 'framer-motion'
import { Card } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { Skin } from '../../types/valorant'
import { useGame } from '../../context/GameContext'
import { useShop } from '../../context/ShopContext'

export default function SkinCard({ skin, onClick }: { skin: Skin; onClick: () => void }) {
  const { colorPrimary } = useGame()
  const { isFavorite, toggleFavorite } = useShop()

  const favorited = isFavorite(skin.uuid)

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="h-full relative group">
      <Card
        hoverable
        onClick={onClick}
        className="!bg-white/[0.02] !border !rounded-lg !h-full !text-center !cursor-pointer !overflow-hidden relative"
        style={{
          borderColor: favorited ? '#ef4444' : `${colorPrimary}22`,
          boxShadow: favorited ? '0 0 12px rgba(239, 68, 68, 0.25)' : undefined,
        }}
        styles={{ body: { padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minHeight: '130px' } }}
      >
        {/* Favorite Heart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(skin.uuid)
          }}
          className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            favorited
              ? 'bg-red-500 text-white border-red-500 shadow-sm opacity-100'
              : 'bg-black/50 text-white/40 hover:text-red-400 border-white/10 opacity-0 group-hover:opacity-100'
          }`}
          title={favorited ? 'Bỏ theo dõi Daily Shop' : 'Thêm vào Fav (báo về điện thoại khi ra Shop)'}
        >
          {favorited ? <HeartFilled className="text-[10px]" /> : <HeartOutlined className="text-[10px]" />}
        </button>

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
