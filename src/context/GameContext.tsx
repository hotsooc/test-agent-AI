import { createContext, useContext, useState, useEffect } from 'react'

export type GameType = 'valorant' | 'csgo'

interface GameContextType {
  game: GameType
  isValorant: boolean
  isCsgo: boolean
  colorPrimary: string
  setGame: (game: GameType) => void
}

export const GameContext = createContext<GameContextType>({
  game: 'valorant',
  isValorant: true,
  isCsgo: false,
  colorPrimary: '#ff4655',
  setGame: () => {},
})

export const useGame = () => useContext(GameContext)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<GameType>(() => {
    const saved = localStorage.getItem('active_game')
    return (saved === 'csgo' ? 'csgo' : 'valorant') as GameType
  })

  useEffect(() => {
    localStorage.setItem('active_game', game)
  }, [game])

  const value = {
    game,
    isValorant: game === 'valorant',
    isCsgo: game === 'csgo',
    colorPrimary: game === 'valorant' ? '#ff4655' : '#de9b35',
    setGame,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}
