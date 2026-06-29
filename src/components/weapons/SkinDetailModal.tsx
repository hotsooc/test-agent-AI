import { useState } from 'react'
import { Modal, Image, Tooltip, Button } from 'antd'
import { PlaySquareOutlined } from '@ant-design/icons'
import { Skin } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function SkinDetailModal({ skin, onClose }: { skin: Skin | null; onClose: () => void }) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const [activeChromaIdx, setActiveChromaIdx] = useState(0)
  const [activeLevelIdx, setActiveLevelIdx] = useState(-1)

  if (!skin) return null

  return (
    <Modal
      title={
        <div className="text-white">
          <span className="text-lg font-bold tracking-[0.5px]">{skin.displayName.toUpperCase()}</span>
          <span 
            className="text-xs ml-3 uppercase border-l-2 border-[#2e303a] pl-3"
            style={{ color: colorPrimary }}
          >
            {isVi ? 'CHI TIẾT SKIN' : 'SKIN DETAILS'}
          </span>
        </div>
      }
      open={skin !== null}
      onCancel={() => {
        setActiveChromaIdx(0)
        setActiveLevelIdx(-1)
        onClose()
      }}
      footer={null}
      width={750}
      classNames={{ body: '!bg-[#0c1015] !text-white !p-6' }}
      wrapClassName="game-modal-wrap"
      style={{ top: 80 }}
    >
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center flex flex-col justify-between">
        <div className="min-h-[220px] flex items-center justify-center">
          <Image
            src={skin.chromas?.[activeChromaIdx]?.displayIcon || skin.displayIcon || ''}
            alt={skin.displayName}
            className="max-w-full max-h-[180px] object-contain"
          />
        </div>

        <div className="mt-5">
          {skin.chromas && skin.chromas.length > 1 && (
            <div className="mb-4">
              <div className="text-[#8f9499] text-xs mb-1.5 text-left">
                {isVi ? 'CÁC PHIÊN BẢN MÀU SẮC (CHROMAS)' : 'SKIN CHROMAS (COLOR VARIATIONS)'}
              </div>
              <div className="flex gap-2 justify-start">
                {skin.chromas.map((chroma, idx) => (
                  <Tooltip key={chroma.uuid} title={chroma.displayName}>
                    <div
                      onClick={() => setActiveChromaIdx(idx)}
                      className="w-9 h-9 rounded p-0.5 cursor-pointer bg-[#1c252e] flex items-center justify-center border"
                      style={{
                        borderColor: activeChromaIdx === idx ? colorPrimary : '#2e303a',
                        borderWidth: activeChromaIdx === idx ? '2px' : '1px'
                      }}
                    >
                      <img
                        src={chroma.swatch || chroma.displayIcon || skin.displayIcon || ''}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {skin.levels && skin.levels.some((level) => level.streamedVideo) && (
            <div className="text-left mt-4">
              <div className="text-[#8f9499] text-xs mb-2">
                <PlaySquareOutlined /> {isVi ? 'HOẠT ẢNH NÂNG CẤP (VFX / FINISHER)' : 'UPGRADE ANIMATIONS (VFX / FINISHER)'}
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {skin.levels
                  .filter((level) => level.streamedVideo)
                  .map((level, idx) => {
                    const mainIdx = skin.levels.findIndex((l) => l.uuid === level.uuid)
                    return (
                      <Button
                        key={level.uuid}
                        type="default"
                        size="small"
                        onClick={() => setActiveLevelIdx(mainIdx)}
                        style={{
                          color: colorPrimary,
                          borderColor: colorPrimary,
                          backgroundColor: activeLevelIdx === mainIdx ? `${colorPrimary}22` : 'rgba(255,255,255,0.05)',
                          fontWeight: activeLevelIdx === mainIdx ? 'bold' : 'normal'
                        }}
                        className="text-[11px]"
                      >
                        {level.displayName.split('Level')[1] || (isVi ? `Cấp ${idx + 1}` : `Lvl ${idx + 1}`)}
                      </Button>
                    )
                  })}
              </div>

              {activeLevelIdx !== -1 && skin.levels[activeLevelIdx]?.streamedVideo && (
                <div 
                  className="border rounded-md overflow-hidden bg-black mt-2"
                  style={{ borderColor: `${colorPrimary}4d` }}
                >
                  <video
                    key={skin.levels[activeLevelIdx].streamedVideo || ''}
                    src={skin.levels[activeLevelIdx].streamedVideo || ''}
                    controls
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
