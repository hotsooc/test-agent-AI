import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { patchData } from '../../data/patchNotes'
import { csgoPatchNotes } from '../../data/csgoData'

export default function PatchPreview() {
  const { isVi, language } = useLanguage()
  const { colorPrimary, isValorant } = useGame()
  const navigate = useNavigate()

  const latestPatch = isValorant ? patchData[0] : csgoPatchNotes[0]
  const summaryText = language === 'vi-VN' ? latestPatch?.summary : latestPatch?.summaryEn

  return (
    <div className="bg-[rgba(15,25,35,0.75)] border border-white/5 rounded-[10px] p-6 text-left h-full flex flex-col justify-between">
      <div>
        <div 
          className="font-bold text-xs tracking-[2px] mb-2"
          style={{ color: colorPrimary }}
        >
          {isVi ? 'BẢN CẬP NHẬT MỚI NHẤT' : 'LATEST PATCH NOTE'}
        </div>
        <h3 className="text-white text-2xl font-bold m-0 mb-5">
          {isVi ? 'TIN TỨC CẬP NHẬT' : 'BALANCING PATCHES'}
        </h3>

        {latestPatch && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarOutlined style={{ color: colorPrimary }} />
              <span className="font-bold text-sm" style={{ color: colorPrimary }}>
                {latestPatch.version}
              </span>
              <span className="text-[#555c64] text-[11px] font-mono">{latestPatch.date}</span>
            </div>
            <p className="text-[#d1d5db] text-[13px] leading-relaxed m-0">
              {summaryText}
            </p>
          </div>
        )}
      </div>

      <Button 
        type="primary" 
        ghost
        className="w-full font-bold transition-all duration-300" 
        style={{
          color: colorPrimary,
          borderColor: colorPrimary,
        }}
        onClick={() => navigate('/updates')}
      >
        {isVi ? 'XEM CHI TIẾT BẢN CẬP NHẬT' : 'READ ALL PATCH NOTES'}
      </Button>
    </div>
  )
}
