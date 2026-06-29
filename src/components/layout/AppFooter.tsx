import { useGame } from '../../context/GameContext'

export default function AppFooter() {
  const { isValorant } = useGame()
  return (
    <footer className="h-[60px] border-t border-white/5 bg-[#080c10d9] flex flex-col items-center justify-center gap-1 text-xs text-[#555c64] py-2.5 font-mono">
      <div>
        &copy; 2026 {isValorant ? 'VALORANT' : 'CS:GO 2'} Wiki 3D. Powered by AgentGemini & Antigravity.
      </div>
      <div className="text-[11px] tracking-[1px]" style={{ color: isValorant ? 'rgba(255, 70, 85, 0.2)' : 'rgba(222, 155, 53, 0.2)' }}>
        PROJECT NOT AFFILIATED WITH {isValorant ? 'RIOT GAMES' : 'VALVE CORPORATION'}
      </div>
    </footer>
  )
}
