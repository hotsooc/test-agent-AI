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
import { SkinAppearanceRecord } from '../../types/shop'

export default function AppearanceCounterTable() {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const {
    appearanceCounter,
    isFavorite,
    toggleFavorite,
    dailyShop,
    simulatePastDays,
    resetCounter,
    currentDateStr,
    riotAccounts,
  } = useShop()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeapon, setSelectedWeapon] = useState('ALL')
  const [selectedAccFilter, setSelectedAccFilter] = useState<string>('all')
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

  // Helper to get count for a specific account with backward compatibility
  const getAccCount = (rec: SkinAppearanceRecord, accId: string): number => {
    if (rec.accountCounts && rec.accountCounts[accId] !== undefined) {
      return rec.accountCounts[accId]
    }
    // Backward compatibility: if no accountCounts, attribute to acc-1
    return accId === 'acc-1' ? rec.count : 0
  }

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return recordsList
      .filter((rec) => {
        if (selectedAccFilter !== 'all') {
          const accCount = getAccCount(rec, selectedAccFilter)
          if (accCount === 0) return false
        }
        if (selectedWeapon !== 'ALL' && rec.weaponName !== selectedWeapon) return false
        if (!searchTerm.trim()) return true
        const s = searchTerm.toLowerCase()
        return rec.skinName.toLowerCase().includes(s) || (rec.weaponName && rec.weaponName.toLowerCase().includes(s))
      })
      .sort((a, b) => {
        const aCount = selectedAccFilter === 'all' ? a.count : getAccCount(a, selectedAccFilter)
        const bCount = selectedAccFilter === 'all' ? b.count : getAccCount(b, selectedAccFilter)
        if (sortBy === 'count_desc') return bCount - aCount
        if (sortBy === 'count_asc') return aCount - bCount
        if (sortBy === 'date_desc') return b.lastSeen.localeCompare(a.lastSeen)
        if (sortBy === 'name_asc') return a.skinName.localeCompare(b.skinName)
        return 0
      })
  }, [recordsList, selectedWeapon, searchTerm, sortBy, selectedAccFilter])

  // Count unique skins per account for filter tabs
  const accountSkinCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recordsList.length }
    riotAccounts.forEach((acc) => {
      counts[acc.id] = recordsList.filter((r) => getAccCount(r, acc.id) > 0).length
    })
    return counts
  }, [recordsList, riotAccounts])

  // Active filter label
  const currentAccLabel = useMemo(() => {
    if (selectedAccFilter === 'all') return isVi ? 'Tổng hợp 3 tài khoản' : 'All 3 accounts'
    const acc = riotAccounts.find((a) => a.id === selectedAccFilter)
    return acc ? (acc.gameName ? `${acc.label} (${acc.gameName})` : acc.label) : selectedAccFilter
  }, [selectedAccFilter, riotAccounts, isVi])

  // Stats calculation based on current filter
  const totalAppearances = useMemo(() => {
    return filteredRecords.reduce((acc, cur) => {
      const c = selectedAccFilter === 'all' ? cur.count : getAccCount(cur, selectedAccFilter)
      return acc + c
    }, 0)
  }, [filteredRecords, selectedAccFilter])

  const topSkin = useMemo(() => {
    if (filteredRecords.length === 0) return null
    return [...filteredRecords].sort((a, b) => {
      const aC = selectedAccFilter === 'all' ? a.count : getAccCount(a, selectedAccFilter)
      const bC = selectedAccFilter === 'all' ? b.count : getAccCount(b, selectedAccFilter)
      return bC - aC
    })[0]
  }, [filteredRecords, selectedAccFilter])

  const todaySkinUuids = useMemo(() => {
    return new Set(dailyShop?.items.map((i) => i.skinUuid) || [])
  }, [dailyShop])

  const handleSimulate14 = () => {
    simulatePastDays(14)
    message.success(isVi ? 'Đã mô phỏng cộng dồn lịch sử 14 ngày qua cho cả 3 tài khoản!' : 'Simulated past 14 days of appearances across all 3 accounts!')
  }

  const handleSimulate30 = () => {
    simulatePastDays(30)
    message.success(isVi ? 'Đã mô phỏng cộng dồn lịch sử 30 ngày qua cho cả 3 tài khoản!' : 'Simulated past 30 days of appearances across all 3 accounts!')
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
            {isVi ? 'SKIN ĐÃ RA THEO BỘ LỌC' : 'SKINS IN ACTIVE FILTER'}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {filteredRecords.length} <span className="text-xs text-[#8f9499] font-normal">{isVi ? 'skin' : 'skins'}</span>
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2 truncate" title={currentAccLabel}>
            {isVi ? `Đang xem: ${currentAccLabel}` : `Viewing: ${currentAccLabel}`}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <FireOutlined className="text-amber-400" />
            {isVi ? 'TỔNG LƯỢT XUẤT HIỆN' : 'TOTAL APPEARANCES'}
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {totalAppearances} <span className="text-xs text-[#8f9499] font-normal">{isVi ? 'lượt' : 'times'}</span>
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2">
            {isVi ? 'Cộng dồn theo bộ lọc đang chọn' : 'Accumulated appearances for active filter'}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <TrophyOutlined className="text-amber-400" />
            {isVi ? 'SKIN RA NHIỀU NHẤT' : 'TOP APPEARING SKIN'}
          </div>
          <div className="text-base font-bold text-amber-400 mt-1 truncate" title={topSkin?.skinName || 'N/A'}>
            {topSkin ? topSkin.skinName : (isVi ? 'Chưa có' : 'None')}
          </div>
          <div className="text-[11px] text-[#8f9499] mt-2">
            {topSkin
              ? isVi
                ? `Đã ra ${selectedAccFilter === 'all' ? topSkin.count : getAccCount(topSkin, selectedAccFilter)} lần`
                : `Appeared ${selectedAccFilter === 'all' ? topSkin.count : getAccCount(topSkin, selectedAccFilter)} times`
              : '---'}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[#8f9499] text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
            <ThunderboltOutlined style={{ color: colorPrimary }} />
            {isVi ? 'CÔNG CỤ TEST 3 ACC' : 'TEST SIMULATION (3 ACCS)'}
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

      {/* 3 ACCOUNTS COUNTER FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/10">
        <span className="text-xs text-[#8f9499] font-mono uppercase mr-1">
          {isVi ? 'Chia đếm theo tài khoản:' : 'Filter by Account:'}
        </span>
        <button
          onClick={() => setSelectedAccFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
            selectedAccFilter === 'all'
              ? 'bg-red-500 text-white border-red-500 shadow-md'
              : 'bg-white/5 text-[#8f9499] border-white/10 hover:text-white hover:border-white/20'
          }`}
        >
          <span>{isVi ? '✦ TỔNG HỢP 3 TÀI KHOẢN' : '✦ ALL 3 ACCOUNTS'}</span>
          <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded font-mono">
            {accountSkinCounts['all'] || 0}
          </span>
        </button>

        {riotAccounts.map((acc, aIdx) => {
          const skinCount = accountSkinCounts[acc.id] || 0
          const isSelected = selectedAccFilter === acc.id
          return (
            <button
              key={acc.id}
              onClick={() => setSelectedAccFilter(acc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-white/20 text-white border-white/40 shadow-sm'
                  : 'bg-white/5 text-[#8f9499] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{acc.label || `Acc ${aIdx + 1}`} {acc.gameName ? `(${acc.gameName})` : ''}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isSelected ? 'bg-black/60 text-amber-300' : 'bg-black/40 text-white/60'
              }`}>
                {skinCount}
              </span>
            </button>
          )
        })}
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

        {/* Sort selector */}
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
              ? 'Hãy thử bấm nút "+14 ngày" hoặc "+30 ngày" ở trên để mô phỏng dữ liệu lịch sử phong phú cho cả 3 tài khoản!'
              : 'Try clicking "+14 days" or "+30 days" above to populate historical simulation!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredRecords.map((rec) => {
            const isFav = isFavorite(rec.skinUuid)
            const isToday = todaySkinUuids.has(rec.skinUuid)
            const isRecentlySeenToday = rec.lastSeen === currentDateStr
            const displayCount = selectedAccFilter === 'all' ? rec.count : getAccCount(rec, selectedAccFilter)

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

                {/* Multi-Account Counter Section */}
                <div className="pt-2 border-t border-white/5 mt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8f9499] flex items-center gap-1 text-[11px]">
                      <FireOutlined className="text-amber-400" />
                      {selectedAccFilter === 'all'
                        ? isVi ? 'Tổng 3 tài khoản:' : 'All 3 accounts:'
                        : isVi ? 'Tài khoản này:' : 'This account:'}
                    </span>
                    <span className="font-extrabold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-xs">
                      {displayCount} {isVi ? 'lần' : 'times'}
                    </span>
                  </div>

                  {/* 3 Accounts Breakdown Badges */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {riotAccounts.map((acc, aIdx) => {
                      const countForAcc = getAccCount(rec, acc.id)
                      const isCurrentFiltered = selectedAccFilter === acc.id
                      const shortLabel = acc.gameName || acc.label?.replace(/Tài khoản \d+ \((.*?)\)/, '$1') || `Acc ${aIdx + 1}`

                      return (
                        <span
                          key={acc.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded border transition-all flex items-center gap-1 ${
                            countForAcc > 0
                              ? isCurrentFiltered
                                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold'
                                : 'bg-white/5 border-white/10 text-white/80'
                              : 'bg-black/20 border-white/5 text-white/30'
                          }`}
                          title={`${acc.label || `Acc ${aIdx + 1}`}: ${countForAcc} lần`}
                        >
                          <span className="text-white/40">#{aIdx + 1}</span>
                          <span className="truncate max-w-[55px]">{shortLabel}</span>
                          <span className={countForAcc > 0 ? 'text-amber-400 font-bold' : 'text-white/30'}>
                            {countForAcc}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
