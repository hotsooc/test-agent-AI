import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Row, Col, Radio, Modal, Avatar, Tooltip, Progress, Table, Image, Tag, Button, Input } from 'antd';
import { PlaySquareOutlined, SearchOutlined } from '@ant-design/icons';
import { getWeapons } from '../api/valorant';
import Loader from '../components/Loader';
import { Weapon, Skin } from '../types/valorant';

export default function Weapons({ language }: { language: string }) {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [activeSkin, setActiveSkin] = useState<Skin | null>(null);
  const [activeChromaIdx, setActiveChromaIdx] = useState<number>(0);
  const [activeLevelIdx, setActiveLevelIdx] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isVi = language === 'vi-VN';

  useEffect(() => {
    setLoading(true);
    const fetchWeapons = async () => {
      try {
        const data = await getWeapons(language);
        setWeapons(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchWeapons();
  }, [language]);

  const getCategoryName = (category: string | null | undefined) => {
    if (!category) return isVi ? 'Cận chiến' : 'Melee';
    const parts = category.split('::');
    const name = parts[parts.length - 1];
    switch (name) {
      case 'Rifle': return isVi ? 'Súng trường' : 'Rifle';
      case 'Heavy': return isVi ? 'Hạng nặng' : 'Heavy';
      case 'Shotgun': return isVi ? 'Súng shotgun' : 'Shotgun';
      case 'Sidearm': return isVi ? 'Súng lục' : 'Sidearm';
      case 'Sniper': return isVi ? 'Bắn tỉa' : 'Sniper';
      case 'SMG': return isVi ? 'Súng tiểu liên' : 'SMG';
      default: return name;
    }
  };

  const categories = ['ALL', 'Sidearm', 'SMG', 'Rifle', 'Sniper', 'Shotgun', 'Heavy', 'Melee'];

  const filteredWeapons = weapons.filter((weapon: Weapon) => {
    if (selectedCategory === 'ALL') return true;
    const parts = weapon.category.split('::');
    const shortCategory = parts[parts.length - 1];
    return shortCategory === selectedCategory;
  });

  const handleOpenDetails = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setActiveSkin(null);
    setActiveChromaIdx(0);
    setActiveLevelIdx(-1);
    setSearchTerm('');
  };

  const handleCloseDetails = () => {
    setSelectedWeapon(null);
    setActiveSkin(null);
    setActiveChromaIdx(0);
    setActiveLevelIdx(-1);
    setSearchTerm('');
  };

  const selectSkin = (skin: Skin) => {
    setActiveSkin(skin);
    setActiveChromaIdx(0);
    setActiveLevelIdx(-1);
  };

  if (loading) return <Loader tip={isVi ? "Đang tải danh sách Vũ khí..." : "Loading Weapons data..."} />;

  const damageColumns = [
    { title: isVi ? 'Cự ly (m)' : 'Range (m)', dataIndex: 'range', key: 'range', width: '30%' },
    { title: isVi ? 'Đầu 🎯' : 'Head 🎯', dataIndex: 'head', key: 'head', width: '23%', render: (val: number) => <span style={{ color: '#ff4655', fontWeight: 'bold' }}>{Math.round(val)}</span> },
    { title: isVi ? 'Thân 👕' : 'Body 👕', dataIndex: 'body', key: 'body', width: '23%', render: (val: number) => <span style={{ color: '#ffffff' }}>{Math.round(val)}</span> },
    { title: isVi ? 'Chân 🦵' : 'Leg 🦵', dataIndex: 'leg', key: 'leg', width: '24%', render: (val: number) => <span style={{ color: '#8f9499' }}>{Math.round(val)}</span> },
  ];

  const getDamageData = (weapon: Weapon) => {
    if (!weapon.weaponStats?.damageRanges) return [];
    return weapon.weaponStats.damageRanges.map((range, idx) => ({
      key: idx,
      range: `${range.rangeStartMeters}-${range.rangeEndMeters}m`,
      head: range.headDamage,
      body: range.bodyDamage,
      leg: range.legDamage,
    }));
  };

  const getFilteredSkins = () => {
    if (!selectedWeapon) return [];
    return (selectedWeapon.skins || []).filter(
      (skin) =>
        skin.displayIcon &&
        skin.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h2 style={{ color: '#ff4655', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
          {isVi ? 'VALORANT VŨ KHÍ' : 'VALORANT WEAPONS'}
        </h2>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
          {isVi ? 'KHO VŨ KHÍ & SKINS' : 'WEAPONS & SKINS'}
        </h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <Radio.Group
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          buttonStyle="solid"
          size="large"
          style={{
            background: 'rgba(15, 25, 35, 0.65)',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {categories.map((cat) => (
            <Radio.Button
              key={cat}
              value={cat}
              style={{
                background: selectedCategory === cat ? '#ff4655' : 'transparent',
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
              {cat === 'ALL' ? (isVi ? 'Tất cả' : 'All') : getCategoryName(cat)}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <Row gutter={[24, 24]}>
        {filteredWeapons.map((weapon) => (
          <Col xs={24} sm={12} md={8} key={weapon.uuid}>
            <Card
              hoverable
              onClick={() => handleOpenDetails(weapon)}
              style={{
                background: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255, 70, 85, 0.15)',
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
            >
              <div style={{ minHeight: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <motion.img
                  src={weapon.displayIcon}
                  alt={weapon.displayName}
                  style={{
                    width: '100%',
                    maxHeight: '100px',
                    objectFit: 'contain',
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                />
              </div>

              <div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.5px' }}>
                    {weapon.displayName.toUpperCase()}
                  </span>
                  <Tag color="red" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {getCategoryName(weapon.shopData?.category)}
                  </Tag>
                </div>

                {weapon.weaponStats && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: '#8f9499', fontSize: '12px' }}>
                    <span>{isVi ? 'Băng đạn: ' : 'Magazine: '} <strong style={{ color: '#fff' }}>{weapon.weaponStats.magazineSize}</strong> {isVi ? 'viên' : 'rds'}</span>
                    <span>{isVi ? 'Tốc bắn: ' : 'Fire rate: '} <strong style={{ color: '#fff' }}>{weapon.weaponStats.fireRate}</strong>/s</span>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          selectedWeapon ? (
            <div style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {selectedWeapon.displayName.toUpperCase()}
              </span>
              <span style={{ color: '#ff4655', fontSize: '12px', marginLeft: '12px', textTransform: 'uppercase', borderLeft: '2px solid #2e303a', paddingLeft: '12px' }}>
                {isVi ? 'KHO LƯU TRỮ VŨ KHÍ' : 'WEAPON ARSENAL'}
              </span>
            </div>
          ) : null
        }
        open={selectedWeapon !== null}
        onCancel={handleCloseDetails}
        footer={null}
        width={950}
        styles={{
          body: {
            background: '#0c1015',
            color: '#ffffff',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px',
          }
        }}
        wrapClassName="valorant-modal-wrap"
        style={{ top: 40 }}
      >
        {selectedWeapon && (
          <div style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              <Col xs={24} md={12}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', marginBottom: '16px' }}>
                    {isVi ? 'THÔNG SỐ SÚNG' : 'WEAPON STATISTICS'}
                  </div>
                  {selectedWeapon.weaponStats ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                          <span>{isVi ? 'Cỡ băng đạn:' : 'Magazine size:'}</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedWeapon.weaponStats.magazineSize} {isVi ? 'viên' : 'rounds'}</span>
                        </div>
                        <Progress percent={(selectedWeapon.weaponStats.magazineSize / 100) * 100} showInfo={false} strokeColor="#ff4655" trailColor="#2e303a" />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                          <span>{isVi ? 'Tốc độ bắn:' : 'Fire rate:'}</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedWeapon.weaponStats.fireRate} {isVi ? 'viên/giây' : 'rounds/sec'}</span>
                        </div>
                        <Progress percent={(selectedWeapon.weaponStats.fireRate / 20) * 100} showInfo={false} strokeColor="#ff4655" trailColor="#2e303a" />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                          <span>{isVi ? 'Độ xuyên thấu:' : 'Wall penetration:'}</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>
                            {selectedWeapon.weaponStats.wallPenetration ? (isVi ? (selectedWeapon.weaponStats.wallPenetration.split('::')[1] === 'High' ? 'Cao' : selectedWeapon.weaponStats.wallPenetration.split('::')[1] === 'Medium' ? 'Trung bình' : 'Thấp') : selectedWeapon.weaponStats.wallPenetration.split('::')[1]) : (isVi ? 'Không' : 'None')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#8f9499', textAlign: 'center', padding: '20px 0' }}>
                      {isVi ? 'Vũ khí cận chiến không có chỉ số bắn súng.' : 'Melee weapons do not have ranged statistics.'}
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', marginBottom: '16px' }}>
                    {isVi ? 'BẢNG SÁT THƯƠNG CHI TIẾT' : 'DETAILED DAMAGE TABLE'}
                  </div>
                  {selectedWeapon.weaponStats?.damageRanges ? (
                    <Table
                      dataSource={getDamageData(selectedWeapon)}
                      columns={damageColumns}
                      pagination={false}
                      size="small"
                      style={{ background: 'transparent' }}
                      rowClassName={() => 'custom-table-row'}
                    />
                  ) : (
                    <div style={{ color: '#8f9499', textAlign: 'center', padding: '20px 0' }}>
                      {isVi ? 'Sát thương cận chiến: Trực diện: 50 / Sau lưng: 150' : 'Melee damage: Front: 50 / Backstab: 150'}
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2e303a', paddingBottom: '8px' }}>
                <span style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
                  {isVi ? 'BỘ SƯU TẬP SKINS VŨ KHÍ' : 'WEAPON SKINS COLLECTION'} ({getFilteredSkins().length})
                </span>
                <div style={{ width: '220px' }}>
                  <Input
                    placeholder={isVi ? "Tìm kiếm skin..." : "Search skins..."}
                    prefix={<SearchOutlined style={{ color: '#ff4655' }} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      background: 'rgba(15, 25, 35, 0.8)',
                      border: '1px solid #2e303a',
                      color: '#fff',
                    }}
                    className="search-skin-input"
                  />
                </div>
              </div>

              <Row gutter={[16, 16]}>
                {getFilteredSkins().map((skin) => (
                  <Col xs={12} sm={8} md={6} key={skin.uuid}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectSkin(skin)}
                      style={{ height: '100%' }}
                    >
                      <Card
                        hoverable
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 70, 85, 0.12)',
                          borderRadius: '8px',
                          height: '100%',
                          textAlign: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                        styles={{ body: { padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minHeight: '130px' } }}
                      >
                        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <img
                            src={skin.displayIcon || ''}
                            alt={skin.displayName}
                            style={{ maxWidth: '100%', maxHeight: '55px', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {skin.displayName}
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
                {getFilteredSkins().length === 0 && (
                  <Col span={24}>
                    <div style={{ color: '#555c64', textAlign: 'center', padding: '40px 0', fontSize: '13px' }}>
                      {isVi ? 'Không tìm thấy skin nào.' : 'No skins found.'}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* Nested Skin Detail Modal */}
      <Modal
        title={
          activeSkin ? (
            <div style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {activeSkin.displayName.toUpperCase()}
              </span>
              <span style={{ color: '#ff4655', fontSize: '11px', marginLeft: '12px', textTransform: 'uppercase', borderLeft: '2px solid #2e303a', paddingLeft: '12px' }}>
                {isVi ? 'CHI TIẾT SKIN' : 'SKIN DETAILS'}
              </span>
            </div>
          ) : null
        }
        open={activeSkin !== null}
        onCancel={() => {
          setActiveSkin(null);
          setActiveChromaIdx(0);
          setActiveLevelIdx(-1);
        }}
        footer={null}
        width={750}
        styles={{
          body: {
            background: '#0c1015',
            color: '#ffffff',
            padding: '24px',
          }
        }}
        wrapClassName="valorant-modal-wrap"
        style={{ top: 80 }}
      >
        {activeSkin && (
          <div style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  src={
                    activeSkin.chromas?.[activeChromaIdx]?.displayIcon ||
                    activeSkin.displayIcon || ''
                  }
                  alt={activeSkin.displayName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '180px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                {activeSkin.chromas && activeSkin.chromas.length > 1 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#8f9499', fontSize: '12px', marginBottom: '6px', textAlign: 'left' }}>
                      {isVi ? 'CÁC PHIÊN BẢN MÀU SẮC (CHROMAS)' : 'SKIN CHROMAS (COLOR VARIATIONS)'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                      {activeSkin.chromas.map((chroma, idx) => (
                        <Tooltip key={chroma.uuid} title={chroma.displayName}>
                          <div
                            onClick={() => setActiveChromaIdx(idx)}
                            style={{
                              width: '36px',
                              height: '36px',
                              border: activeChromaIdx === idx ? '2px solid #ff4655' : '1px solid #2e303a',
                              borderRadius: '4px',
                              padding: '2px',
                              cursor: 'pointer',
                              background: '#1c252e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img
                              src={chroma.swatch || chroma.displayIcon || activeSkin.displayIcon || ''}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {activeSkin.levels &&
                  activeSkin.levels.some((level) => level.streamedVideo) && (
                    <div style={{ textAlign: 'left', marginTop: '16px' }}>
                      <div style={{ color: '#8f9499', fontSize: '12px', marginBottom: '8px' }}>
                        <PlaySquareOutlined /> {isVi ? 'HOẠT ẢNH NÂNG CẤP (VFX / FINISHER)' : 'UPGRADE ANIMATIONS (VFX / FINISHER)'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {activeSkin.levels
                          .filter((level) => level.streamedVideo)
                          .map((level, idx) => {
                            const mainIdx = activeSkin.levels.findIndex(l => l.uuid === level.uuid);
                            return (
                              <Button
                                key={level.uuid}
                                type="default"
                                size="small"
                                onClick={() => setActiveLevelIdx(mainIdx)}
                                style={{
                                  background: activeLevelIdx === mainIdx ? '#ff465522' : 'rgba(255,255,255,0.05)',
                                  color: '#ff4655',
                                  borderColor: '#ff4655',
                                  fontSize: '11px',
                                  fontWeight: activeLevelIdx === mainIdx ? 'bold' : 'normal',
                                }}
                              >
                                {level.displayName.split('Level')[1] || (isVi ? `Cấp ${idx + 1}` : `Lvl ${idx + 1}`)}
                              </Button>
                            );
                          })}
                      </div>

                      {activeLevelIdx !== -1 && activeSkin.levels[activeLevelIdx]?.streamedVideo && (
                        <div style={{ border: '1px solid rgba(255, 70, 85, 0.3)', borderRadius: '6px', overflow: 'hidden', background: '#000', marginTop: '8px' }}>
                          <video
                            key={activeSkin.levels[activeLevelIdx].streamedVideo || ''}
                            src={activeSkin.levels[activeLevelIdx].streamedVideo || ''}
                            controls
                            autoPlay={false}
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
