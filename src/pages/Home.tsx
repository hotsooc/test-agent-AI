import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button, Row, Col, Card, Avatar, Tooltip, Tag } from 'antd';
import {
  CompassOutlined,
  DeploymentUnitOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { getAgents, getMaps, getWeapons } from '../api/valorant';
import { Agent, MapData, Weapon } from '../types/valorant';

// 3D floating crystal logo
function InteractiveLogo() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.4;
      meshRef.current.rotation.y = time * 0.6;
      meshRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2.2, 0]} />
        <meshPhysicalMaterial
          color="#ff4655"
          emissive="#2a0005"
          roughness={0.05}
          metalness={0.95}
          transmission={0.4}
          thickness={2.0}
        />
      </mesh>
    </Float>
  );
}

export default function Home({
  setActiveTab,
  language,
}: {
  setActiveTab: (tab: string) => void;
  language: string;
}) {
  const [featuredAgent, setFeaturedAgent] = useState<Agent | null>(null);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [activeMapIdx, setActiveMapIdx] = useState<number>(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isVi = language === 'vi-VN';

  // Fetch data for spotlight and map slideshow
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsData, mapsData, weaponsData] = await Promise.all([
          getAgents(language),
          getMaps(language),
          getWeapons(language),
        ]);

        // Select Jett or Reyna or Reyna if available, else first
        const uniqueAgents = agentsData.filter(
          (agent, index, self) =>
            self.findIndex((a) => a.uuid === agent.uuid) === index
        );
        const spotlight =
          uniqueAgents.find((a) => a.displayName.toLowerCase() === 'jett') ||
          uniqueAgents.find((a) => a.displayName.toLowerCase() === 'reyna') ||
          uniqueAgents[0] ||
          null;
        
        setFeaturedAgent(spotlight);
        
        const validMaps = mapsData.filter((m) => m.splash && m.displayName);
        setMaps(validMaps);

        const validWeapons = weaponsData.filter((w) => w.displayIcon && w.shopData);
        setWeapons(validWeapons);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      }
    };
    fetchData();
  }, [language]);

  // Slideshow auto-rotate for maps
  useEffect(() => {
    if (maps.length === 0) return;
    const interval = setInterval(() => {
      setActiveMapIdx((prev) => (prev + 1) % maps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [maps]);

  const playSpotlightVoice = () => {
    if (!featuredAgent?.voiceLine?.mediaList?.[0]?.wave) return;
    
    if (isPlayingVoice) {
      audioRef.current?.pause();
      setIsPlayingVoice(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(featuredAgent.voiceLine.mediaList[0].wave);
      audioRef.current.volume = 0.5;
      audioRef.current.play();
      setIsPlayingVoice(true);
      
      audioRef.current.onended = () => {
        setIsPlayingVoice(false);
      };
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        color: '#ffffff',
        textAlign: 'center',
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'center', marginBottom: '60px' }} className="max-md:flex max-md:flex-col-reverse">
        {/* Hero Left Content */}
        <motion.div variants={itemVariants} style={{ textAlign: 'left' }}>
          <h1
            style={{
              fontSize: '4.5rem',
              fontWeight: '900',
              letterSpacing: '4px',
              margin: '0',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #ffffff 40%, #ff4655 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 0px 40px rgba(255, 70, 85, 0.25)',
              lineHeight: '1.1',
            }}
          >
            VALORANT WIKI 3D
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#8f9499',
              maxWidth: '650px',
              margin: '20px 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            {isVi 
              ? 'Khám phá cổng thông tin Valorant thế hệ mới. Trải nghiệm kho lưu trữ 3D tương tác của các Đặc vụ, bộ kỹ năng, bản đồ thi đấu xếp hạng và kho vũ khí đồ sộ đi kèm toàn bộ skin.'
              : 'Discover the next-generation Valorant portal. Experience interactive 3D archives of agents, abilities, competitive map pool, and massive weapon skins collection.'}
          </p>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Button
              type="primary"
              danger
              size="large"
              style={{
                height: '50px',
                padding: '0 32px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                borderRadius: '4px',
                boxShadow: '0 0 15px rgba(255, 70, 85, 0.4)',
              }}
              onClick={() => setActiveTab('agents')}
            >
              {isVi ? 'KHÁM PHÁ ĐẶC VỤ' : 'EXPLORE AGENTS'}
            </Button>
            <Button
              type="default"
              ghost
              size="large"
              style={{
                height: '50px',
                padding: '0 32px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                borderRadius: '4px',
                color: '#fff',
                borderColor: '#fff',
              }}
              onClick={() => setActiveTab('3d-hub')}
            >
              {isVi ? 'XEM KHO 3D' : 'VIEW 3D ARSENAL'}
            </Button>
          </div>
        </motion.div>

        {/* Hero Right: 3D rotating Crystal */}
        <motion.div variants={itemVariants} style={{ height: '300px' }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 2]} intensity={1.5} />
            <pointLight position={[-3, -3, -3]} color="#ff4655" intensity={2.0} />
            <InteractiveLogo />
          </Canvas>
        </motion.div>
      </div>

      {/* Spectacular Section 1: Agent Spotlight */}
      {featuredAgent && (
        <motion.div variants={itemVariants} style={{ marginBottom: '60px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15,25,35,0.85) 0%, rgba(20,10,15,0.9) 100%)',
              border: '2px solid rgba(255, 70, 85, 0.35)',
              boxShadow: '0 0 25px rgba(255, 70, 85, 0.15)',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Visual glow background */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: '#ff4655', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }} />

            <Row gutter={[32, 32]} align="middle">
              {/* Left Column: Spotlight details */}
              <Col xs={24} md={14} style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Tag color="red" style={{ fontWeight: 'bold', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {isVi ? 'TIÊU ĐIỂM ĐẶC VỤ TRONG NGÀY' : 'AGENT SPOTLIGHT OF THE DAY'}
                  </Tag>
                  {featuredAgent.role?.displayName && (
                    <span style={{ color: '#8f9499', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      // {featuredAgent.role.displayName}
                    </span>
                  )}
                </div>

                <h2 style={{ color: '#ffffff', fontSize: '42px', fontWeight: 'bold', margin: '0 0 16px 0', letterSpacing: '2px' }}>
                  {featuredAgent.displayName.toUpperCase()}
                </h2>

                <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', maxWidth: '550px' }}>
                  {featuredAgent.description}
                </p>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {featuredAgent.voiceLine?.mediaList?.[0]?.wave && (
                    <Button
                      type="primary"
                      danger
                      icon={isPlayingVoice ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={playSpotlightVoice}
                      style={{ fontWeight: 'bold', height: '40px' }}
                    >
                      {isPlayingVoice 
                        ? (isVi ? 'Dừng giọng thoại' : 'Stop voice line') 
                        : (isVi ? 'Nghe giọng đặc vụ' : 'Play voice line')}
                    </Button>
                  )}

                  {/* Skills icons preview */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {featuredAgent.abilities?.slice(0, 4).map((ab) => (
                      ab.displayIcon && (
                        <Tooltip key={ab.slot} title={ab.displayName}>
                          <Avatar
                            src={ab.displayIcon}
                            shape="square"
                            size="large"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          />
                        </Tooltip>
                      )
                    ))}
                  </div>
                </div>
              </Col>

              {/* Right Column: Agent Full portrait absolute overlapping */}
              <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
                {featuredAgent.fullPortraitV2 && (
                  <motion.img
                    src={featuredAgent.fullPortraitV2}
                    alt={featuredAgent.displayName}
                    style={{
                      maxHeight: '380px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                    }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  />
                )}
              </Col>
            </Row>
          </div>
        </motion.div>
      )}

      {/* Spectacular Section 2: Maps slideshow & updates */}
      <Row gutter={[24, 24]} style={{ marginBottom: '60px' }}>
        {/* Maps Slideshow (Left side) */}
        <Col xs={24} md={14}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <div
              style={{
                background: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'left',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', marginBottom: '8px' }}>
                  {isVi ? 'BẢN ĐỒ CHIẾN TRƯỜNG' : 'TACTICAL MAPS'}
                </div>
                <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
                  {isVi ? 'KHÔNG GIAN CHIẾN THUẬT' : 'TACTICAL ARENAS'}
                </h3>
              </div>

              {maps.length > 0 && (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '240px' }} onClick={() => setActiveTab('maps')}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMapIdx}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ width: '100%', height: '100%', position: 'absolute' }}
                    >
                      <img
                        src={maps[activeMapIdx].splash}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Gradient overlap */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)', padding: '16px 20px' }}>
                        <h4 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                          {maps[activeMapIdx].displayName.toUpperCase()}
                        </h4>
                        <p style={{ color: '#8f9499', fontSize: '12px', margin: 0 }}>
                          <CompassOutlined /> {maps[activeMapIdx].coordinates || (isVi ? 'Đang cập nhật' : 'Updating')}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </Col>

        {/* Patch Notes News Box (Right side) */}
        <Col xs={24} md={10}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <div
              style={{
                background: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'left',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', marginBottom: '8px' }}>
                  {isVi ? 'BẢN CẬP NHẬT MỚI NHẤT' : 'LATEST PATCH NOTE'}
                </div>
                <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
                  {isVi ? 'TIN TỨC CẬP NHẬT' : 'BALANCING PATCHES'}
                </h3>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CalendarOutlined style={{ color: '#ff4655' }} />
                    <span style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '14px' }}>PATCH 9.02</span>
                    <span style={{ color: '#555c64', fontSize: '11px', fontFamily: 'monospace' }}>25/06/2026</span>
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                    {isVi 
                      ? 'Cân bằng sát thương súng Vandal và giảm sức mạnh Đặc vụ Neon. Thay đổi tỷ lệ tiêu hao năng lượng khi trượt bánh xe kỹ năng.'
                      : 'Vandal recoil adjustments and Neon movement nerf. Adjusting fuel consumption rate for slide abilities.'}
                  </p>
                </div>
              </div>

              <Button
                type="default"
                danger
                style={{ width: '100%', fontWeight: 'bold' }}
                onClick={() => setActiveTab('updates')}
              >
                {isVi ? 'XEM CHI TIẾT BẢN CẬP NHẬT' : 'READ ALL PATCH NOTES'}
              </Button>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* Nav cards - Keep as smaller portal blocks */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                background: 'rgba(15, 25, 35, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                textAlign: 'left',
                borderRadius: '8px',
              }}
              onClick={() => setActiveTab('agents')}
            >
              <DeploymentUnitOutlined style={{ fontSize: '28px', color: '#ff4655', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                {isVi ? 'ĐẶC VỰ CHIẾN THUẬT' : 'TACTICAL AGENTS'}
              </h3>
              <p style={{ color: '#8f9499', fontSize: '12px', lineHeight: '1.4' }}>
                {isVi ? 'Thông tin đặc vụ, vai trò và âm thanh kỹ năng.' : 'All playable agents with detailed descriptions.'}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                background: 'rgba(15, 25, 35, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                textAlign: 'left',
                borderRadius: '8px',
              }}
              onClick={() => setActiveTab('weapons')}
            >
              <ThunderboltOutlined style={{ fontSize: '28px', color: '#ff4655', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                {isVi ? 'KHO VŨ KHÍ' : 'WEAPONS & SKINS'}
              </h3>
              <p style={{ color: '#8f9499', fontSize: '12px', lineHeight: '1.4' }}>
                {isVi ? 'Thông số vũ khí bắn súng và các skins súng.' : 'Weapon ranges, reload speeds, and skins.'}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                background: 'rgba(15, 25, 35, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                textAlign: 'left',
                borderRadius: '8px',
              }}
              onClick={() => setActiveTab('maps')}
            >
              <CompassOutlined style={{ fontSize: '28px', color: '#ff4655', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                {isVi ? 'BẢN ĐỒ CHIẾN TRƯỜNG' : 'TACTICAL MAPS'}
              </h3>
              <p style={{ color: '#8f9499', fontSize: '12px', lineHeight: '1.4' }}>
                {isVi ? 'Địa hình minimap độ phân giải cao và tọa độ.' : 'Minimaps, coordinates and spatial layout.'}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                background: 'rgba(15, 25, 35, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                textAlign: 'left',
                borderRadius: '8px',
              }}
              onClick={() => setActiveTab('3d-hub')}
            >
              <TrophyOutlined style={{ fontSize: '28px', color: '#ff4655', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                {isVi ? 'TRÌNH DIỄN ARSENAL 3D' : 'ARSENAL 3D'}
              </h3>
              <p style={{ color: '#8f9499', fontSize: '12px', lineHeight: '1.4' }}>
                {isVi ? 'Tải mô hình 3D (.glb) cá nhân và chỉnh vật liệu.' : 'Load custom GLB/GLTF model in canvas.'}
              </p>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </motion.div>
  );
}
