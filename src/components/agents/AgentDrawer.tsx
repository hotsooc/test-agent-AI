import { useRef, useState } from 'react'
import { Drawer, Avatar, Button, Tag } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { Agent, Ability } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function AgentDrawer({
  agent,
  open,
  onClose,
}: {
  agent: Agent | null
  open: boolean
  onClose: () => void
}) {
  const { isVi } = useLanguage()
  const { colorPrimary, isValorant } = useGame()
  const [activeAbility, setActiveAbility] = useState<Ability | null>(null)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playVoiceLine = () => {
    if (!agent?.voiceLine?.mediaList?.[0]?.wave) return
    if (isPlayingVoice) {
      audioRef.current?.pause()
      setIsPlayingVoice(false)
    } else {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(agent.voiceLine.mediaList[0].wave)
      audioRef.current.volume = 0.5
      audioRef.current.play()
      setIsPlayingVoice(true)
      audioRef.current.onended = () => setIsPlayingVoice(false)
    }
  }

  const handleClose = () => {
    setActiveAbility(null)
    setIsPlayingVoice(false)
    if (audioRef.current) audioRef.current.pause()
    onClose()
  }

  return (
    <Drawer
      title={
        agent ? (
          <div className="flex items-center gap-3 text-white">
            {agent.role?.displayIcon && <Avatar src={agent.role.displayIcon} size="large" className="!bg-[#1c252e]" />}
            <div>
              <span className="text-xl font-bold">{agent.displayName.toUpperCase()}</span>
              <div 
                className="text-[11px] uppercase mt-0.5"
                style={{ color: colorPrimary }}
              >
                {isVi ? 'Vai Trò: ' : 'Role: '} {agent.role?.displayName}
              </div>
            </div>
          </div>
        ) : null
      }
      placement="right"
      size="large"
      onClose={handleClose}
      open={open}
      classNames={{
        header: '!bg-[#0f1923] !border-b !border-[#2e303a]',
        body: '!bg-[#0c1015] !text-white !p-6',
      }}
    >
      {agent && (
        <div>
          <div
            className="flex rounded-lg p-5 gap-5 items-center border mb-6"
            style={{
              borderColor: `${colorPrimary}22`,
              background: agent.backgroundGradientColors
                ? `linear-gradient(135deg, #${agent.backgroundGradientColors[0]}11 0%, #${agent.backgroundGradientColors[1]}22 50%, #${agent.backgroundGradientColors[2]}11 100%)`
                : '#16202c',
            }}
          >
            {agent.fullPortraitV2 && (
              <img src={agent.fullPortraitV2} alt={agent.displayName} className="w-[160px] h-[200px] object-contain" />
            )}
            <div className="flex-1">
              {agent.voiceLine?.mediaList?.[0]?.wave && (
                <Button
                  type="primary"
                  danger={isValorant}
                  icon={isPlayingVoice ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={playVoiceLine}
                  className="mb-4 font-bold"
                  style={{
                    backgroundColor: !isValorant ? colorPrimary : undefined,
                    borderColor: !isValorant ? colorPrimary : undefined,
                  }}
                >
                  {isPlayingVoice
                    ? isVi ? 'Dừng giọng nói' : 'Stop voice line'
                    : isVi ? 'Phát giọng nói Đặc vụ' : 'Play Agent Voice'}
                </Button>
              )}
              <div className="text-[#8f9499] text-xs uppercase">{isVi ? 'TIỂU SỬ QUÁ KHỨ' : 'BIOGRAPHY'}</div>
              <p className="text-sm leading-relaxed mt-1.5 text-[#d1d5db]">{agent.description}</p>
            </div>
          </div>

          <div>
            <div 
              className="font-bold text-[15px] tracking-[1px] mb-4 border-b border-dashed border-[#2e303a] pb-2"
              style={{ color: colorPrimary }}
            >
              {isVi ? (isValorant ? 'KỸ NĂNG ĐẶC BIỆT' : 'TRANG BỊ CHIẾN THUẬT') : 'SPECIAL ABILITIES'}
            </div>

            <div className="flex gap-3 mb-5">
              {agent.abilities?.map((ability, idx) => (
                <div
                  key={ability.slot}
                  onClick={() => setActiveAbility(ability)}
                  className={`flex-1 flex flex-col items-center py-2.5 px-1 cursor-pointer rounded-md transition-all duration-200 border ${
                    activeAbility?.slot === ability.slot
                      ? 'bg-white/[0.02]'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                  style={{
                    borderColor: activeAbility?.slot === ability.slot ? colorPrimary : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {ability.displayIcon ? (
                    <img
                      src={ability.displayIcon}
                      alt={ability.displayName}
                      className="h-9 w-9 object-contain"
                      style={{ filter: activeAbility?.slot === ability.slot ? 'brightness(1)' : 'brightness(0.6)' }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#8f9499]">A{idx + 1}</span>
                  )}
                  <span 
                    className="text-[11px] font-bold mt-1.5 uppercase"
                    style={{ color: activeAbility?.slot === ability.slot ? colorPrimary : '#8f9499' }}
                  >
                    {ability.slot === 'Passive' ? (isVi ? 'Nội tại' : 'Passive') : ability.slot}
                  </span>
                </div>
              ))}
            </div>

            {activeAbility && (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <h3 className="text-white m-0 text-lg font-bold">{activeAbility.displayName.toUpperCase()}</h3>
                  <Tag 
                    className="border-none uppercase text-[10px] font-bold text-white"
                    style={{ backgroundColor: colorPrimary }}
                  >
                    {activeAbility.slot}
                  </Tag>
                </div>
                <p className="text-[#d1d5db] text-sm leading-relaxed">{activeAbility.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
