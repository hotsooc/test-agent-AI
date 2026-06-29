import { motion } from 'framer-motion'
import { Card, Avatar, Tooltip } from 'antd'
import { Agent } from '../../types/valorant'
import { useGame } from '../../context/GameContext'

export default function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const { colorPrimary } = useGame()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hoverable
        onClick={onClick}
        className="!bg-[rgba(15,25,35,0.75)] !border !overflow-hidden !rounded-lg !relative shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        style={{ borderColor: `${colorPrimary}26` }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          className="h-[220px] relative overflow-hidden flex items-center justify-center"
          style={{
            background: agent.backgroundGradientColors
              ? `linear-gradient(135deg, #${agent.backgroundGradientColors[0]} 0%, #${agent.backgroundGradientColors[1]} 50%, #${agent.backgroundGradientColors[2]} 100%)`
              : 'linear-gradient(135deg, #1c252e 0%, #0f1923 100%)',
          }}
        >
          {agent.background && (
            <img src={agent.background} alt="" className="absolute opacity-15 w-full h-full object-cover" />
          )}
          {agent.bustPortrait && (
            <motion.img
              src={agent.bustPortrait}
              alt={agent.displayName}
              className="h-[240px] object-contain z-[1] mt-5"
              whileHover={{ scale: 1.15, y: -10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            />
          )}
        </div>

        <div className="p-4 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-white tracking-[1px]">{agent.displayName.toUpperCase()}</span>
            {agent.role?.displayIcon && (
              <Tooltip title={agent.role.displayName}>
                <Avatar src={agent.role.displayIcon} size="small" className="!bg-[#1c252e]" />
              </Tooltip>
            )}
          </div>
          <div className="text-[#8f9499] text-xs mt-1 uppercase">// {agent.role?.displayName || 'Unknown'}</div>
        </div>
      </Card>
    </motion.div>
  )
}
