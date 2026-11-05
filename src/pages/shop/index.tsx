import { useState, useMemo, useEffect } from 'react'
import { Row, Col, Button, Tag, Input, message } from 'antd'
import {
  ClockCircleOutlined,
  MobileOutlined,
  HeartFilled,
  FireOutlined,
  StarFilled,
  UserOutlined,
  SettingOutlined,
  SyncOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import PageContainer from '../../components/PageContainer'
import DailyShopCard from '../../components/shop/DailyShopCard'
import AppearanceCounterTable from '../../components/shop/AppearanceCounterTable'
import NotificationSettingsModal from '../../components/shop/NotificationSettingsModal'
import RiotAccountModal from '../../components/shop/RiotAccountModal'
import SkinDetailModal from '../../components/weapons/SkinDetailModal'
import Loader from '../../components/Loader'
import { useShop } from '../../context/ShopContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { DailyShopItem } from '../../types/shop'
import { Skin } from '../../types/valorant'
import { parseRiotRedirectUrlOrToken } from '../../services/riotAuthService'

export default function DailyShopPage() {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const {
    dailyShop,
    loading,
    countdown,
    allMatchedFavorites,
    favorites,
    toggleFavorite,
    appearanceCounter,
    eligibleSkins,
    isSimulation,
    currentDateStr,
    riotAccounts,
    activeAccountId,
    setActiveAccountId,
    saveAccount,
    refreshAccountShop,
    refreshAllAccounts,
    isRefreshingAccounts,
  } = useShop()

  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  const [riotAccountModalOpen, setRiotAccountModalOpen] = useState(false)
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null)
  const [activeTab, setActiveTab] = useState('shop')
  const [favSearchQuery, setFavSearchQuery] = useState('')

  // Auto-detect and catch Riot Token when redirecting back to website
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Find the first unconnected account slot or use active account
      const targetSlot =
        riotAccounts.find((a) => !a.accessToken || !a.puuid) ||
        (activeAccountId !== 'all' ? riotAccounts.find((a) => a.id === activeAccountId) : null) ||
        riotAccounts[0]

      if (targetSlot) {
        parseRiotRedirectUrlOrToken(hash, targetSlot.region || 'ap').then((res) => {
          if (res.success && res.account) {
            saveAccount({
              ...targetSlot,
              ...res.account,
              status: 'success',
            })
            message.success(
              isVi
                ? `🎉 Chuyển hướng thành công! Đã tự động kết nối tài khoản [${res.account.gameName || targetSlot.label}]!`
                : `Redirect successful! Account [${res.account.gameName || targetSlot.label}] connected!`,
            )
            // Clear hash from address bar cleanly
            window.history.replaceState(null, '', window.location.pathname)
          }
        })
      }
    }
  }, [riotAccounts, activeAccountId, saveAccount, isVi])

  const favoritedSkinsList = useMemo(() => {
    return eligibleSkins.filter((s) => favorites.includes(s.skinUuid))
  }, [eligibleSkins, favorites])

  const searchedSkins = useMemo(() => {
    if (!favSearchQuery.trim()) return []
    const q = favSearchQuery.toLowerCase()
    return eligibleSkins.filter(
      (s) => s.displayName.toLowerCase().includes(q) || s.weaponName.toLowerCase().includes(q),
    )
  }, [eligibleSkins, favSearchQuery])

  const handleOpenDetails = (item: DailyShopItem) => {
    setSelectedSkin(item.skin)
  }

  if (loading) {
    return <Loader tip={isVi ? 'Đang tải dữ liệu Cửa hàng Hàng ngày...' : 'Loading Daily Shop data...'} />
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs font-black uppercase tracking-[2px] px-2 py-0.5 rounded"
              style={{ backgroundColor: `${colorPrimary}22`, color: colorPrimary }}
            >
              VALORANT // 3 RIOT ACCOUNTS LIVE STORE
            </span>
            {isSimulation && (
              <Tag color="orange" className="!text-[11px] !m-0">
                {isVi ? `Chế độ mô phỏng: ${currentDateStr}` : `Simulation: ${currentDateStr}`}
              </Tag>
            )}
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-black m-0 tracking-wide flex items-center gap-3">
            {isVi ? 'CỬA HÀNG 3 TÀI KHOẢN RIOT' : '3 RIOT ACCOUNTS STORE'}
            <span className="text-sm font-normal text-[#8f9499] border-l border-white/20 pl-3 hidden sm:inline">
              {isVi ? 'Treo kiểm tra cùng lúc & báo về điện thoại' : 'Simultaneous tracking & phone alerts'}
            </span>
          </h1>
        </div>

        {/* Live Countdown Clock & Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Countdown timer */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-white/10 shadow-lg">
            <ClockCircleOutlined style={{ color: colorPrimary }} className="text-lg animate-pulse" />
            <div>
              <div className="text-[10px] text-[#8f9499] uppercase font-mono tracking-wider">
                {isVi ? 'LÀM MỚI SAU' : 'REFRESHES IN'}
              </div>
              <div className="text-white font-mono font-bold text-base tracking-widest">
                {countdown.formatted}
              </div>
            </div>
          </div>

          {/* Action: Manage Riot Accounts */}
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => setRiotAccountModalOpen(true)}
            style={{
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              fontWeight: 'bold',
            }}
            className="!h-10 !text-xs !tracking-wider uppercase"
          >
            {isVi ? '3 Tài Khoản Riot' : '3 Accounts'}
          </Button>

          {/* Action: Phone alerts */}
          <Button
            icon={<MobileOutlined />}
            onClick={() => setNotificationModalOpen(true)}
            style={{
              borderColor: colorPrimary,
              color: colorPrimary,
              fontWeight: 'bold',
            }}
            className="!h-10 !text-xs !tracking-wider uppercase !bg-transparent hover:!bg-white/5"
          >
            {isVi ? 'Báo Điện Thoại' : 'Phone Alerts'}
          </Button>

          {/* Action: Refresh all 3 accounts */}
          <Button
            icon={<SyncOutlined spin={isRefreshingAccounts} />}
            loading={isRefreshingAccounts}
            onClick={refreshAllAccounts}
            className="!h-10 !bg-white/5 !text-white !border-white/10 hover:!border-white/30 !text-xs uppercase"
            title={isVi ? 'Làm mới Cửa hàng cả 3 tài khoản ngay bây giờ' : 'Refresh storefront for all 3 accounts'}
          >
            {isVi ? 'Làm Mới Live' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* 3 ACCOUNTS SWITCHER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/50 border border-white/10 mb-8 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#8f9499] font-mono uppercase mr-1">
            {isVi ? 'Xem Tài Khoản:' : 'View Account:'}
          </span>

          <button
            onClick={() => setActiveAccountId('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              activeAccountId === 'all'
                ? 'bg-red-500 text-white border-red-500 shadow-md'
                : 'bg-white/5 text-[#8f9499] border-white/10 hover:text-white hove  r:border-white/20'
            }`}
          >
            {isVi ? '✦ XEM CẢ 3 TÀI KHOẢN' : '✦ ALL 3 ACCOUNTS'}
          </button>

          {riotAccounts.map((acc, idx) => {
            const isConnected = !!(acc.accessToken && acc.puuid)
            const isSelected = activeAccountId === acc.id
            const vp = acc.wallet?.vp

            return (
              <button
                key={acc.id}
                onClick={() => setActiveAccountId(acc.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white/20 text-white border-white/40 shadow-sm'
                    : 'bg-white/5 text-[#8f9499] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                  }`}
                />
                <span>{acc.gameName ? `${acc.label} (${acc.gameName})` : acc.label || `Acc ${idx + 1}`}</span>
                {vp !== undefined && (
                  <span className="text-amber-400 font-mono text-[11px] bg-black/40 px-1.5 py-0.2 rounded">
                    {vp.toLocaleString()} VP
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setRiotAccountModalOpen(true)}
          className="text-xs text-[#8f9499] hover:text-white flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1"
        >
          <SettingOutlined /> {isVi ? 'Cài đặt tài khoản & Token' : 'Manage Tokens'}
        </button>
      </div>

      {/* SPECIAL ALERT BANNER IF ANY OF THE 3 ACCOUNTS HAS FAVORITE SKINS */}
      <AnimatePresence>
        {allMatchedFavorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-5 rounded-2xl border-2 bg-gradient-to-r from-amber-950/80 via-black/80 to-amber-950/80 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.35)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shrink-0 shadow-lg">
                  <StarFilled />
                </div>
                <div>
                  <div className="text-amber-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <FireOutlined /> {isVi ? 'TIN CỰC VUI! ĐÃ BÁO VỀ ĐIỆN THOẠI CỦA BẠN' : 'JACKPOT ALERT! SENT TO PHONE'}
                  </div>
                  <h3 className="text-white text-lg font-black m-0 mt-0.5">
                    {isVi
                      ? `Phát hiện Skin Yêu Thích trong Cửa hàng của tài khoản Riot!`
                      : `Favorite Skin detected in your Riot Store!`}
                  </h3>
                  <div className="text-amber-200/90 text-xs mt-1 flex flex-col gap-1">
                    {allMatchedFavorites.map((match) => (
                      <div key={match.account.id}>
                        • 👤 <b>{match.account.label}</b> ({match.account.gameName || 'Riot ID'}):{' '}
                        <span className="font-bold text-white">
                          {match.items.map((i) => `${i.displayName} (${i.cost} VP)`).join(', ')}
                        </span>
                        {match.account.wallet?.vp !== undefined && (
                          <span className="text-[#8f9499] ml-2">
                            (Số dư ví: {match.account.wallet.vp.toLocaleString()} VP)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  onClick={() => setNotificationModalOpen(true)}
                  className="!bg-amber-500 !text-black !font-black !border-none !text-xs uppercase hover:!bg-amber-400 shadow-md"
                >
                  <MobileOutlined /> {isVi ? 'Cài Đặt Nhận Báo' : 'Phone Alert Settings'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex p-1 rounded-xl bg-black/60 border border-white/10 shadow-lg">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-[#8f9499] hover:text-white bg-transparent border-none'
            }`}
            style={{ backgroundColor: activeTab === 'shop' ? colorPrimary : undefined }}
          >
            {isVi ? 'Cửa Hàng Hàng Ngày' : 'Daily Store'}
          </button>
          <button
            onClick={() => setActiveTab('counter')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'counter'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-[#8f9499] hover:text-white bg-transparent border-none'
            }`}
            style={{ backgroundColor: activeTab === 'counter' ? colorPrimary : undefined }}
          >
            {isVi ? 'Bộ Đếm & Thống Kê' : 'Appearance Counter'}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-[#8f9499] hover:text-white bg-transparent border-none'
            }`}
            style={{ backgroundColor: activeTab === 'favorites' ? colorPrimary : undefined }}
          >
            <HeartFilled className="text-red-400" />
            {isVi ? `Yêu Thích (${favorites.length})` : `Favorites (${favorites.length})`}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: DAILY SHOP OF THE 3 ACCOUNTS */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-10">
          {activeAccountId === 'all' ? (
            /* VIEW ALL 3 ACCOUNTS SIMULTANEOUSLY */
            riotAccounts.map((account, idx) => {
              const isConnected = !!(account.accessToken && account.puuid)
              const items = account.shop?.items || []

              return (
                <div
                  key={account.id}
                  className="p-6 rounded-2xl bg-white/[0.015] border border-white/5 backdrop-blur-md flex flex-col gap-4 relative"
                >
                  {/* Account Header Banner */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white text-base font-black">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-white text-base font-bold flex items-center gap-2">
                          <span>{account.label}</span>
                          {account.gameName && (
                            <span className="text-[#8f9499] font-normal text-xs">
                              ({account.gameName}#{account.tagLine || 'VN'})
                            </span>
                          )}
                          <Tag
                            color={isConnected ? 'success' : 'default'}
                            className="!text-[10px] !m-0 !font-bold"
                          >
                            {isConnected ? (isVi ? 'LIVE RIOT' : 'CONNECTED') : (isVi ? 'CHƯA KẾT NỐI' : 'DISCONNECTED')}
                          </Tag>
                        </div>
                        <div className="text-[#8f9499] text-xs mt-0.5">
                          {isConnected && account.lastChecked ? (
                            isVi ? `Lần check gần nhất: ${account.lastChecked}` : `Last checked: ${account.lastChecked}`
                          ) : (
                            isVi ? 'Hãy kết nối tài khoản để xem Live Shop thật' : 'Connect account to see live shop'
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Wallet info & Action button */}
                    <div className="flex items-center gap-3">
                      {account.wallet && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                          <WalletOutlined className="text-amber-400" />
                          <span className="text-amber-400 font-bold">{account.wallet.vp.toLocaleString()} VP</span>
                          <span className="text-white/20">|</span>
                          <span className="text-cyan-400 font-bold">{account.wallet.rad} Rad</span>
                        </div>
                      )}

                      {!isConnected ? (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => setRiotAccountModalOpen(true)}
                          style={{ backgroundColor: colorPrimary }}
                        >
                          {isVi ? 'Kết Nối Acc Này' : 'Connect'}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          icon={<SyncOutlined spin={isRefreshingAccounts} />}
                          loading={isRefreshingAccounts}
                          onClick={() => refreshAccountShop(account.id)}
                          className="text-xs"
                        >
                          {isVi ? 'Tải Lại Cửa Hàng' : 'Refresh Store'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {account.lastError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                      <div>⚠️ {account.lastError}</div>
                      <Button
                        size="small"
                        type="primary"
                        danger
                        onClick={() => refreshAccountShop(account.id)}
                        className="text-xs ml-3"
                      >
                        {isVi ? 'Thử Lại' : 'Retry'}
                      </Button>
                    </div>
                  )}

                  {/* Account Daily 4 Skins */}
                  {items.length > 0 ? (
                    <Row gutter={[20, 20]}>
                      {items.map((item) => (
                        <Col xs={24} sm={12} lg={6} key={item.skinUuid}>
                          <DailyShopCard item={item} onOpenDetails={handleOpenDetails} />
                        </Col>
                      ))}
                    </Row>
                  ) : isConnected ? (
                    <div className="py-12 text-center text-[#8f9499] bg-black/30 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                      <p className="text-sm font-bold text-white m-0">
                        {isVi
                          ? `Đã nhận diện tài khoản [${account.gameName || account.label}].`
                          : `Account [${account.gameName || account.label}] connected.`}
                      </p>
                      <p className="text-xs text-[#8f9499] m-0">
                        {isVi
                          ? 'Bấm nút bên dưới để tải trực tiếp 4 skin trong Live Shop từ Riot Games!'
                          : 'Click below to load live store skins!'}
                      </p>
                      <Button
                        type="primary"
                        loading={isRefreshingAccounts}
                        icon={<SyncOutlined spin={isRefreshingAccounts} />}
                        onClick={() => refreshAccountShop(account.id)}
                        style={{ backgroundColor: colorPrimary, fontWeight: 'bold' }}
                      >
                        {isVi ? 'TẢI CỬA HÀNG LIVE NGAY' : 'LOAD LIVE SHOP NOW'}
                      </Button>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-[#8f9499] bg-black/20 rounded-xl border border-dashed border-white/10">
                      <p className="text-sm font-bold text-white m-0">
                        {isVi ? `Tài khoản [${account.label}] chưa có dữ liệu cửa hàng` : 'No store data for this account'}
                      </p>
                      <p className="text-xs text-[#8f9499] mt-1 mb-3">
                        {isVi
                          ? 'Bấm nút "Kết Nối Acc Này" để đăng nhập hoặc dán Token lấy cửa hàng hôm nay!'
                          : 'Login or paste tokens to fetch store!'}
                      </p>
                      <Button
                        type="primary"
                        onClick={() => setRiotAccountModalOpen(true)}
                        style={{ backgroundColor: colorPrimary }}
                      >
                        {isVi ? 'Đăng Nhập Ngay' : 'Login Now'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            /* VIEW SINGLE SELECTED ACCOUNT */
            <div className="flex flex-col gap-6">
              <Row gutter={[24, 24]}>
                {dailyShop?.items.map((item) => (
                  <Col xs={24} sm={12} lg={6} key={item.skinUuid}>
                    <DailyShopCard item={item} onOpenDetails={handleOpenDetails} />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: APPEARANCE COUNTER */}
      {activeTab === 'counter' && <AppearanceCounterTable />}

      {/* TAB CONTENT: FAVORITE SKINS WATCHLIST */}
      {activeTab === 'favorites' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white text-xl font-bold m-0 flex items-center gap-2">
                <HeartFilled className="text-red-500" />
                {isVi ? 'DANH SÁCH SKIN ĐANG THEO DÕI (WATCHLIST)' : 'FAVORITE SKINS WATCHLIST'}
              </h2>
              <p className="text-[#8f9499] text-xs m-0 mt-1">
                {isVi
                  ? 'Khi bất kỳ skin nào trong danh sách này xuất hiện trong Cửa hàng của 1 trong 3 tài khoản, điện thoại sẽ reo chuông báo ngay.'
                  : 'Whenever any skin appears in the shop of any of your 3 accounts, you will be notified on your phone.'}
              </p>
            </div>
          </div>

          {/* Quick search and add any skin in the entire game to watchlist */}
          <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 w-full sm:max-w-md">
                <Input
                  placeholder={
                    isVi
                      ? '🔍 Gõ tên súng để thêm nhanh vào Yêu Thích (vd: Kuronami, Reaver, Prime...)'
                      : 'Search skin name to add to favorites...'
                  }
                  allowClear
                  value={favSearchQuery}
                  onChange={(e) => setFavSearchQuery(e.target.value)}
                  className="!bg-black/60 !border-white/20 !text-white"
                />
              </div>
              <div className="text-xs text-[#8f9499]">
                {isVi ? (
                  <span>
                    💡 <b>Cách thêm:</b> Bạn có thể gõ tìm ở đây, hoặc bấm biểu tượng <b>❤️</b> ở từng thẻ súng trong tab <b>Cửa Hàng Hàng Ngày</b> và <b>Bộ Đếm & Thống Kê</b>.
                  </span>
                ) : (
                  <span>
                    💡 Click ❤️ on any weapon card in Daily Store or Appearance Counter table.
                  </span>
                )}
              </div>
            </div>

            {/* Quick search results dropdown list */}
            {favSearchQuery.trim().length > 0 && (
              <div className="mt-2 p-3 bg-black/90 rounded-lg border border-white/15 max-h-64 overflow-y-auto flex flex-col gap-2">
                {searchedSkins.length === 0 ? (
                  <div className="text-center py-4 text-xs text-[#8f9499]">
                    {isVi ? 'Không tìm thấy skin nào phù hợp' : 'No matching skins found'}
                  </div>
                ) : (
                  searchedSkins.slice(0, 10).map((skinItem) => {
                    const isFav = favorites.includes(skinItem.skinUuid)
                    return (
                      <div
                        key={skinItem.skinUuid}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={skinItem.displayIcon}
                            alt={skinItem.displayName}
                            className="w-16 h-8 object-contain"
                          />
                          <div>
                            <div className="text-white text-xs font-bold">{skinItem.displayName}</div>
                            <div className="text-[10px] text-[#8f9499]">
                              {skinItem.weaponName} • {skinItem.cost} VP
                            </div>
                          </div>
                        </div>
                        <Button
                          size="small"
                          type={isFav ? 'primary' : 'default'}
                          danger={isFav}
                          icon={<HeartFilled />}
                          onClick={() => toggleFavorite(skinItem.skinUuid)}
                          className="text-xs"
                        >
                          {isFav ? (isVi ? 'Đang Yêu Thích' : 'Favorited') : (isVi ? 'Thêm Yêu Thích' : 'Add Favorite')}
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {favoritedSkinsList.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl">
              <HeartFilled className="text-4xl text-white/20 mb-3" />
              <p className="text-white text-sm font-bold m-0">
                {isVi ? 'Bạn chưa thêm skin nào vào danh sách yêu thích' : 'No skins added to favorites yet'}
              </p>
              <p className="text-[#8f9499] text-xs mt-1 mb-4">
                {isVi
                  ? 'Hãy nhấn biểu tượng trái tim ❤️ ở trang Cửa hàng hoặc mục Vũ khí để theo dõi skin bạn muốn mua!'
                  : 'Click the heart icon on any skin to start tracking!'}
              </p>
              <Button type="primary" onClick={() => setActiveTab('shop')} style={{ backgroundColor: colorPrimary }}>
                {isVi ? 'Khám Phá Cửa Hàng Hôm Nay' : 'Browse Today Shop'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoritedSkinsList.map((item) => {
                const matchedAccounts = riotAccounts.filter((a) =>
                  a.shop?.items.some((i) => i.skinUuid === item.skinUuid),
                )
                const record = appearanceCounter[item.skinUuid]
                const count = record?.count || 0

                return (
                  <div
                    key={item.skinUuid}
                    className="p-4 rounded-xl border flex flex-col justify-between bg-white/[0.02] backdrop-blur-md relative"
                    style={{
                      borderColor: matchedAccounts.length > 0 ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                      boxShadow: matchedAccounts.length > 0 ? '0 0 20px rgba(245,158,11,0.3)' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#8f9499] uppercase font-mono">
                        {item.weaponName}
                      </span>
                      {matchedAccounts.length > 0 ? (
                        <Tag color="gold" className="!text-[10px] !m-0">
                          ★ {isVi ? `CÓ Ở ${matchedAccounts.length} ACC` : `IN ${matchedAccounts.length} ACCS`}
                        </Tag>
                      ) : (
                        <span className="text-[10px] text-white/40">
                          {isVi ? 'Chưa ra hôm nay' : 'Not in shop today'}
                        </span>
                      )}
                    </div>

                    <div
                      className="h-28 flex items-center justify-center p-2 cursor-pointer"
                      onClick={() => handleOpenDetails(item)}
                    >
                      <img
                        src={item.displayIcon}
                        alt={item.displayName}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-3">
                      <div className="text-white text-xs font-bold truncate" title={item.displayName}>
                        {item.displayName}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-amber-400 font-bold">
                          {item.cost.toLocaleString()} VP
                        </span>
                        <span className="text-[#8f9499]">
                          {isVi ? `Đã ra: ${count} lần` : `Seen: ${count}x`}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleFavorite(item.skinUuid)}
                        className="w-full mt-2.5 py-1 text-[11px] font-bold uppercase rounded cursor-pointer border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <HeartFilled /> {isVi ? 'Bỏ Theo Dõi' : 'Remove Watch'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Skin Detail Modal */}
      <SkinDetailModal skin={selectedSkin} onClose={() => setSelectedSkin(null)} />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />

      {/* Riot Accounts Management Modal */}
      <RiotAccountModal
        open={riotAccountModalOpen}
        onClose={() => setRiotAccountModalOpen(false)}
      />
    </PageContainer>
  )
}
