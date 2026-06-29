import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Row, Col } from 'antd'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { getAgents } from '../../api/valorant'
import { getCsgoAgents } from '../../api/csgo'
import { Agent } from '../../types/valorant'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import RoleFilter from '../../components/agents/RoleFilter'
import AgentCard from '../../components/agents/AgentCard'
import AgentDrawer from '../../components/agents/AgentDrawer'

export default function Agents() {
  const { language, isVi } = useLanguage()
  const { isValorant, colorPrimary } = useGame()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoleUuid, setSelectedRoleUuid] = useState('ALL')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    setLoading(true)
    setSelectedRoleUuid('ALL') // Reset filter on game change
    const fetchAgents = isValorant ? getAgents(language) : getCsgoAgents(language)
    
    fetchAgents
      .then((data) => {
        const uniqueAgents = data.filter(
          (agent, index, self) => self.findIndex((a) => a.uuid === agent.uuid) === index,
        )
        setAgents(uniqueAgents)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [language, isValorant])

  const availableRoles = useMemo(() => {
    const roleMap = new Map<string, string>()
    agents.forEach((agent) => {
      if (agent.role?.uuid && agent.role?.displayName) {
        if (!roleMap.has(agent.role.uuid)) {
          roleMap.set(agent.role.uuid, agent.role.displayName)
        }
      }
    })
    return Array.from(roleMap.entries()).map(([uuid, displayName]) => ({ uuid, displayName }))
  }, [agents])

  const filteredAgents = agents.filter((agent) => {
    if (selectedRoleUuid === 'ALL') return true
    return agent.role?.uuid === selectedRoleUuid
  })

  const handleOpenDetails = useCallback((agent: Agent) => setSelectedAgent(agent), [])
  const handleCloseDetails = useCallback(() => setSelectedAgent(null), [])

  if (loading) return <Loader tip={isVi ? (isValorant ? 'Đang tải dữ liệu Đặc vụ...' : 'Đang tải dữ liệu Biệt kích...') : 'Loading Agents data...'} />
  if (!agents.length) return <PageContainer><div className="text-center text-[#8f9499] py-20">{isVi ? 'Không có dữ liệu.' : 'No data available.'}</div></PageContainer>

  return (
    <PageContainer>
      <div className="text-left mb-8">
        <h2 className="tracking-[2px] text-sm font-bold m-0 mb-1" style={{ color: colorPrimary }}>
          {isVi 
            ? (isValorant ? 'VALORANT ĐẶC VỤ' : 'CS:GO 2 BIỆT KÍCH') 
            : (isValorant ? 'VALORANT AGENTS' : 'CS:GO 2 AGENTS')}
        </h2>
        <h1 className="text-white m-0 text-[36px] font-bold">
          {isVi ? 'DANH SÁCH NHÂN VẬT' : 'CHARACTER LIST'}
        </h1>
      </div>

      <RoleFilter roles={availableRoles} selectedUuid={selectedRoleUuid} onSelect={setSelectedRoleUuid} />

      <motion.div layout>
        <Row gutter={[24, 24]}>
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((agent) => (
              <Col xs={24} sm={12} md={8} lg={6} key={agent.uuid}>
                <AgentCard agent={agent} onClick={() => handleOpenDetails(agent)} />
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </motion.div>

      {filteredAgents.length === 0 && selectedRoleUuid !== 'ALL' && (
        <div className="text-center text-[#555c64] py-12 text-sm">
          {isVi ? 'Không có nhân vật nào trong phe vai trò này.' : 'No agents found for this role.'}
        </div>
      )}

      <AgentDrawer agent={selectedAgent} open={selectedAgent !== null} onClose={handleCloseDetails} />
    </PageContainer>
  )
}
