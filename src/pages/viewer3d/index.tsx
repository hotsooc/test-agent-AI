import ModelViewer from '../../components/ModelViewer'
import PageContainer from '../../components/PageContainer'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function Viewer3D() {
  const { isVi } = useLanguage()
  const { isValorant, colorPrimary } = useGame()

  return (
    <PageContainer>
      <div className="text-left mb-4">
        <h2 className="tracking-[2px] text-sm font-bold m-0 mb-1" style={{ color: colorPrimary }}>
          {isValorant ? 'VALORANT 3D MODEL HUB' : 'CS:GO 2 3D MODEL HUB'}
        </h2>
        <h1 className="text-white m-0 text-[36px] font-bold">
          {isVi ? 'TRÌNH TRÌNH DIỄN VÀ CHUYỂN ĐỔI 3D' : '3D MODEL VIEWER & CUSTOMIZER'}
        </h1>
        <p className="text-[#8f9499] text-sm mt-2.5 max-w-[800px] leading-relaxed">
          {isVi
            ? `Chào mừng đến với Trình duyệt Vũ khí & Mô hình 3D. Bạn có thể kéo thả bất kỳ file 3D định dạng .glb hoặc .gltf của riêng bạn vào đây để xem trực tiếp với đồ họa chân thực, tùy biến góc chiếu sáng, đổi màu Hologram, hiệu ứng Vàng Gold hoặc dạng Wireframe mạng lưới công nghệ phù hợp với chủ đề ${isValorant ? 'Valorant' : 'Counter-Strike 2'}.`
            : `Welcome to the 3D Weapon & Model browser. Drag and drop any .glb or .gltf files here to inspect with realistic lighting, customize the Hologram glow, toggle Gold material, or view technical Wireframe grids matching the ${isValorant ? 'Valorant' : 'Counter-Strike 2'} aesthetic.`}
        </p>
      </div>

      <ModelViewer />
    </PageContainer>
  )
}
