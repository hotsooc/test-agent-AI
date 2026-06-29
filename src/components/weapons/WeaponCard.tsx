import { motion } from 'framer-motion'
import { Card, Tag } from 'antd'
import { Weapon } from '../../types/valorant'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

const categoryMap: Record<string, string> = {
  Rifle: 'Súng trường',
  Heavy: 'Hạng nặng',
  Shotgun: 'Súng shotgun',
  Sidearm: 'Súng lục',
  Sniper: 'Bắn tỉa',
  SMG: 'Súng tiểu liên',
  Melee: 'Cận chiến',
}

function getCatName(category: string | null | undefined, isVi: boolean) {
  if (!category) return isVi ? 'Cận chiến' : 'Melee'
  const name = category.split('::').pop() || ''
  return isVi ? (categoryMap[name] || name) : name
}

export default function WeaponCard({ weapon, onClick }: { weapon: Weapon; onClick: () => void }) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()

  return (
    <Card
      hoverable
      onClick={onClick}
      className="!bg-[rgba(15,25,35,0.75)] !border !rounded-lg !h-full !flex !flex-col !justify-between"
      style={{ borderColor: `${colorPrimary}26` }}
      styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
    >
      <div className="min-h-[110px] flex items-center justify-center mb-5">
        <motion.img
          src={weapon.displayIcon}
          alt={weapon.displayName}
          className="w-full max-h-[100px] object-contain"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        />
      </div>

      <div>
        <div className="border-t border-white/5 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-white tracking-[0.5px]">{weapon.displayName.toUpperCase()}</span>
          <Tag 
            className="border-none text-[10px] uppercase font-bold text-white"
            style={{ backgroundColor: colorPrimary }}
          >
            {getCatName(weapon.shopData?.category, isVi)}
          </Tag>
        </div>

        {weapon.weaponStats && (
          <div className="flex gap-4 mt-3 text-[#8f9499] text-xs">
            <span>{isVi ? 'Băng đạn: ' : 'Magazine: '}<strong className="text-white">{weapon.weaponStats.magazineSize}</strong> {isVi ? 'viên' : 'rds'}</span>
            <span>{isVi ? 'Tốc bắn: ' : 'Fire rate: '}<strong className="text-white">{weapon.weaponStats.fireRate}</strong>/s</span>
          </div>
        )}
      </div>
    </Card>
  )
}
