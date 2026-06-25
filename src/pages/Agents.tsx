import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Row, Col, Radio, Drawer, Avatar, Tag, Button, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { getAgents } from '../api/valorant';
import Loader from '../components/Loader';
import { Agent, Ability } from '../types/valorant';

export default function Agents({ language }: { language: string }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeAbility, setActiveAbility] = useState<Ability | null>(null);
  
  // Audio state
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isVi = language === 'vi-VN';

  useEffect(() => {
    setLoading(true);
    const fetchAgents = async () => {
      try {
        const data = await getAgents(language);
        // Remove duplicated Sova (sometimes API returns duplicates of Sova or older versions)
        const uniqueAgents = data.filter(
          (agent, index, self) =>
            self.findIndex((a) => a.uuid === agent.uuid) === index
        );
        setAgents(uniqueAgents);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAgents();
  }, [language]);

  const roles = ['ALL', 'DUELIST', 'INITIATOR', 'SENTINEL', 'CONTROLLER'];

  const filteredAgents = agents.filter((agent: Agent) => {
    if (selectedRole === 'ALL') return true;
    return agent.role?.displayName.toUpperCase() === selectedRole;
  });

  const handleOpenDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveAbility(agent.abilities?.[0] || null);
    setIsPlayingVoice(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleCloseDetails = () => {
    setSelectedAgent(null);
    setActiveAbility(null);
    setIsPlayingVoice(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playVoiceLine = () => {
    if (!selectedAgent?.voiceLine?.mediaList?.[0]?.wave) return;
    
    if (isPlayingVoice) {
      audioRef.current?.pause();
      setIsPlayingVoice(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(selectedAgent.voiceLine.mediaList[0].wave);
      audioRef.current.volume = 0.5;
      audioRef.current.play();
      setIsPlayingVoice(true);
      
      audioRef.current.onended = () => {
        setIsPlayingVoice(false);
      };
    }
  };

  if (loading) return <Loader tip={isVi ? "Đang tải dữ liệu Đặc vụ..." : "Loading Agents data..."} />;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h2 style={{ color: '#ff4655', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
          {isVi ? 'VALORANT ĐẶC VỰ' : 'VALORANT AGENTS'}
        </h2>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
          {isVi ? 'DANH SÁCH ĐẶC VỤ' : 'AGENT LIST'}
        </h1>
      </div>

      {/* Filter Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <Radio.Group
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          buttonStyle="solid"
          size="large"
          style={{
            background: 'rgba(15, 25, 35, 0.65)',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {roles.map((role) => (
            <Radio.Button
              key={role}
              value={role}
              style={{
                background: selectedRole === role ? '#ff4655' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                margin: '0 2px',
                height: '40px',
                lineHeight: '40px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
            >
              {role === 'ALL' ? (isVi ? 'Tất cả' : 'All') : role}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      {/* Agents Grid List */}
      <motion.div layout>
        <Row gutter={[24, 24]}>
          <AnimatePresence>
            {filteredAgents.map((agent) => (
              <Col xs={24} sm={12} md={8} lg={6} key={agent.uuid}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    hoverable
                    onClick={() => handleOpenDetails(agent)}
                    style={{
                      background: 'rgba(15, 25, 35, 0.75)',
                      border: '1px solid rgba(255, 70, 85, 0.15)',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                    styles={{ body: { padding: 0 } }}
                  >
                    {/* Agent Background Splash Card */}
                    <div
                      style={{
                        height: '220px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: agent.backgroundGradientColors
                          ? `linear-gradient(135deg, #${agent.backgroundGradientColors[0]} 0%, #${agent.backgroundGradientColors[1]} 50%, #${agent.backgroundGradientColors[2]} 100%)`
                          : 'linear-gradient(135deg, #1c252e 0%, #0f1923 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {agent.background && (
                        <img
                          src={agent.background}
                          alt=""
                          style={{
                            position: 'absolute',
                            opacity: 0.15,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      {agent.bustPortrait && (
                        <motion.img
                          src={agent.bustPortrait}
                          alt={agent.displayName}
                          style={{
                            height: '240px',
                            objectFit: 'contain',
                            zIndex: 1,
                            marginTop: '20px',
                          }}
                          whileHover={{ scale: 1.15, y: -10 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        />
                      )}
                    </div>

                    {/* Agent Brief Info */}
                    <div style={{ padding: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            letterSpacing: '1px',
                          }}
                        >
                          {agent.displayName.toUpperCase()}
                        </span>
                        {agent.role?.displayIcon && (
                          <Tooltip title={agent.role.displayName}>
                            <Avatar src={agent.role.displayIcon} size="small" style={{ background: '#1c252e' }} />
                          </Tooltip>
                        )}
                      </div>
                      <div style={{ color: '#8f9499', fontSize: '12px', marginTop: '4px', textTransform: 'uppercase' }}>
                        // {agent.role ? agent.role.displayName : (isVi ? 'Không rõ vai trò' : 'Unknown Role')}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </motion.div>

      {/* Drawer Detail View */}
      <Drawer
        title={
          selectedAgent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
              {selectedAgent.role?.displayIcon && (
                <Avatar src={selectedAgent.role.displayIcon} size="large" style={{ background: '#1c252e' }} />
              )}
              <div>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {selectedAgent.displayName.toUpperCase()}
                </span>
                <div style={{ fontSize: '11px', color: '#ff4655', textTransform: 'uppercase', marginTop: '2px' }}>
                  {isVi ? 'Vai Trò: ' : 'Role: '} {selectedAgent.role?.displayName}
                </div>
              </div>
            </div>
          ) : null
        }
        placement="right"
        size="large"
        onClose={handleCloseDetails}
        open={selectedAgent !== null}
        styles={{
          header: { background: '#0f1923', borderBottom: '1px solid #2e303a' },
          body: {
            background: '#0c1015',
            color: '#ffffff',
            padding: '24px',
          }
        }}
      >
        {selectedAgent && (
          <div style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Visual representation */}
            <div
              style={{
                display: 'flex',
                background: selectedAgent.backgroundGradientColors
                  ? `linear-gradient(135deg, #${selectedAgent.backgroundGradientColors[0]}11 0%, #${selectedAgent.backgroundGradientColors[1]}22 50%, #${selectedAgent.backgroundGradientColors[2]}11 100%)`
                  : '#16202c',
                borderRadius: '8px',
                padding: '20px',
                gap: '20px',
                alignItems: 'center',
                border: '1px solid #ff465522',
                marginBottom: '24px',
              }}
            >
              {selectedAgent.fullPortraitV2 && (
                <img
                  src={selectedAgent.fullPortraitV2}
                  alt={selectedAgent.displayName}
                  style={{ width: '160px', height: '200px', objectFit: 'contain' }}
                />
              )}
              <div style={{ flex: 1 }}>
                {/* Play Voice Line Button */}
                {selectedAgent.voiceLine?.mediaList?.[0]?.wave && (
                  <Button
                    type="primary"
                    danger
                    icon={isPlayingVoice ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={playVoiceLine}
                    style={{ marginBottom: '16px', fontWeight: 'bold' }}
                  >
                    {isPlayingVoice 
                      ? (isVi ? 'Dừng giọng nói' : 'Stop voice line') 
                      : (isVi ? 'Phát giọng nói Đặc vụ' : 'Play Agent Voice')}
                  </Button>
                )}
                <div style={{ color: '#8f9499', fontSize: '12px', textTransform: 'uppercase' }}>
                  {isVi ? 'TIỂU SỬ QUÁ KHỨ' : 'BIOGRAPHY'}
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '6px', color: '#d1d5db' }}>
                  {selectedAgent.description}
                </p>
              </div>
            </div>

            {/* Abilities Section */}
            <div>
              <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px', marginBottom: '16px', borderBottom: '1px dashed #2e303a', paddingBottom: '8px' }}>
                {isVi ? 'KỸ NĂNG ĐẶC BIỆT' : 'SPECIAL ABILITIES'}
              </div>

              {/* Skills Icons Tabs Selector */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {selectedAgent.abilities?.map((ability, idx) => (
                  <div
                    key={ability.slot}
                    onClick={() => setActiveAbility(ability)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px 4px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      background: activeAbility?.slot === ability.slot ? '#ff465522' : 'rgba(255,255,255,0.02)',
                      border: activeAbility?.slot === ability.slot ? '1px solid #ff4655' : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {ability.displayIcon ? (
                      <img
                        src={ability.displayIcon}
                        alt={ability.displayName}
                        style={{
                          height: '36px',
                          width: '36px',
                          objectFit: 'contain',
                          filter: activeAbility?.slot === ability.slot ? 'brightness(1)' : 'brightness(0.6)',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#8f9499' }}>A{idx + 1}</span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: activeAbility?.slot === ability.slot ? '#ff4655' : '#8f9499', marginTop: '6px', textTransform: 'uppercase' }}>
                      {ability.slot === 'Passive' ? (isVi ? 'Nội tại' : 'Passive') : ability.slot}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Skill Details */}
              {activeAbility && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {activeAbility.displayName.toUpperCase()}
                    </h3>
                    <Tag color="red" style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }}>
                      {activeAbility.slot}
                    </Tag>
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
                    {activeAbility.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
