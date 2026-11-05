import { motion } from 'framer-motion'
import { HeartOutlined, HeartFilled, EyeOutlined, FireOutlined } from '@ant-design/icons'
import { DailyShopItem } from '../../types/shop'
import { useShop } from '../../context/ShopContext'
import { useGame } from '../../context/GameContext'
import { useLanguage } from '../../context/LanguageContext'

interface DailyShopCardProps {
  item: DailyShopItem
  onOpenDetails: (item: DailyShopItem) => void
}

export default function DailyShopCard({ item, onOpenDetails }: DailyShopCardProps) {
  const { colorPrimary } = useGame()
  const { isVi } = useLanguage()
  const { isFavorite, toggleFavorite, appearanceCounter } = useShop()

  const favorited = isFavorite(item.skinUuid)
  const stats = appearanceCounter[item.skinUuid]
  const count = stats?.count || 1

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="h-full relative flex flex-col justify-between rounded-xl overflow-hidden border backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(15, 25, 35, 0.85)',
        borderColor: favorited ? '#f59e0b' : `${item.tier.color}44`,
        boxShadow: favorited
          ? '0 0 25px rgba(245, 158, 11, 0.45), inset 0 0 15px rgba(245, 158, 11, 0.2)'
          : `0 8px 30px ${item.tier.color}1a`,
      }}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/5">
        <div
          className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5"
          style={{
            color: item.tier.color,
            backgroundColor: item.tier.badgeBg,
            border: `1px solid ${item.tier.color}55`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.tier.color }} />
          {item.tier.name}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(item.skinUuid)
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            favorited
              ? 'bg-[#ef4444] text-white border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.7)] scale-110'
              : 'bg-black/50 text-white/60 hover:text-[#ef4444] hover:bg-black/80 border-white/10'
          }`}
          title={favorited ? (isVi ? 'Bỏ yêu thích' : 'Remove Favorite') : (isVi ? 'Thêm vào yêu thích' : 'Add to Favorite')}
        >
          {favorited ? <HeartFilled className="text-sm" /> : <HeartOutlined className="text-sm" />}
        </button>
      </div>

      {/* Favorited Badge overlay if matched */}
      {favorited && (
        <div className="absolute top-12 right-3 z-10 bg-amber-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
          ★ {isVi ? 'ĐANG THEO DÕI' : 'WATCHLIST'}
        </div>
      )}

      {/* Weapon Gun Image Area */}
      <div
        className="relative h-44 flex items-center justify-center p-4 cursor-pointer overflow-hidden group"
        onClick={() => onOpenDetails(item)}
      >
        {/* Glow ambient background */}
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity blur-2xl"
          style={{
            background: `radial-gradient(circle, ${item.tier.color} 0%, transparent 70%)`,
          }}
        />

        <img
          src={item.displayIcon}
          alt={item.displayName}
          className="max-w-[92%] max-h-[140px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded flex items-center gap-1.5 border border-white/20">
            <EyeOutlined /> {isVi ? 'Xem Chi Tiết & Hiệu Ứng' : 'Inspect Skin'}
          </span>
        </div>
      </div>

      {/* Info & Counter Section */}
      <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2.5">
        <div>
          <div className="text-[11px] text-[#8f9499] uppercase tracking-wider font-mono">
            {item.weaponName} • {item.weaponCategory}
          </div>
          <h3 className="text-white text-base font-bold tracking-wide m-0 truncate" title={item.displayName}>
            {item.displayName}
          </h3>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white/[0.04] border border-white/5">
          <span className="text-[#8f9499] flex items-center gap-1">
            <FireOutlined className="text-amber-400" />
            {isVi ? 'Đã ra trong shop:' : 'Shop appearances:'}
          </span>
          <span className="font-bold text-amber-400">
            {count} {isVi ? 'lần' : 'times'}
          </span>
        </div>

        {/* Bottom Price & Button */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-sm flex items-center justify-center font-black text-[9px] text-black shadow-sm"
              style={{ backgroundColor: colorPrimary }}
            >
              V
            </span>
            <span className="text-white font-extrabold text-sm tracking-wider">
              {item.cost.toLocaleString()} VP
            </span>
          </div>

          <button
            onClick={() => onOpenDetails(item)}
            className="px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer transition-all border border-white/20 hover:border-white bg-white/5 hover:bg-white/15 text-white"
          >
            {isVi ? 'Chi Tiết' : 'Inspect'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

