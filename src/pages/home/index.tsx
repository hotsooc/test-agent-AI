import { useState, useEffect } from 'react'
import { motion, Variants } from 'framer-motion'
import { Row, Col } from 'antd'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { getAgents, getMaps } from '../../api/valorant'
import { getCsgoAgents, getCsgoMaps } from '../../api/csgo'
import { Agent, MapData } from '../../types/valorant'
import PageContainer from '../../components/PageContainer'
import HeroSection from '../../components/home/HeroSection'
import AgentSpotlight from '../../components/home/AgentSpotlight'
import MapPreview from '../../components/home/MapPreview'
import PatchPreview from '../../components/home/PatchPreview'
import FeatureCards from '../../components/home/FeatureCards'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

export default function Home() {
  const { language } = useLanguage()
  const { isValorant } = useGame()
  const [featuredAgent, setFeaturedAgent] = useState<Agent | null>(null)
  const [maps, setMaps] = useState<MapData[]>([])

  useEffect(() => {
    const fetchAgents = isValorant ? getAgents(language) : getCsgoAgents(language)
    const fetchMaps = isValorant ? getMaps(language) : getCsgoMaps(language)

    Promise.all([fetchAgents, fetchMaps])
      .then(([agentsData, mapsData]) => {
        const uniqueAgents = agentsData.filter(
          (agent, index, self) => self.findIndex((a) => a.uuid === agent.uuid) === index,
        )
        const spotlight =
          uniqueAgents.find((a) => a.displayName.toLowerCase() === 'jett') ||
          uniqueAgents.find((a) => a.displayName.toLowerCase() === 'reyna') ||
          uniqueAgents.find((a) => a.displayName.toLowerCase().includes('sas')) ||
          uniqueAgents[0] ||
          null
        setFeaturedAgent(spotlight)

        const validMaps = mapsData.filter((m) => m.splash && m.displayName)
        setMaps(validMaps)
      })
      .catch((err) => console.error('Lỗi khi tải dữ liệu trang chủ:', err))
  }, [language, isValorant])

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center text-white">
        <HeroSection />

        {featuredAgent && <AgentSpotlight agent={featuredAgent} />}

        <Row gutter={[24, 24]} className="mb-[60px]">
          <Col xs={24} md={14}>
            <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } } as any }} className="h-full">
              <MapPreview maps={maps} />
            </motion.div>
          </Col>
          <Col xs={24} md={10}>
            <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } } as any }} className="h-full">
              <PatchPreview />
            </motion.div>
          </Col>
        </Row>

        <motion.div variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } } as any }}>
          <FeatureCards />
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
