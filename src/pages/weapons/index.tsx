import { useState, useEffect, useCallback } from 'react'
import { Row, Col } from 'antd'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { getWeapons } from '../../api/valorant'
import { getCsgoWeapons } from '../../api/csgo'
import { Weapon } from '../../types/valorant'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import WeaponCard from '../../components/weapons/WeaponCard'
import WeaponDetailModal from '../../components/weapons/WeaponDetailModal'

const categoryMap: Record<string, string> = {
  Rifle: 'Súng trường',
  Heavy: 'Hạng nặng',
  Shotgun: 'Súng shotgun',
  Sidearm: 'Súng lục',
  Sniper: 'Bắn tỉa',
  SMG: 'Súng tiểu liên',
  Melee: 'Cận chiến',
}

function getCatDisplayName(cat: string, isVi: boolean) {
  if (cat === 'ALL') return isVi ? 'Tất cả' : 'All'
  return isVi ? (categoryMap[cat] || cat) : cat
}

const categories = ['ALL', 'Sidearm', 'SMG', 'Rifle', 'Sniper', 'Shotgun', 'Heavy', 'Melee']

export default function Weapons() {
  const { language, isVi } = useLanguage()
  const { isValorant, colorPrimary } = useGame()
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)

  useEffect(() => {
    setLoading(true)
    setSelectedCategory('ALL') // Reset category on game change
    const fetchWeapons = isValorant ? getWeapons(language) : getCsgoWeapons(language)

    fetchWeapons
      .then((data) => setWeapons(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [language, isValorant])

  const filteredWeapons = weapons.filter((weapon) => {
    if (selectedCategory === 'ALL') return true
    const shortCategory = weapon.category.split('::').pop() || ''
    return shortCategory === selectedCategory
  })

  const handleOpenDetails = useCallback((weapon: Weapon) => setSelectedWeapon(weapon), [])
  const handleCloseDetails = useCallback(() => setSelectedWeapon(null), [])

  if (loading) return <Loader tip={isVi ? (isValorant ? 'Đang tải danh sách Vũ khí...' : 'Đang tải vũ khí CS:GO 2...') : 'Loading Weapons data...'} />
  if (!weapons.length) return <PageContainer><div className="text-center text-[#8f9499] py-20">{isVi ? 'Không có dữ liệu vũ khí.' : 'No weapon data available.'}</div></PageContainer>

  return (
    <PageContainer>
      <div className="text-left mb-8">
        <h2 className="tracking-[2px] text-sm font-bold m-0 mb-1" style={{ color: colorPrimary }}>
          {isVi 
            ? (isValorant ? 'VALORANT VŨ KHÍ' : 'CS:GO 2 VŨ KHÍ') 
            : (isValorant ? 'VALORANT WEAPONS' : 'CS:GO 2 WEAPONS')}
        </h2>
        <h1 className="text-white m-0 text-[36px] font-bold">
          {isVi ? 'KHO VŨ KHÍ & SKINS' : 'WEAPONS & SKINS'}
        </h1>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 text-xs font-bold tracking-[1px] uppercase rounded border-none cursor-pointer transition-all duration-300 ${
              selectedCategory === cat
                ? 'text-white'
                : 'bg-[rgba(15,25,35,0.65)] text-white/70 hover:text-white hover:bg-[rgba(15,25,35,0.9)] border border-white/5'
            }`}
            style={{
              backgroundColor: selectedCategory === cat ? colorPrimary : undefined,
              boxShadow: selectedCategory === cat ? `0 0 10px ${colorPrimary}40` : undefined,
            }}
          >
            {getCatDisplayName(cat, isVi)}
          </button>
        ))}
      </div>

      <Row gutter={[24, 24]}>
        {filteredWeapons.map((weapon) => (
          <Col xs={24} sm={12} md={8} key={weapon.uuid}>
            <WeaponCard weapon={weapon} onClick={() => handleOpenDetails(weapon)} />
          </Col>
        ))}
      </Row>

      {filteredWeapons.length === 0 && selectedCategory !== 'ALL' && (
        <div className="text-center text-[#555c64] py-12 text-sm">
          {isVi ? 'Không có vũ khí nào trong danh mục này.' : 'No weapons found in this category.'}
        </div>
      )}

      <WeaponDetailModal weapon={selectedWeapon} open={selectedWeapon !== null} onClose={handleCloseDetails} />
    </PageContainer>
  )
}
