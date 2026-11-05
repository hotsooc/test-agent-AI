import { useState, useMemo } from 'react'
import { Input, Button, Tag, Popconfirm, message } from 'antd'
import {
  SearchOutlined,
  FireOutlined,
  CalendarOutlined,
  HeartOutlined,
  HeartFilled,
  ReloadOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useShop } from '../../context/ShopContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

export default function AppearanceCounterTable() {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const {
    appearanceCounter,
    favorites,
    isFavorite,
    toggleFavorite,
    dailyShop,
    simulatePastDays,
    resetCounter,
    currentDateStr,
  } = useShop()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeapon, setSelectedWeapon] = useState('ALL')
  const [sortBy, setSortBy] = useState<'count_desc' | 'count_asc' | 'date_desc' | 'name_asc'>('count_desc')

  const recordsList = useMemo(() => {
    return Object.values(appearanceCounter)
  }, [appearanceCounter])

  const weaponsList = useMemo(() => {
    const set = new Set<string>()
    recordsList.forEach((r) => {
      if (r.weaponName) set.add(r.weaponName)
    })
    return ['ALL', ...Array.from(set)]
  }, [recordsList])

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return recordsList
      .filter((rec) => {
        if (selectedWeapon !== 'ALL' && rec.weaponName !== selectedWeapon) return false
        if (!searchTerm.trim()) return true
        const s = searchTerm.toLowerCase()
        return rec.skinName.toLowerCase().includes(s) || (rec.weaponName && rec.weaponName.toLowerCase().includes(s))
      })
      .sort((a, b) => {
        if (sortBy === 'count_desc') return b.count - a.count
        if (sortBy === 'count_asc') return a.count - b.count
        if (sortBy === 'date_desc') return b.lastSeen.localeCompare(a.lastSeen)
        if (sortBy === 'name_asc') return a.skinName.localeCompare(b.skinName)
        return 0
      })
  }, [recordsList, selectedWeapon, searchTerm, sortBy])

  // Stats calculation
  const totalAppearances = useMemo(() => {
    return recordsList.reduce((acc, cur) => acc + cur.count, 0)
  }, [recordsList])

  const topSkin = useMemo(() => {
    if (recordsList.length === 0) return null
    return [...recordsList].sort((a, b) => b.count - a.count)[0]
  }, [recordsList])

  const todaySkinUuids = useMemo(() => {
    return new Set(dailyShop?.items.map((i) => i.skinUuid) || [])
  }, [dailyShop])

  const handleSimulate14 = () => {
    simulatePastDays(14)
    message.success(isVi ? 'Đã mô phỏng cộng dồn lịch sử 14 ngày qua!' : 'Simulated past 14 days of appearances!')
  }

  const handleSimulate30 = () => {
    simulatePastDays(30)
    message.success(isVi ? 'Đã mô phỏng cộng dồn lịch sử 30 ngày qua!' : 'Simulated past 30 days of appearances!')
  }

  const handleReset = () => {
    resetCounter()
    message.info(isVi ? 'Đã đặt lại dữ liệu bộ đếm!' : 'Appearance counter reset!')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider">
            {isVi ? 'TỔNG SKIN ĐÃ XUẤT HIỆN' : 'UNIQUE SKINS RECORDED'}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {recordsList.length} <span className="text-xs text-[#8f9499] font-normal">{isVi ? 'skin' : 'skins'}</span>
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2">
            {isVi ? `Đã cộng dồn ${totalAppearances} lượt ra shop` : `${totalAppearances} total appearances aggregated`}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <TrophyOutlined className="text-amber-400" />
            {isVi ? 'SKIN RA NHIỀU NHẤT' : 'MOST FREQUENT SKIN'}
          </div>
          <div className="text-base font-bold text-amber-400 mt-1 truncate" title={topSkin?.skinName || 'N/A'}>
            {topSkin ? topSkin.skinName : (isVi ? 'Chưa có' : 'None')}
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2">
            {topSkin ? (isVi ? `Đã xuất hiện ${topSkin.count} lần` : `Appeared ${topSkin.count} times`) : '---'}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <HeartFilled className="text-red-500" />
            {isVi ? 'SKIN YÊU THÍCH ĐÃ RA' : 'FAVORITES SEEN'}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {recordsList.filter((r) => favorites.includes(r.skinUuid)).length} / {favorites.length}
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2">
            {isVi ? 'Skin đang theo dõi đã từng xuất hiện' : 'Tracked skins that have appeared'}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <ThunderboltOutlined style={{ color: colorPrimary }} />
            {isVi ? 'CÔNG CỤ TEST BỘ ĐẾM' : 'COUNTER SIMULATION'}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="small" onClick={handleSimulate14} className="text-xs">
              +14 {isVi ? 'ngày' : 'days'}
            </Button>
            <Button size="small" onClick={handleSimulate30} className="text-xs">
              +30 {isVi ? 'ngày' : 'days'}
            </Button>
            <Popconfirm
              title={isVi ? 'Đặt lại bộ đếm xuất hiện?' : 'Reset appearance counter?'}
              description={isVi ? 'Toàn bộ dữ liệu số lần xuất hiện sẽ được xóa và tính lại từ hôm nay.' : 'All accumulated appearance data will be reset.'}
              onConfirm={handleReset}
              okText={isVi ? 'Đặt lại' : 'Reset'}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
            >
              <Button size="small" danger icon={<ReloadOutlined />} title={isVi ? 'Đặt lại bộ đếm' : 'Reset'}>
                Reset
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/[0.02] border border-white/5 p-4 rounded-xl">
        <div className="flex-1 max-w-md">
          <Input
            placeholder={isVi ? 'Tìm kiếm tên skin hoặc vũ khí...' : 'Search skin or weapon name...'}
            prefix={<SearchOutlined className="text-[#8f9499]" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            className="!bg-black/40 !border-white/10 !text-white"
          />
        </div>

        {/* Sort selector & weapon filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#8f9499]">{isVi ? 'Sắp xếp:' : 'Sort by:'}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="count_desc">{isVi ? 'Số lần ra nhiều nhất ↓' : 'Most appearances ↓'}</option>
            <option value="count_asc">{isVi ? 'Số lần ra ít nhất ↑' : 'Least appearances ↑'}</option>
            <option value="date_desc">{isVi ? 'Gần đây nhất ↓' : 'Most recently seen ↓'}</option>
            <option value="name_asc">{isVi ? 'Tên A - Z' : 'Name A - Z'}</option>
          </select>
        </div>
      </div>

      {/* Weapon Categories Pill Filter */}
      {weaponsList.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {weaponsList.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeapon(w)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                selectedWeapon === w
                  ? 'bg-white/20 text-white border-white/40 shadow-sm'
                  : 'bg-black/40 text-[#8f9499] border-white/5 hover:text-white hover:border-white/20'
              }`}
            >
              {w === 'ALL' ? (isVi ? 'Tất cả vũ khí' : 'All Weapons') : w}
            </button>
          ))}
        </div>
      )}

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 text-[#8f9499] bg-white/[0.01] border border-white/5 rounded-xl">
          <p className="text-sm m-0">
            {isVi ? 'Chưa tìm thấy skin nào phù hợp.' : 'No skins matching current filter.'}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {isVi
              ? 'Hãy thử bấm nút "+14 ngày" hoặc "+30 ngày" ở trên để mô phỏng dữ liệu lịch sử phong phú!'
              : 'Try clicking "+14 days" or "+30 days" above to populate historical simulation!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredRecords.map((rec) => {
            const isFav = isFavorite(rec.skinUuid)
            const isToday = todaySkinUuids.has(rec.skinUuid)
            const isRecentlySeenToday = rec.lastSeen === currentDateStr

            return (
              <div
                key={rec.skinUuid}
                className="bg-white/[0.02] border hover:border-white/20 transition-all rounded-xl p-3.5 flex flex-col justify-between relative group"
                style={{
                  borderColor: isToday ? '#f59e0b' : isFav ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.07)',
                  boxShadow: isToday ? '0 0 15px rgba(245, 158, 11, 0.2)' : undefined,
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rec.weaponName && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#8f9499]">
                        {rec.weaponName}
                      </span>
                    )}
                    {isToday && (
                      <Tag color="gold" className="!text-[10px] !m-0 !px-1.5">
                        ★ {isVi ? 'HÔM NAY CÓ' : 'IN SHOP TODAY'}
                      </Tag>
                    )}
                  </div>

                  {/* Favorite toggle button */}
                  <button
                    onClick={() => toggleFavorite(rec.skinUuid)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
                      isFav
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-black/40 text-white/40 hover:text-red-400 border-white/10'
                    }`}
                    title={isFav ? (isVi ? 'Đang theo dõi' : 'Favorited') : (isVi ? 'Thêm vào yêu thích' : 'Favorite')}
                  >
                    {isFav ? <HeartFilled className="text-xs" /> : <HeartOutlined className="text-xs" />}
                  </button>
                </div>

                {/* Gun Icon & Name */}
                <div className="flex items-center gap-3 my-2">
                  <div className="w-16 h-12 bg-black/40 border border-white/5 rounded flex items-center justify-center p-1 shrink-0">
                    <img
                      src={rec.skinIcon || ''}
                      alt={rec.skinName}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-bold truncate" title={rec.skinName}>
                      {rec.skinName}
                    </div>
                    <div className="text-[11px] text-[#8f9499] flex items-center gap-1 mt-0.5">
                      <CalendarOutlined className="text-[10px]" />
                      <span>{isRecentlySeenToday ? (isVi ? 'Hôm nay' : 'Today') : rec.lastSeen}</span>
                    </div>
                  </div>
                </div>

                {/* Counter row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1 text-xs">
                  <span className="text-[#8f9499] flex items-center gap-1 text-[11px]">
                    <FireOutlined className="text-amber-400" />
                    {isVi ? 'Xuất hiện cộng dồn:' : 'Appearances:'}
                  </span>
                  <span className="font-extrabold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-xs">
                    {rec.count} {isVi ? 'lần' : 'times'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
