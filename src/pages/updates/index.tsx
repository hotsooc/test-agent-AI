import { motion } from 'framer-motion'
import { Timeline, Card, Tag, Collapse } from 'antd'
import { CaretRightOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { patchData, PatchNote } from '../../data/patchNotes'
import { csgoPatchNotes } from '../../data/csgoData'
import PageContainer from '../../components/PageContainer'

const { Panel } = Collapse

function getTagColor(type: 'buff' | 'nerf' | 'adjust') {
  switch (type) {
    case 'buff': return '#52c41a'
    case 'nerf': return '#ff4d4f'
    case 'adjust': return '#1890ff'
  }
}

function getTagName(type: 'buff' | 'nerf' | 'adjust', isVi: boolean) {
  if (isVi) {
    switch (type) {
      case 'buff': return 'Tăng sức mạnh'
      case 'nerf': return 'Giảm sức mạnh'
      case 'adjust': return 'Điều chỉnh'
    }
  }
  switch (type) {
    case 'buff': return 'Buff'
    case 'nerf': return 'Nerf'
    case 'adjust': return 'Adjustment'
  }
}

export default function Updates() {
  const { isVi } = useLanguage()
  const { isValorant, colorPrimary } = useGame()

  const currentPatchData = isValorant ? patchData : csgoPatchNotes

  return (
    <PageContainer>
      <div className="text-left mb-10" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="tracking-[2px] text-sm font-bold m-0 mb-1" style={{ color: colorPrimary }}>
          {isValorant ? 'VALORANT PATCH NOTES' : 'CS:GO 2 PATCH NOTES'}
        </h2>
        <h1 className="text-white m-0 text-[36px] font-bold">
          {isVi ? 'BẢN CẬP NHẬT GAME' : 'GAME PATCH UPDATES'}
        </h1>
        <p className="text-[#8f9499] text-sm mt-2.5 max-w-[700px] leading-relaxed">
          {isVi
            ? isValorant
              ? 'Theo dõi nhật ký các bản cập nhật game, chi tiết điều chỉnh sức mạnh các Đặc vụ, cân bằng thông số vũ khí và thay đổi bản đồ mới nhất.'
              : 'Theo dõi nhật ký các bản cập nhật game, chi tiết điều chỉnh thông số súng, cân bằng hệ thống lựu đạn khói lửa và thay đổi bản đồ CS:GO 2 mới nhất.'
            : isValorant
              ? 'Keep track of game update logs, balancing notes for agents abilities, weapons adjustments, and map changes.'
              : 'Keep track of CS:GO 2 update logs, grenade volume mechanics, weapon recoil adjustments, and map pool rotations.'}
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Timeline mode="left">
          {currentPatchData.map((patch: PatchNote, patchIdx: number) => (
            <Timeline.Item
              key={patch.version}
              label={
                <div className="pr-3 text-right">
                  <span className="font-bold text-lg block" style={{ color: colorPrimary }}>{patch.version}</span>
                  <span className="text-[#555c64] text-xs font-mono">{patch.date}</span>
                </div>
              }
              dot={<div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: colorPrimary, boxShadow: `0 0 10px ${colorPrimary}` }} />}
              className="!pb-[30px]"
            >
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: patchIdx * 0.15 }}>
                <Card
                  bordered={false}
                  className="!bg-[rgba(15,25,35,0.65)] !border !rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  style={{ borderColor: `${colorPrimary}1a` }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-center gap-2 mb-3.5 text-[13px]" style={{ color: `${colorPrimary}cc` }}>
                    <InfoCircleOutlined />
                    <span>{isVi ? patch.summary : patch.summaryEn}</span>
                  </div>

                  <Collapse
                    bordered={false}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: colorPrimary }} />}
                    className="!bg-transparent"
                  >
                    {patch.changes.map((change, changeIdx) => (
                      <Panel
                        header={
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <Tag color="black" className="!border !border-white/10 !text-[#8f9499] !uppercase !text-[10px] !font-bold">
                              {isVi ? change.categoryLabel : change.categoryLabelEn}
                            </Tag>
                            <span style={{ color: getTagColor(change.type) }} className="text-[11px] font-bold uppercase tracking-[0.5px]">
                              [{getTagName(change.type, isVi)}]
                            </span>
                            <span className="text-white font-bold text-sm">
                              {isVi ? change.title : change.titleEn}
                            </span>
                          </div>
                        }
                        key={changeIdx}
                        className="!bg-white/[0.02] !mb-2.5 !border !border-white/[0.04] !rounded !overflow-hidden updates-collapse-header"
                      >
                        <ul className="pl-5 m-0 text-[#d1d5db] text-[13px] leading-[1.8]">
                          {(isVi ? change.details : change.detailsEn).map((detail, dIdx) => (
                            <li key={dIdx} className="mb-1">{detail}</li>
                          ))}
                        </ul>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              </motion.div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </PageContainer>
  )
}
