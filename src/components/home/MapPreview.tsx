import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompassOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MapData } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function MapPreview({ maps }: { maps: MapData[] }) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const navigate = useNavigate()
  const [activeMapIdx, setActiveMapIdx] = useState(0)

  useEffect(() => {
    if (maps.length === 0) return
    setActiveMapIdx(0) // Reset to first map when data updates
    const interval = setInterval(() => {
      setActiveMapIdx((prev) => (prev + 1) % maps.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [maps])

  return (
    <div className="bg-[rgba(15,25,35,0.75)] border border-white/5 rounded-[10px] p-6 text-left h-full flex flex-col justify-between">
      <div>
        <div 
          className="font-bold text-xs tracking-[2px] mb-2"
          style={{ color: colorPrimary }}
        >
          {isVi ? 'BẢN ĐỒ CHIẾN TRƯỜNG' : 'TACTICAL MAPS'}
        </div>
        <h3 className="text-white text-2xl font-bold m-0 mb-5">
          {isVi ? 'KHÔNG GIAN CHIẾN THUẬT' : 'TACTICAL ARENAS'}
        </h3>
      </div>

      {maps.length > 0 && (
        <div className="relative rounded-lg overflow-hidden h-[240px] cursor-pointer" onClick={() => navigate('/maps')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMapIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full absolute"
            >
              <img src={maps[activeMapIdx].splash} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)' }}>
                <h4 className="text-white text-xl font-bold m-0">{maps[activeMapIdx].displayName.toUpperCase()}</h4>
                <p className="text-[#8f9499] text-xs m-0">
                  <CompassOutlined /> {maps[activeMapIdx].coordinates || (isVi ? 'Đang cập nhật' : 'Updating')}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
