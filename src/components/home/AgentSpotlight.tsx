import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Row, Col, Tag, Button, Avatar, Tooltip } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { Agent } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function AgentSpotlight({ agent }: { agent: Agent }) {
  const { isVi } = useLanguage()
  const { colorPrimary, isValorant } = useGame()
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSpotlightVoice = () => {
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

  const borderCol = `${colorPrimary}59` // 35% opacity
  const glowShadow = `0 0 25px ${colorPrimary}26`

  return (
    <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } } as any }} className="mb-[60px]">
      <div 
        className="relative overflow-hidden rounded-xl p-[30px] text-left border-2 transition-all duration-300" 
        style={{ 
          background: isValorant 
            ? 'linear-gradient(135deg, rgba(15,25,35,0.85) 0%, rgba(20,10,15,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(20,25,30,0.85) 0%, rgba(15,18,22,0.9) 100%)',
          borderColor: borderCol,
          boxShadow: glowShadow,
        }}
      >
        <div 
          className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-300" 
          style={{ backgroundColor: colorPrimary }}
        />

        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={14} className="z-[2]">
            <div className="flex items-center gap-3 mb-3">
              <Tag 
                className="font-bold text-[10px] tracking-[1px] uppercase border-none text-white"
                style={{ backgroundColor: colorPrimary }}
              >
                {isVi 
                  ? (isValorant ? 'TIÊU ĐIỂM ĐẶC VỤ TRONG NGÀY' : 'TIÊU ĐIỂM BIỆT KÍCH TRONG NGÀY') 
                  : (isValorant ? 'AGENT SPOTLIGHT OF THE DAY' : 'AGENT SPOTLIGHT OF THE DAY')}
              </Tag>
              {agent.role?.displayName && (
                <span className="text-[#8f9499] text-xs uppercase tracking-[1px]">
                  // {agent.role.displayName}
                </span>
              )}
            </div>

            <h2 className="text-white text-[42px] font-bold m-0 mb-4 tracking-[2px]">
              {agent.displayName.toUpperCase()}
            </h2>

            <p className="text-[#d1d5db] text-[15px] leading-relaxed mb-6 max-w-[550px]">
              {agent.description}
            </p>

            <div className="flex gap-4 items-center flex-wrap">
              {agent.voiceLine?.mediaList?.[0]?.wave && (
                <Button 
                  type="primary" 
                  danger={isValorant} 
                  icon={isPlayingVoice ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
                  onClick={playSpotlightVoice} 
                  className="font-bold h-10"
                  style={{
                    backgroundColor: !isValorant ? colorPrimary : undefined,
                    borderColor: !isValorant ? colorPrimary : undefined,
                  }}
                >
                  {isPlayingVoice ? (isVi ? 'Dừng giọng thoại' : 'Stop voice line') : (isVi ? 'Nghe giọng đặc vụ' : 'Play voice line')}
                </Button>
              )}

              <div className="flex gap-2">
                {agent.abilities?.slice(0, 4).map((ab) =>
                  ab.displayIcon ? (
                    <Tooltip key={ab.slot} title={ab.displayName}>
                      <Avatar src={ab.displayIcon} shape="square" size="large" className="!bg-white/5 !border !border-white/10 cursor-pointer p-1" />
                    </Tooltip>
                  ) : null
                )}
              </div>
            </div>
          </Col>

          <Col xs={24} md={10} className="flex justify-center z-[1]">
            {agent.fullPortraitV2 && (
              <motion.img
                src={agent.fullPortraitV2}
                alt={agent.displayName}
                className="max-h-[380px] object-contain"
                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              />
            )}
          </Col>
        </Row>
      </div>
    </motion.div>
  )
}
