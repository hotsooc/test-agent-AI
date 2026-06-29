import { motion, Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { Canvas } from '@react-three/fiber'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import InteractiveLogo from './InteractiveLogo'

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
}

export default function HeroSection() {
  const { isVi } = useLanguage()
  const { colorPrimary, isValorant } = useGame()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'center', marginBottom: '60px' }} className="max-md:flex max-md:flex-col-reverse">
      <motion.div variants={itemVariants} className="text-left">
        <h1 
          className="text-[4.5rem] font-black tracking-[4px] m-0 uppercase leading-[1.1] bg-gradient-to-br from-white via-white bg-clip-text text-transparent transition-all duration-300" 
          style={{ 
            textShadow: `0px 0px 40px ${colorPrimary}40`,
            backgroundImage: `linear-gradient(to bottom right, #fff, #fff, ${colorPrimary})`
          }}
        >
          {isValorant ? 'VALORANT WIKI 3D' : 'COUNTER-STRIKE 2 WIKI'}
        </h1>
        <p className="text-[1.2rem] text-[#8f9499] max-w-[650px] my-5 mb-8 leading-relaxed">
          {isVi
            ? isValorant
              ? 'Khám phá cổng thông tin Valorant thế hệ mới. Trải nghiệm kho lưu trữ 3D tương tác của các Đặc vụ, bộ kỹ năng, bản đồ thi đấu xếp hạng và kho vũ khí đồ sộ đi kèm toàn bộ skin.'
              : 'Khám phá cổng thông tin Counter-Strike 2 thế hệ mới. Trải nghiệm kho lưu trữ thông tin về các nhân vật biệt kích, trang bị ném bom khói lửa, bản đồ thi đấu kinh điển và kho vũ khí đồ sộ đi kèm toàn bộ skin.'
            : isValorant
              ? 'Discover the next-generation Valorant portal. Experience interactive 3D archives of agents, abilities, competitive map pool, and massive weapon skins collection.'
              : 'Discover the next-generation Counter-Strike 2 portal. Experience tactical archives of agents, grenade utility mechanics, competitive map pool, and legendary weapon skins.'}
        </p>

        <div className="flex gap-4">
          <Button
            type="primary"
            danger={isValorant}
            size="large"
            className="h-[50px] px-8 font-bold tracking-[1px] rounded transition-all duration-300"
            style={{
              backgroundColor: !isValorant ? colorPrimary : undefined,
              borderColor: !isValorant ? colorPrimary : undefined,
              boxShadow: `0 0 15px ${colorPrimary}66`,
            }}
            onClick={() => navigate('/agents')}
          >
            {isVi 
              ? (isValorant ? 'KHÁM PHÁ ĐẶC VỤ' : 'KHÁM PHÁ BIỆT KÍCH') 
              : (isValorant ? 'EXPLORE AGENTS' : 'EXPLORE AGENTS')}
          </Button>
          <Button
            type="default"
            ghost
            size="large"
            className="h-[50px] px-8 font-bold tracking-[1px] rounded !text-white !border-white"
            onClick={() => navigate('/3d-hub')}
          >
            {isVi ? 'XEM KHO 3D' : 'VIEW 3D ARSENAL'}
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="h-[300px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} />
          <pointLight position={[-3, -3, -3]} color={colorPrimary} intensity={2.0} />
          <InteractiveLogo />
        </Canvas>
      </motion.div>
    </div>
  )
}
