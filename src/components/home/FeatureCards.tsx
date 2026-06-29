import { useNavigate } from 'react-router-dom'
import { Row, Col, Card } from 'antd'
import { CompassOutlined, DeploymentUnitOutlined, TrophyOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function FeatureCards() {
  const { isVi } = useLanguage()
  const { colorPrimary, isValorant } = useGame()
  const navigate = useNavigate()

  const cards = [
    {
      key: '/agents',
      icon: <DeploymentUnitOutlined className="text-[28px] mb-3" style={{ color: colorPrimary }} />,
      title: isVi 
        ? (isValorant ? 'ĐẶC VỤ CHIẾN THUẬT' : 'BIỆT KÍCH CHIẾN THUẬT')
        : (isValorant ? 'TACTICAL AGENTS' : 'TACTICAL FACTIONS'),
      desc: isVi 
        ? (isValorant ? 'Thông tin đặc vụ, vai trò và âm thanh kỹ năng.' : 'Thông tin nhân vật, vai trò và trang bị kỹ năng.') 
        : 'All playable characters with detailed descriptions.',
    },
    {
      key: '/weapons',
      icon: <ThunderboltOutlined className="text-[28px] mb-3" style={{ color: colorPrimary }} />,
      title: isVi ? 'KHO VŨ KHÍ' : 'WEAPONS & SKINS',
      desc: isVi ? 'Thông số vũ khí bắn súng và các skins súng.' : 'Weapon ranges, reload speeds, and skins.',
    },
    {
      key: '/maps',
      icon: <CompassOutlined className="text-[28px] mb-3" style={{ color: colorPrimary }} />,
      title: isVi ? 'BẢN ĐỒ CHIẾN TRƯỜNG' : 'TACTICAL MAPS',
      desc: isVi ? 'Địa hình minimap độ phân giải cao và tọa độ.' : 'Minimaps, coordinates and spatial layout.',
    },
    {
      key: '/3d-hub',
      icon: <TrophyOutlined className="text-[28px] mb-3" style={{ color: colorPrimary }} />,
      title: isVi ? 'TRÌNH DIỄN ARSENAL 3D' : 'ARSENAL 3D',
      desc: isVi ? 'Tải mô hình 3D (.glb) cá nhân và chỉnh vật liệu.' : 'Load custom GLB/GLTF model in canvas.',
    },
  ]

  return (
    <Row gutter={[24, 24]}>
      {cards.map((card) => (
        <Col xs={24} sm={12} md={6} key={card.key}>
          <Card
            hoverable
            className="!bg-[rgba(15,25,35,0.65)] !backdrop-blur-[10px] !border !border-white/5 !text-white !text-left !rounded-lg"
            onClick={() => navigate(card.key)}
          >
            {card.icon}
            <h3 className="text-base font-bold text-white m-0 mb-1.5">{card.title}</h3>
            <p className="text-[#8f9499] text-xs leading-[1.4]">{card.desc}</p>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
