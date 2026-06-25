import ModelViewer from '../components/ModelViewer';

export default function Viewer3D() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: 'left', marginBottom: '16px' }}>
        <h2 style={{ color: '#ff4655', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
          3D MODEL HUB
        </h2>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>
          TRÌNH TRÌNH DIỄN VÀ CHUYỂN ĐỔI 3D
        </h1>
        <p style={{ color: '#8f9499', fontSize: '14px', marginTop: '10px', maxWidth: '800px', lineHeight: '1.6' }}>
          Chào mừng đến với Trình duyệt Vũ khí & Mô hình 3D. Bạn có thể kéo thả bất kỳ file 3D định dạng <strong>.glb</strong> hoặc <strong>.gltf</strong> của riêng bạn vào đây để xem trực tiếp với đồ họa chân thực, tùy biến góc chiếu sáng, đổi màu Hologram, hiệu ứng Vàng Gold hoặc dạng Wireframe mạng lưới công nghệ.
        </p>
      </div>

      <ModelViewer />
    </div>
  );
}
