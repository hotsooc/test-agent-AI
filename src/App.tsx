import { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from './components/ThreeBackground';
import Home from './pages/Home';
import Agents from './pages/Agents';
import Weapons from './pages/Weapons';
import Maps from './pages/Maps';
import Viewer3D from './pages/Viewer3D';
import './index.css';
import Updates from './pages/Updates';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<string>('vi-VN');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} language={language} />;
      case 'agents':
        return <Agents language={language} />;
      case 'weapons':
        return <Weapons language={language} />;
      case 'maps':
        return <Maps language={language} />;
      case 'updates':
        return <Updates language={language} />;
      case '3d-hub':
        return <Viewer3D />;
      default:
        return <Home setActiveTab={setActiveTab} language={language} />;
    }
  };

  const navItems = [
    { key: 'home', label: 'TRANG CHỦ', num: '01' },
    { key: 'agents', label: 'ĐẶC VỤ', num: '02' },
    { key: 'weapons', label: 'VŨ KHÍ', num: '03' },
    { key: 'maps', label: 'BẢN ĐỒ', num: '04' },
    { key: 'updates', label: 'CẬP NHẬT', num: '05' },
    { key: '3d-hub', label: 'ARSENAL 3D', num: '06' },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ff4655',
          colorBgBase: '#0c1015',
          colorTextBase: '#ffffff',
          fontFamily: "'Outfit', sans-serif",
          borderRadius: 4,
        },
        components: {
          Card: {
            colorBgContainer: 'rgba(15, 25, 35, 0.75)',
          },
          Modal: {
            contentBg: '#0c1015',
            headerBg: '#0f1923',
          },
          Drawer: {
            colorBgContainer: '#0c1015',
          },
        },
      }}
    >
      <div className="min-h-screen flex flex-col relative">
        <ThreeBackground />

        <header className="sticky top-0 z-50 flex items-center justify-between h-[80px] px-[40px] bg-[#0c1015cc] backdrop-blur-md border-b-2 border-[#ff4655] shadow-[0_0_20px_rgba(255,70,85,0.25)] max-lg:flex-col max-lg:h-auto max-lg:gap-4 max-lg:py-4 max-lg:px-4">
          
          <div className="text-[24px] font-black tracking-[3px] cursor-pointer flex items-center gap-2 select-none group" onClick={() => setActiveTab('home')}>
            <span className="text-[#ff4655] font-black group-hover:text-white transition-colors">//</span>
            <span className="text-white font-black tracking-[4px]">VALORANT</span>
            <span className="text-white opacity-60 font-light text-[18px] border-l border-white/20 pl-2">WIKI</span>
          </div>

          <nav className="flex gap-[32px] h-full items-center max-lg:flex-wrap max-lg:justify-center max-lg:gap-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`bg-transparent border-none text-xs font-bold tracking-[2px] cursor-pointer h-full relative flex flex-col items-center justify-center transition-all duration-300 max-lg:h-[36px] px-2 py-1 ${activeTab === item.key ? 'text-[#ff4655] scale-105' : 'text-[#8f9499] hover:text-white'}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="text-[9px] opacity-40 font-mono tracking-normal mb-0.5">{item.num}</span>
                {language === 'en-US' && item.key === 'home' ? 'HOME' :
                 language === 'en-US' && item.key === 'agents' ? 'AGENTS' :
                 language === 'en-US' && item.key === 'weapons' ? 'WEAPONS' :
                 language === 'en-US' && item.key === 'maps' ? 'MAPS' :
                 language === 'en-US' && item.key === 'updates' ? 'UPDATES' :
                 language === 'en-US' && item.key === '3d-hub' ? 'ARSENAL 3D' : item.label}
                {activeTab === item.key && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute bottom-[-18px] left-0 right-0 h-[3px] bg-[#ff4655] shadow-[0_0_12px_#ff4655] max-lg:bottom-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6 max-lg:gap-4">
            <div className="flex border border-[#ff46554d] p-[2px] rounded bg-black/40 shadow-[0_0_10px_rgba(255,70,85,0.05)]">
              <button
                className={`px-3 py-1 text-[10px] font-bold tracking-[1px] cursor-pointer rounded-sm transition-all ${language === 'vi-VN' ? 'bg-[#ff4655] text-white shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'text-[#8f9499] hover:text-white bg-transparent'}`}
                onClick={() => setLanguage('vi-VN')}
              >
                VI
              </button>
              <button
                className={`px-3 py-1 text-[10px] font-bold tracking-[1px] cursor-pointer rounded-sm transition-all ${language === 'en-US' ? 'bg-[#ff4655] text-white shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'text-[#8f9499] hover:text-white bg-transparent'}`}
                onClick={() => setLanguage('en-US')}
              >
                EN
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[1px] text-[#555c64] max-sm:hidden">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full shadow-[0_0_8px_#00ff66] animate-pulse"></span> SECURE // v1.0.0
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ width: '100%', minHeight: 'calc(100vh - 140px)' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="h-[60px] border-t border-[rgba(255,255,255,0.05)] bg-[#080c10d9] flex flex-col items-center justify-center gap-1 text-[12px] text-[#555c64] py-[10px] font-mono">
          <div>
            &copy; 2026 VALORANT Wiki 3D. Powered by AgentGemini & Antigravity.
          </div>
          <div className="text-[#ff465533] text-[11px] tracking-[1px]">
            PROJECT NOT AFFILIATED WITH RIOT GAMES
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
