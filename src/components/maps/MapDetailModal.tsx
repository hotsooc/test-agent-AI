import { Modal, Row, Col, Image } from 'antd'
import { CompassOutlined } from '@ant-design/icons'
import { MapData } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function MapDetailModal({
  map,
  open,
  onClose,
}: {
  map: MapData | null
  open: boolean
  onClose: () => void
}) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()

  if (!map) return null

  return (
    <Modal
      title={
        <div className="text-white">
          <span className="text-[22px] font-bold tracking-[1px]">{map.displayName.toUpperCase()}</span>
          <span 
            className="text-xs ml-3 uppercase border-l-2 border-[#2e303a] pl-3"
            style={{ color: colorPrimary }}
          >
            {isVi ? 'Sơ đồ chiến thuật' : 'Tactical Diagram'}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
      classNames={{ body: '!bg-[#0c1015] !text-white !p-6 !text-center' }}
      wrapClassName="game-modal-wrap"
    >
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={12}>
          <div className="rounded-md overflow-hidden border border-[#2e303a]">
            <img src={map.splash} alt="" className="w-full h-[220px] object-cover" />
          </div>
          <div className="mt-4 text-left">
            <div 
              className="font-bold text-xs tracking-[1px] uppercase"
              style={{ color: colorPrimary }}
            >
              {isVi ? 'TỌA ĐỘ CHIẾN TRƯỜNG' : 'BATTLEFIELD COORDINATES'}
            </div>
            <p className="text-[#d1d5db] text-sm mt-1.5">
              {isVi ? 'Bản đồ nằm ở vị trí địa lý: ' : 'Map is geographically located at: '}
              {map.coordinates || (isVi ? 'Đang cập nhật' : 'Updating')}
            </p>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 text-center flex flex-col items-center justify-center">
            <div className="text-[#8f9499] text-xs mb-3 font-bold">
              <CompassOutlined /> {isVi ? 'MINIMAP CHUYÊN DỤNG (BẤM ĐỂ PHÓNG TO)' : 'TACTICAL MINIMAP (CLICK TO ZOOM)'}
            </div>
            {map.displayIcon ? (
              <div className="bg-[#080c10] p-2.5 rounded-md border border-[#2e303a]">
                <Image src={map.displayIcon} alt="Minimap" className="max-h-[260px] max-w-full object-contain" />
              </div>
            ) : (
              <div className="py-10" style={{ color: colorPrimary }}>
                {isVi ? 'Bản đồ này không có dữ liệu hình ảnh minimap.' : 'No minimap asset found for this map.'}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  )
}
