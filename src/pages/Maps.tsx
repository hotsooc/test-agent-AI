import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Row, Col, Modal, Image } from 'antd';
import { CompassOutlined, GlobalOutlined } from '@ant-design/icons';
import { getMaps } from '../api/valorant';
import Loader from '../components/Loader';
import { MapData } from '../types/valorant';

export default function Maps({ language }: { language: string }) {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);

  const isVi = language === 'vi-VN';

  useEffect(() => {
    setLoading(true);
    const fetchMaps = async () => {
      try {
        const data = await getMaps(language);
        // Filter out test maps or duplicates if any
        const filtered = data.filter((map: MapData) => map.displayName && map.listViewIcon);
        setMaps(filtered);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMaps();
  }, [language]);

  if (loading) return <Loader tip={isVi ? "Đang tải dữ liệu Bản đồ..." : "Loading Maps data..."} />;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h2 style={{ color: '#ff4655', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
          {isVi ? 'VALORANT BẢN ĐỒ' : 'VALORANT MAPS'}
        </h2>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
          {isVi ? 'DANH SÁCH BẢN ĐỒ CHIẾN THUẬT' : 'TACTICAL MAP LIST'}
        </h1>
      </div>

      {/* Maps Grid */}
      <Row gutter={[24, 24]}>
        {maps.map((map) => (
          <Col xs={24} sm={12} md={8} key={map.uuid}>
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
              <Card
                hoverable
                onClick={() => setSelectedMap(map)}
                style={{
                  background: 'rgba(15, 25, 35, 0.75)',
                  border: '1px solid rgba(255, 70, 85, 0.15)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Map Splash Background */}
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={map.splash}
                    alt={map.displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      background: 'linear-gradient(to top, rgba(12,16,21,1) 0%, rgba(12,16,21,0) 100%)',
                      height: '60px',
                    }}
                  />
                </div>

                {/* Map Info Box */}
                <div style={{ padding: '20px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px 0', letterSpacing: '1px' }}>
                    {map.displayName.toUpperCase()}
                  </h3>
                  <div style={{ color: '#8f9499', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GlobalOutlined style={{ color: '#ff4655' }} />
                    <span>{map.coordinates || (isVi ? 'Tọa độ không rõ' : 'Unknown Coordinates')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Map Tactical Minimap Modal */}
      <Modal
        title={
          selectedMap ? (
            <div style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {selectedMap.displayName.toUpperCase()}
              </span>
              <span style={{ color: '#ff4655', fontSize: '12px', marginLeft: '12px', textTransform: 'uppercase', borderLeft: '2px solid #2e303a', paddingLeft: '12px' }}>
                {isVi ? 'Sơ đồ chiến thuật' : 'Tactical Diagram'}
              </span>
            </div>
          ) : null
        }
        open={selectedMap !== null}
        onCancel={() => setSelectedMap(null)}
        footer={null}
        width={750}
        styles={{
          body: {
            background: '#0c1015',
            color: '#ffffff',
            padding: '24px',
            textAlign: 'center',
          }
        }}
        wrapClassName="valorant-modal-wrap"
      >
        {selectedMap && (
          <div style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Row gutter={[24, 24]} align="middle">
              {/* Splash Art */}
              <Col xs={24} md={12}>
                <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #2e303a' }}>
                  <img
                    src={selectedMap.splash}
                    alt=""
                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <div style={{ color: '#ff4655', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {isVi ? 'TỌA ĐỘ CHIẾN TRƯỜNG' : 'BATTLEFIELD COORDINATES'}
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '14px', marginTop: '6px' }}>
                    {isVi ? 'Bản đồ nằm ở vị trí địa lý: ' : 'Map is geographically located at: '}
                    {selectedMap.coordinates || (isVi ? 'Đang cập nhật' : 'Updating')}
                  </p>
                </div>
              </Col>

              {/* Minimap Tactical Overlay */}
              <Col xs={24} md={12}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ color: '#8f9499', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
                    <CompassOutlined /> {isVi ? 'MINIMAP CHUYÊN DỤNG (BẤM ĐỂ PHÓNG TO)' : 'TACTICAL MINIMAP (CLICK TO ZOOM)'}
                  </div>
                  {selectedMap.displayIcon ? (
                    <div style={{ background: '#080c10', padding: '10px', borderRadius: '6px', border: '1px solid #2e303a' }}>
                      <Image
                        src={selectedMap.displayIcon}
                        alt="Minimap"
                        style={{
                          maxHeight: '260px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ color: '#ff4655', padding: '40px 0' }}>
                      {isVi ? 'Bản đồ này không có dữ liệu hình ảnh minimap.' : 'No minimap asset found for this map.'}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
