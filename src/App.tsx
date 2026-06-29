import { useState, Suspense, lazy, useMemo } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import ThreeBackground from './components/ThreeBackground'
import AppHeader from './components/layout/AppHeader'
import AppFooter from './components/layout/AppFooter'
import Loader from './components/Loader'
import { LanguageContext } from './context/LanguageContext'
import { GameProvider, useGame } from './context/GameContext'
import './index.css'

const Home = lazy(() => import('./pages/home/index.tsx'))
const Agents = lazy(() => import('./pages/agents/index.tsx'))
const Weapons = lazy(() => import('./pages/weapons/index.tsx'))
const Maps = lazy(() => import('./pages/maps/index.tsx'))
const Updates = lazy(() => import('./pages/updates/index.tsx'))
const Viewer3D = lazy(() => import('./pages/viewer3d/index.tsx'))

function AnimatedRoutes() {
  const location = useLocation()

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="w-full"
        style={{ minHeight: 'calc(100vh - 140px)' }}
      >
        <Suspense fallback={<Loader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/weapons" element={<Weapons />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/3d-hub" element={<Viewer3D />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function AppContent() {
  const [language, setLanguage] = useState<string>('vi-VN')
  const langCtx = useMemo(() => ({ language, isVi: language === 'vi-VN' }), [language])
  const { colorPrimary, isValorant } = useGame()

  const cardBg = isValorant ? 'rgba(15, 25, 35, 0.75)' : 'rgba(20, 26, 32, 0.75)'
  const modalBg = isValorant ? '#0c1015' : '#0e1216'
  const headerBg = isValorant ? '#0f1923' : '#141a20'

  return (
    <LanguageContext.Provider value={langCtx}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: colorPrimary,
            colorBgBase: isValorant ? '#0c1015' : '#0a0d10',
            colorTextBase: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            borderRadius: 4,
          },
          components: {
            Card: {
              colorBgContainer: cardBg,
            },
            Modal: {
              contentBg: modalBg,
              headerBg: headerBg,
            },
            Drawer: {
              colorBgContainer: modalBg,
            },
          },
        }}
      >
        <div className="min-h-screen flex flex-col relative">
          <ThreeBackground />
          <AppHeader language={language} setLanguage={setLanguage} />
          <main className="flex-1 w-full">
            <AnimatedRoutes />
          </main>
          <AppFooter />
        </div>
      </ConfigProvider>
    </LanguageContext.Provider>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
