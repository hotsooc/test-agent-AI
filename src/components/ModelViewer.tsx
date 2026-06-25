import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Stars, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Upload, Button, Slider, Radio, Space, Card, Alert, message } from 'antd';
import { UploadOutlined, RotateRightOutlined, SettingOutlined } from '@ant-design/icons';

function DefaultModel({ materialType, colorTheme }: { materialType: string; colorTheme: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const bladeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 2;
      ringRef.current.rotation.y = time * 0.5;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -time * 1.5;
      ringRef2.current.rotation.z = time;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.15;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  const material = useMemo(() => {
    const mainColor = colorTheme === 'red' ? '#ff4655' : '#00ffff';
    // const accentColor = colorTheme === 'red' ? '#ff808b' : '#80ffff';

    if (materialType === 'hologram') {
      return new THREE.MeshPhysicalMaterial({
        color: mainColor,
        emissive: mainColor,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.4,
        wireframe: true,
        roughness: 0.1,
        metalness: 0.9,
      });
    } else if (materialType === 'gold') {
      return new THREE.MeshStandardMaterial({
        color: '#ffd700',
        metalness: 1.0,
        roughness: 0.1,
        emissive: '#3a2d00',
      });
    } else if (materialType === 'wireframe') {
      return new THREE.MeshBasicMaterial({
        color: '#ffffff',
        wireframe: true,
      });
    } else {
      return new THREE.MeshStandardMaterial({
        color: mainColor,
        metalness: 0.8,
        roughness: 0.2,
        emissive: '#110000',
      });
    }
  }, [materialType, colorTheme]);

  const hiltMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a1f',
      metalness: 0.9,
      roughness: 0.4,
    });
  }, []);

  const coreMaterial = useMemo(() => {
    const coreColor = colorTheme === 'red' ? '#ff4655' : '#00e5ff';
    return new THREE.MeshBasicMaterial({
      color: coreColor,
    });
  }, [colorTheme]);

  return (
    <group ref={groupRef}>
      <mesh ref={bladeRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.5, 0.05]} />
        <primitive object={material} attach="material" />
      </mesh>

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.15]} />
        <primitive object={hiltMaterial} attach="material" />
      </mesh>

      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
        <primitive object={hiltMaterial} attach="material" />
      </mesh>

      <mesh position={[0, -1.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <primitive object={hiltMaterial} attach="material" />
      </mesh>

      <mesh ref={coreRef} position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.6, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh ref={ringRef2} position={[0, 1.5, 0]}>
        <torusGeometry args={[0.3, 0.015, 8, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function UploadedModelRenderer({ model, materialType, colorTheme }: { model: THREE.Group; materialType: string; colorTheme: string }) {
  const modelRef = useRef<any>(null);

  useEffect(() => {
    if (!model) return;

    model.traverse((child: any) => {
      if (child.isMesh) {
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }

        const mainColor = colorTheme === 'red' ? '#ff4655' : '#00ffff';

        if (materialType === 'hologram') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: mainColor,
            emissive: mainColor,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.45,
            wireframe: true,
          });
        } else if (materialType === 'gold') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#ffd700',
            metalness: 0.9,
            roughness: 0.1,
          });
        } else if (materialType === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({
            color: '#ffffff',
            wireframe: true,
          });
        } else {
          child.material = child.userData.originalMaterial;
        }
      }
    });
  }, [model, materialType, colorTheme]);

  return <primitive object={model} ref={modelRef} />;
}

