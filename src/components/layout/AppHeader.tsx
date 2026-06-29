import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGame } from '../../context/GameContext'

export default function AppHeader({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setGame, isValorant, colorPrimary } = useGame()

  const navItems = [
    { key: '/', label: 'TRANG CHỦ', labelEn: 'HOME', num: '01' },
    { key: '/agents', label: isValorant ? 'ĐẶC VỤ' : 'BIỆT KÍCH', labelEn: 'AGENTS', num: '02' },
    { key: '/weapons', label: 'VŨ KHÍ', labelEn: 'WEAPONS', num: '03' },
    { key: '/maps', label: 'BẢN ĐỒ', labelEn: 'MAPS', num: '04' },
    { key: '/updates', label: 'CẬP NHẬT', labelEn: 'UPDATES', num: '05' },
    { key: '/3d-hub', label: 'ARSENAL 3D', labelEn: '3D HUB', num: '06' },
  ]

  const isActive = (path: string) => location.pathname === path

  const shadowColor = isValorant ? 'rgba(255, 70, 85, 0.25)' : 'rgba(222, 155, 53, 0.25)'
  const borderCol = isValorant ? '#ff4655' : '#de9b35'

  return (
    <header 
      className="sticky top-0 z-50 flex items-center justify-between h-[80px] px-10 bg-[#0c1015cc] backdrop-blur-md border-b-2 transition-all duration-300 max-lg:flex-col max-lg:h-auto max-lg:gap-4 max-lg:py-4 max-lg:px-4"
      style={{
        borderBottomColor: borderCol,
        boxShadow: `0 2px 20px ${shadowColor}`,
      }}
    >
      <div
        className="text-2xl font-black tracking-[3px] cursor-pointer flex items-center gap-2 select-none group"
        onClick={() => navigate('/')}
      >
        <span 
          className="font-black group-hover:text-white transition-colors"
          style={{ color: colorPrimary }}
        >
          //
        </span>
        <span className="text-white font-black tracking-[4px]">
          {isValorant ? 'VALORANT' : 'CS:GO 2'}
        </span>
        <span className="text-white opacity-60 font-light text-lg border-l border-white/20 pl-2">WIKI</span>
      </div>

      <nav className="flex gap-8 h-full items-center max-lg:flex-wrap max-lg:justify-center max-lg:gap-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`bg-transparent border-none text-xs font-bold tracking-[2px] cursor-pointer h-full relative flex flex-col items-center justify-center transition-all duration-300 max-lg:h-9 px-2 py-1 ${isActive(item.key) ? 'scale-105' : 'text-[#8f9499] hover:text-white'}`}
            style={{ color: isActive(item.key) ? colorPrimary : undefined }}
            onClick={() => navigate(item.key)}
          >
            <span className="text-[9px] opacity-40 font-mono tracking-normal mb-0.5">{item.num}</span>
            {language === 'vi-VN' ? item.label : item.labelEn}
            {isActive(item.key) && (
              <motion.div
                layoutId="active-indicator"
                className="absolute bottom-[-18px] left-0 right-0 h-[3px] max-lg:bottom-0"
                style={{
                  backgroundColor: colorPrimary,
                  boxShadow: `0 0 12px ${colorPrimary}`,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-6 max-lg:gap-4">
        {/* Game Switcher */}
        <div className="flex border border-white/10 p-0.5 rounded bg-black/40 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          <button
            className={`px-2.5 py-1 text-[10px] font-black tracking-[1px] cursor-pointer rounded-sm transition-all ${
              isValorant
                ? 'bg-[#ff4655] text-white shadow-[0_0_8px_rgba(255,70,85,0.4)]'
                : 'text-[#8f9499] hover:text-white bg-transparent'
            }`}
            onClick={() => setGame('valorant')}
          >
            VAL
          </button>
          <button
            className={`px-2.5 py-1 text-[10px] font-black tracking-[1px] cursor-pointer rounded-sm transition-all ${
              !isValorant
                ? 'bg-[#de9b35] text-white shadow-[0_0_8px_rgba(222,155,53,0.4)]'
                : 'text-[#8f9499] hover:text-white bg-transparent'
            }`}
            onClick={() => setGame('csgo')}
          >
            CS2
          </button>
        </div>

        {/* Language selector */}
        <div 
          className="flex p-0.5 rounded bg-black/40 border transition-all duration-300"
          style={{ borderColor: `${colorPrimary}4d` }}
        >
          <button
            className={`px-3 py-1 text-[10px] font-bold tracking-[1px] cursor-pointer rounded-sm transition-all ${language === 'vi-VN' ? 'text-white' : 'text-[#8f9499] hover:text-white bg-transparent'}`}
            style={{ 
              backgroundColor: language === 'vi-VN' ? colorPrimary : 'transparent',
              boxShadow: language === 'vi-VN' ? `0 0 8px ${colorPrimary}66` : undefined
            }}
            onClick={() => setLanguage('vi-VN')}
          >
            VI
          </button>
          <button
            className={`px-3 py-1 text-[10px] font-bold tracking-[1px] cursor-pointer rounded-sm transition-all ${language === 'en-US' ? 'text-white' : 'text-[#8f9499] hover:text-white bg-transparent'}`}
            style={{ 
              backgroundColor: language === 'en-US' ? colorPrimary : 'transparent',
              boxShadow: language === 'en-US' ? `0 0 8px ${colorPrimary}66` : undefined
            }}
            onClick={() => setLanguage('en-US')}
          >
            EN
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[1px] text-[#555c64] max-sm:hidden">
          <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full shadow-[0_0_8px_#00ff66] animate-pulse" /> SECURE // v1.0.0
        </div>
      </div>
    </header>
  )
}
