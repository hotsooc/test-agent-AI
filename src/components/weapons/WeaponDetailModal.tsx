import { useState } from 'react'
import { Modal, Row, Col, Progress, Table, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Weapon, Skin } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import SkinCard from './SkinCard'
import SkinDetailModal from './SkinDetailModal'

export default function WeaponDetailModal({
  weapon,
  open,
  onClose,
}: {
  weapon: Weapon | null
  open: boolean
  onClose: () => void
}) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const [activeSkin, setActiveSkin] = useState<Skin | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const damageColumns = [
    { title: isVi ? 'Cự ly (m)' : 'Range (m)', dataIndex: 'range', key: 'range', width: '30%' },
    { title: 'Head', dataIndex: 'head', key: 'head', width: '23%', render: (val: number) => <span className="font-bold" style={{ color: colorPrimary }}>{Math.round(val)}</span> },
    { title: 'Body', dataIndex: 'body', key: 'body', width: '23%', render: (val: number) => <span className="text-white">{Math.round(val)}</span> },
    { title: 'Leg', dataIndex: 'leg', key: 'leg', width: '24%', render: (val: number) => <span className="text-[#8f9499]">{Math.round(val)}</span> },
  ]

  const getDamageData = (w: Weapon) => {
    if (!w.weaponStats?.damageRanges) return []
    return w.weaponStats.damageRanges.map((range, idx) => ({
      key: idx,
      range: `${range.rangeStartMeters}-${range.rangeEndMeters}m`,
      head: range.headDamage,
      body: range.bodyDamage,
      leg: range.legDamage,
    }))
  }

  const filteredSkins = () => {
    if (!weapon) return []
    return (weapon.skins || []).filter(
      (skin) => skin.displayIcon && skin.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const selectSkin = (skin: Skin) => {
    setActiveSkin(skin)
  }

  if (!weapon) return null

  return (
    <>
      <Modal
        title={
          <div className="text-white">
            <span className="text-[22px] font-bold tracking-[1px]">{weapon.displayName.toUpperCase()}</span>
            <span 
              className="text-xs ml-3 uppercase border-l-2 border-[#2e303a] pl-3"
              style={{ color: colorPrimary }}
            >
              {isVi ? 'KHO LƯU TRỮ VŨ KHÍ' : 'WEAPON ARSENAL'}
            </span>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={950}
        classNames={{ body: '!bg-[#0c1015] !text-white !max-h-[80vh] !overflow-y-auto !p-6' }}
        wrapClassName="game-modal-wrap"
        style={{ top: 40 }}
      >
        <div>
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={12}>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 h-full">
                <div 
                  className="font-bold text-sm tracking-[1px] mb-4"
                  style={{ color: colorPrimary }}
                >
                  {isVi ? 'THÔNG SỐ SÚNG' : 'WEAPON STATISTICS'}
                </div>
                {weapon.weaponStats ? (
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <div className="flex justify-between mb-1 text-[13px]">
                        <span>{isVi ? 'Cỡ băng đạn:' : 'Magazine size:'}</span>
                        <span className="text-white font-bold">{weapon.weaponStats.magazineSize} {isVi ? 'viên' : 'rounds'}</span>
                      </div>
                      <Progress percent={(weapon.weaponStats.magazineSize / 100) * 100} showInfo={false} strokeColor={colorPrimary} trailColor="#2e303a" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-[13px]">
                        <span>{isVi ? 'Tốc độ bắn:' : 'Fire rate:'}</span>
                        <span className="text-white font-bold">{weapon.weaponStats.fireRate} {isVi ? 'viên/giây' : 'rounds/sec'}</span>
                      </div>
                      <Progress percent={(weapon.weaponStats.fireRate / 20) * 100} showInfo={false} strokeColor={colorPrimary} trailColor="#2e303a" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-[13px]">
                        <span>{isVi ? 'Độ xuyên thấu:' : 'Wall penetration:'}</span>
                        <span className="text-white font-bold">
                          {weapon.weaponStats.wallPenetration?.split('::').pop() || (isVi ? 'Không' : 'None')}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span>{isVi ? 'Tốc chạy:' : 'Run speed:'}</span>
                      <span className="text-white font-bold">{weapon.weaponStats.runSpeedMultiplier?.toFixed(2)}x</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[#8f9499] text-center py-5">
                    {isVi ? 'Vũ khí cận chiến không có chỉ số bắn súng.' : 'Melee weapons do not have ranged statistics.'}
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 h-full">
                <div 
                  className="font-bold text-sm tracking-[1px] mb-4"
                  style={{ color: colorPrimary }}
                >
                  {isVi ? 'BẢN G SÁT THƯƠNG CHI TIẾT' : 'DETAILED DAMAGE TABLE'}
                </div>
                {weapon.weaponStats?.damageRanges ? (
                  <Table
                    dataSource={getDamageData(weapon)}
                    columns={damageColumns}
                    pagination={false}
                    size="small"
                    className="!bg-transparent"
                    rowClassName={() => 'custom-table-row'}
                  />
                ) : (
                  <div className="text-[#8f9499] text-center py-5">
                    {isVi ? 'Sát thương cận chiến: Trực diện: 50 / Sau lưng: 150' : 'Melee damage: Front: 50 / Backstab: 150'}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#2e303a] pb-2">
              <span 
                className="font-bold text-sm tracking-[1px]"
                style={{ color: colorPrimary }}
              >
                {isVi ? 'BỘ SƯU TẬP SKINS VŨ KHÍ' : 'WEAPON SKINS COLLECTION'} ({filteredSkins().length})
              </span>
              <div className="w-[220px]">
                <Input
                  placeholder={isVi ? 'Tìm kiếm skin...' : 'Search skins...'}
                  prefix={<SearchOutlined style={{ color: colorPrimary }} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!bg-[rgba(15,25,35,0.8)] !border !border-[#2e303a] !text-white"
                />
              </div>
            </div>

            <Row gutter={[16, 16]}>
              {filteredSkins().map((skin) => (
                <Col xs={12} sm={8} md={6} key={skin.uuid}>
                  <SkinCard skin={skin} onClick={() => selectSkin(skin)} />
                </Col>
              ))}
              {filteredSkins().length === 0 && (
                <Col span={24}>
                  <div className="text-[#555c64] text-center py-10 text-[13px]">
                    {isVi ? 'Không tìm thấy skin nào.' : 'No skins found.'}
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </div>
      </Modal>

      <SkinDetailModal skin={activeSkin} onClose={() => setActiveSkin(null)} />
    </>
  )
}