function CameraController({ autoRotate }: { autoRotate: boolean }) {
  const { camera } = useThree();
  useFrame((state) => {
    if (autoRotate) {
      const time = state.clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.15) * 8;
      camera.position.z = Math.cos(time * 0.15) * 8;
      camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

export default function ModelViewer() {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [modelName, setModelName] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('default');
  const [colorTheme, setColorTheme] = useState<string>('red');
  const [lightIntensity, setLightIntensity] = useState<number>(1.0);
  const [ambientIntensity, setAmbientIntensity] = useState<number>(0.4);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = (file: any) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const contents = e.target.result;
        const loader = new GLTFLoader();

        loader.parse(
          contents,
          '',
          (gltf) => {
            setModel(gltf.scene);
            setModelName(file.name);
            setLoading(false);
            message.success(`Đã tải mô hình "${file.name}" thành công!`);
          },
          (error) => {
            console.error('Lỗi phân giải GLTF:', error);
            setLoading(false);
            message.error('Không thể phân giải file 3D. Hãy thử file .glb/.gltf hợp lệ.');
          }
        );
      } catch (err) {
        console.error('Lỗi đọc file:', err);
        setLoading(false);
        message.error('Có lỗi xảy ra khi đọc file.');
      }
    };

    reader.onerror = () => {
      setLoading(false);
      message.error('Lỗi khi đọc file.');
    };

    reader.readAsArrayBuffer(file);
    return false; 
  };

  const handleReset = () => {
    setModel(null);
    setModelName('');
    message.info('Đã khôi phục về mô hình mặc định.');
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', minHeight: '600px' }}>
        <div
          style={{
            position: 'relative',
            backgroundColor: '#0c0f12',
            border: '2px solid #ff465533',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(12, 15, 18, 0.8)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
              }}
            >
              Đang tải và dựng hình 3D...
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 2,
              pointerEvents: 'none',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <div style={{ color: '#ff4655', fontSize: '12px', letterSpacing: '3px', fontWeight: 'bold' }}>
              SYSTEM READY // 3D ARSENAL HUB
            </div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '500', marginTop: '4px' }}>
              {modelName ? modelName.toUpperCase() : 'ENERGY MELEE BLADE (DEMO)'}
            </div>
          </div>

          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[5, 10, 5]} intensity={lightIntensity} color="#ffffff" castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color={colorTheme === 'red' ? '#ff4655' : '#00ffff'} />
            
            <Suspense fallback={<Html center><span style={{ color: '#ff4655' }}>Đang tải Canvas...</span></Html>}>
              <Center>
                {model ? (
                  <UploadedModelRenderer model={model} materialType={materialType} colorTheme={colorTheme} />
                ) : (
                  <DefaultModel materialType={materialType} colorTheme={colorTheme} />
                )}
              </Center>
            </Suspense>

            <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1.5} />
            <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={20} />
            <CameraController autoRotate={autoRotate} />
          </Canvas>

          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 2,
              color: '#8f9499',
              fontSize: '11px',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              textAlign: 'right',
            }}
          >
            ROTATE: LEFT MOUSE<br />
            ZOOM: SCROLL<br />
            PAN: RIGHT MOUSE
          </div>
        </div>

        <div>
          <Card
            title={
              <span style={{ color: '#fff', fontSize: '16px', letterSpacing: '1px' }}>
                <SettingOutlined /> BẢNG TÙY BIẾN
              </span>
            }
            bordered={false}
            style={{
              background: '#0f1923',
              border: '1px solid #2e303a',
              borderRadius: '8px',
              height: '100%',
              color: '#fff',
            }}
            headStyle={{ borderBottom: '1px solid #2e303a' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#8f9499', marginBottom: '8px', fontSize: '13px' }}>NHẬP MÔ HÌNH 3D (.GLB / .GLTF)</div>
                <Upload
                  accept=".glb,.gltf"
                  beforeUpload={handleUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} type="primary" danger style={{ width: '100%' }}>
                    Chọn tệp tin từ máy
                  </Button>
                </Upload>
                <div style={{ fontSize: '11px', color: '#6a7075', marginTop: '6px' }}>
                  Hỗ trợ định dạng binary glTF (.glb) trích xuất từ game.
                </div>
                {model && (
                  <Button danger type="link" onClick={handleReset} style={{ padding: 0, marginTop: '8px' }}>
                    Khôi phục mô hình demo
                  </Button>
                )}
              </div>

              <div>
                <div style={{ color: '#8f9499', marginBottom: '8px', fontSize: '13px' }}>CHẤT LIỆU MÔ HÌNH (MATERIAL)</div>
                <Radio.Group
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Radio.Button value="default" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#fff' }}>Gốc</Radio.Button>
                  <Radio.Button value="hologram" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#fff' }}>Holo</Radio.Button>
                  <Radio.Button value="gold" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#fff' }}>Vàng</Radio.Button>
                  <Radio.Button value="wireframe" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#fff' }}>Lưới</Radio.Button>
                </Radio.Group>
              </div>

              <div>
                <div style={{ color: '#8f9499', marginBottom: '8px', fontSize: '13px' }}>MÀU SẮC PHÁT SÁNG (HOLOGRAM)</div>
                <Radio.Group
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Radio.Button value="red" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#ff4655' }}>Đỏ Neon</Radio.Button>
                  <Radio.Button value="cyan" style={{ flex: 1, textAlign: 'center', background: '#1c252e', borderColor: '#2e303a', color: '#00ffff' }}>Xanh Neon</Radio.Button>
                </Radio.Group>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f9499', fontSize: '13px' }}>
                  <span>ÁNH SÁNG CHÍNH (DIRECT LIGHT)</span>
                  <span>{lightIntensity.toFixed(1)}x</span>
                </div>
                <Slider
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={lightIntensity}
                  onChange={setLightIntensity}
                  tooltip={{ open: false }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f9499', fontSize: '13px' }}>
                  <span>ÁNH SÁNG MÔI TRƯỜNG (AMBIENT)</span>
                  <span>{ambientIntensity.toFixed(1)}x</span>
                </div>
                <Slider
                  min={0.0}
                  max={1.5}
                  step={0.1}
                  value={ambientIntensity}
                  onChange={setAmbientIntensity}
                  tooltip={{ open: false }}
                />
              </div>

              <div>
                <div style={{ color: '#8f9499', marginBottom: '8px', fontSize: '13px' }}>CHẾ ĐỘ QUAY (AUTO ROTATE)</div>
                <Button
                  icon={<RotateRightOutlined />}
                  type={autoRotate ? 'primary' : 'default'}
                  danger={autoRotate}
                  style={{ width: '100%' }}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  {autoRotate ? 'Đang Tự Động Xoay' : 'Đã Tắt Tự Động Xoay'}
                </Button>
              </div>

              <Alert
                message="Mẹo Nhỏ"
                description="Bạn có thể tự xuất mô hình nhân vật/vũ khí của game định dạng .glb bằng Blender rồi tải lên đây để chiêm ngưỡng."
                type="info"
                showIcon
                style={{ background: '#142535', border: '1px solid #1890ff', color: '#a5d5ff' }}
              />
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}
