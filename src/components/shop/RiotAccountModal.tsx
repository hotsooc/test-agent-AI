import { useState } from 'react'
import { Modal, Tabs, Input, Button, Select, Tag, message, Alert } from 'antd'
import {
  UserOutlined,
  KeyOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useShop } from '../../context/ShopContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { RiotAccount, RiotRegion } from '../../types/shop'
import {
  authenticateRiotUser,
  parseRiotRedirectUrlOrToken,
  RIOT_AUTH_URL,
} from '../../services/riotAuthService'

interface RiotAccountModalProps {
  open: boolean
  onClose: () => void
}

export default function RiotAccountModal({ open, onClose }: RiotAccountModalProps) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const { riotAccounts, saveAccount, refreshAllAccounts, isRefreshingAccounts } = useShop()

  const [selectedAccountId, setSelectedAccountId] = useState<string>(riotAccounts[0]?.id || 'acc-1')
  const [authMode, setAuthMode] = useState<'official' | 'login' | 'token'>('official')

  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [region, setRegion] = useState<RiotRegion>('ap')
  const [label, setLabel] = useState('')

  // 1-Click Official Web login input
  const [redirectUrlInput, setRedirectUrlInput] = useState('')
  const [parsingUrl, setParsingUrl] = useState(false)

  // Manual token states
  const [manualPuuid, setManualPuuid] = useState('')
  const [manualAccessToken, setManualAccessToken] = useState('')
  const [manualEntitlements, setManualEntitlements] = useState('')

  const [loggingIn, setLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const currentAccount = riotAccounts.find((a) => a.id === selectedAccountId) || riotAccounts[0]

  const handleSelectAccountTab = (accId: string) => {
    setSelectedAccountId(accId)
    const acc = riotAccounts.find((a) => a.id === accId)
    if (acc) {
      setLabel(acc.label)
      setRegion(acc.region || 'ap')
      setUsername(acc.username || '')
      setManualPuuid(acc.puuid || '')
      setManualAccessToken(acc.accessToken || '')
      setManualEntitlements(acc.entitlementsToken || '')
    }
    setRedirectUrlInput('')
    setLoginError(null)
  }

  // Xử lý kết nối qua Link Riot 1-Click
  const handleParseRedirectUrl = async () => {
    if (!redirectUrlInput.trim()) {
      message.error(isVi ? 'Vui lòng dán link chuyển hướng hoặc chuỗi Access Token!' : 'Please paste the redirect URL or Token!')
      return
    }

    setParsingUrl(true)
    setLoginError(null)

    try {
      const res = await parseRiotRedirectUrlOrToken(redirectUrlInput.trim(), region)
      if (res.success && res.account) {
        const updated: RiotAccount = {
          id: currentAccount.id,
          label: label.trim() || currentAccount.label,
          region,
          puuid: res.account.puuid || '',
          accessToken: res.account.accessToken || '',
          entitlementsToken: res.account.entitlementsToken || '',
          gameName: res.account.gameName || 'Riot Player',
          tagLine: res.account.tagLine || '',
          status: 'success',
        }
        saveAccount(updated)
        message.success(
          isVi
            ? `Đã kết nối thành công tài khoản [${updated.gameName || updated.label}]!`
            : `Connected successfully!`,
        )
        setRedirectUrlInput('')
      } else {
        setLoginError(res.error || (isVi ? 'Link hoặc Token không hợp lệ.' : 'Invalid URL or Token.'))
      }
    } catch (err: any) {
      setLoginError(err.message || 'Lỗi khi trích xuất thông tin')
    } finally {
      setParsingUrl(false)
    }
  }

  // Xử lý đăng nhập username/password trực tiếp
  const handleLoginSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      message.error(isVi ? 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' : 'Please enter username and password!')
      return
    }

    setLoggingIn(true)
    setLoginError(null)

    try {
      const res = await authenticateRiotUser(username.trim(), password, region)
      if (res.success && res.account) {
        const updated: RiotAccount = {
          id: currentAccount.id,
          label: label.trim() || currentAccount.label,
          username: username.trim(),
          region,
          puuid: res.account.puuid || '',
          accessToken: res.account.accessToken || '',
          entitlementsToken: res.account.entitlementsToken || '',
          gameName: res.account.gameName || username,
          tagLine: res.account.tagLine || '',
          expiresAt: res.account.expiresAt,
          status: 'success',
        }
        saveAccount(updated)
        message.success(
          isVi
            ? `Đăng nhập thành công tài khoản [${updated.gameName || updated.label}]!`
            : `Logged in successfully!`,
        )
      } else {
        setLoginError(res.error || (isVi ? 'Đăng nhập thất bại.' : 'Login failed.'))
      }
    } catch (err: any) {
      setLoginError(err.message || 'Lỗi kết nối tới Riot')
    } finally {
      setLoggingIn(false)
    }
  }

  // Xử lý lưu token thủ công
  const handleSaveManualTokens = () => {
    if (!manualAccessToken.trim() || !manualEntitlements.trim() || !manualPuuid.trim()) {
      message.error(isVi ? 'Vui lòng điền đủ Access Token, Entitlements Token và PUUID!' : 'Please fill all token fields!')
      return
    }

    const updated: RiotAccount = {
      ...currentAccount,
      label: label.trim() || currentAccount.label,
      region,
      puuid: manualPuuid.trim(),
      accessToken: manualAccessToken.trim(),
      entitlementsToken: manualEntitlements.trim(),
      status: 'success',
    }
    saveAccount(updated)
    message.success(isVi ? 'Đã lưu cấu hình Token thành công!' : 'Tokens saved successfully!')
  }

  // Đăng xuất slot tài khoản này
  const handleLogoutSlot = () => {
    const updated: RiotAccount = {
      id: currentAccount.id,
      label: currentAccount.label,
      region: 'ap',
      puuid: '',
      accessToken: '',
      entitlementsToken: '',
      shop: undefined,
      wallet: undefined,
      gameName: undefined,
      tagLine: undefined,
      status: 'idle',
    }
    saveAccount(updated)
    message.info(isVi ? `Đã đăng xuất ${currentAccount.label}!` : `Logged out ${currentAccount.label}!`)
  }

  const copyBookmarkletCode = () => {
    const code = `javascript:(function(){location.href='http://localhost:3000/shop'+location.hash;})();`
    navigator.clipboard.writeText(code)
    message.success(isVi ? 'Đã sao chép mã Bookmarklet!' : 'Bookmarklet code copied!')
  }

  const tabItems = riotAccounts.map((acc, idx) => {
    const isConnected = !!(acc.accessToken && acc.puuid)
    return {
      key: acc.id,
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <UserOutlined />
          {acc.label || `Acc ${idx + 1}`}
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-white/20" />
          )}
        </span>
      ),
    }
  })

  return (
    <Modal
      title={
        <div className="text-white flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined style={{ color: colorPrimary }} />
            <span className="text-base font-bold uppercase tracking-wider">
              {isVi ? 'QUẢN LÝ 3 TÀI KHOẢN RIOT (TREO LOGIN)' : 'MANAGE 3 RIOT ACCOUNTS'}
            </span>
          </div>

          <Button
            size="small"
            icon={<SyncOutlined spin={isRefreshingAccounts} />}
            loading={isRefreshingAccounts}
            onClick={refreshAllAccounts}
            className="!text-xs uppercase !font-bold"
          >
            {isVi ? 'Làm Mới Cả 3 Acc' : 'Refresh All 3'}
          </Button>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      classNames={{ body: '!bg-[#0c1015] !text-white !p-6' }}
      wrapClassName="game-modal-wrap"
      style={{ top: 30 }}
    >
      <div className="flex flex-col gap-5">
        <Alert
          type="info"
          showIcon
          className="!bg-red-950/30 !border-red-800/40 !text-red-200 text-xs"
          message={
            isVi
              ? 'Treo đăng nhập cùng lúc 3 tài khoản Riot Games:'
              : 'Keep 3 Riot accounts connected simultaneously:'
          }
          description={
            <div className="mt-1 text-[11px] text-red-300 flex flex-col gap-0.5">
              <div>
                • Cả 3 tài khoản được lấy Live Store trực tiếp từ Riot Games.
              </div>
              <div>
                • Nếu <b>BẤT KỲ TÀI KHOẢN NÀO</b> ra skin trong danh sách Yêu Thích (Fav), điện thoại của bạn sẽ nhận thông báo ngay và ghi rõ tài khoản nào có!
              </div>
            </div>
          }
        />

        {/* 3 Account Slots Navigation */}
        <Tabs
          activeKey={selectedAccountId}
          onChange={handleSelectAccountTab}
          items={tabItems}
          className="custom-game-tabs"
        />

        {/* Current Account Details & Status */}
        {currentAccount && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8f9499] uppercase font-mono">
                  {isVi ? 'Tên định danh slot tài khoản:' : 'Account slot label:'}
                </div>
                <Input
                  value={label || currentAccount.label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="ví dụ: Acc Chính (Hoang#VN), Acc Smurf 1..."
                  className="!bg-black/60 !border-white/10 !text-white !font-bold !w-64 !mt-1"
                />
              </div>

              {currentAccount.accessToken && currentAccount.puuid ? (
                <div className="text-right">
                  <Tag color="success" className="!text-xs !font-bold">
                    <CheckCircleOutlined /> {isVi ? 'ĐÃ KẾT NỐI' : 'CONNECTED'}
                  </Tag>
                  {currentAccount.gameName && (
                    <div className="text-white text-xs font-bold mt-1">
                      {currentAccount.gameName}
                      <span className="text-[#8f9499]">#{currentAccount.tagLine || 'VN'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <Tag color="default" className="!text-xs">
                  <ExclamationCircleOutlined /> {isVi ? 'CHƯA ĐĂNG NHẬP' : 'NOT CONNECTED'}
                </Tag>
              )}
            </div>

            {/* Wallet Balances if connected */}
            {currentAccount.wallet && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-[#8f9499] uppercase">Valorant Points (VP)</div>
                  <div className="text-amber-400 font-black text-sm">
                    {currentAccount.wallet.vp.toLocaleString()} VP
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8f9499] uppercase">Radianite (RAD)</div>
                  <div className="text-cyan-400 font-black text-sm">
                    {currentAccount.wallet.rad.toLocaleString()} RAD
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8f9499] uppercase">Kingdom Credits (KC)</div>
                  <div className="text-indigo-400 font-black text-sm">
                    {currentAccount.wallet.kc.toLocaleString()} KC
                  </div>
                </div>
              </div>
            )}

            {/* Region selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8f9499]">{isVi ? 'Khu vực / Máy chủ:' : 'Server Region:'}</span>
              <Select
                value={region}
                onChange={(val) => setRegion(val)}
                className="w-48 !bg-black/40"
                options={[
                  { value: 'ap', label: 'AP (Châu Á / Việt Nam)' },
                  { value: 'na', label: 'NA (Bắc Mỹ)' },
                  { value: 'eu', label: 'EU (Châu Âu)' },
                  { value: 'kr', label: 'KR (Hàn Quốc)' },
                ]}
              />
            </div>

            {/* Auth Method Tabs */}
            <div className="border-t border-white/5 pt-3">
              <div className="flex gap-2 mb-3">
                <Button
                  size="small"
                  type={authMode === 'official' ? 'primary' : 'default'}
                  onClick={() => setAuthMode('official')}
                  style={{ backgroundColor: authMode === 'official' ? colorPrimary : undefined }}
                  className="text-xs font-bold"
                >
                  <GlobalOutlined /> {isVi ? 'Web Riot 1-Click (Tự Động Về)' : '1-Click Riot Web'}
                </Button>
                <Button
                  size="small"
                  type={authMode === 'login' ? 'primary' : 'default'}
                  onClick={() => setAuthMode('login')}
                  style={{ backgroundColor: authMode === 'login' ? colorPrimary : undefined }}
                  className="text-xs font-bold"
                >
                  <UserOutlined /> {isVi ? 'Đăng Nhập Trực Tiếp' : 'Direct Login'}
                </Button>
                <Button
                  size="small"
                  type={authMode === 'token' ? 'primary' : 'default'}
                  onClick={() => setAuthMode('token')}
                  style={{ backgroundColor: authMode === 'token' ? colorPrimary : undefined }}
                  className="text-xs font-bold"
                >
                  <KeyOutlined /> {isVi ? 'Dán Token Thủ Công' : 'Manual Token'}
                </Button>
              </div>

              {/* METHOD 1: OFFICIAL 1-CLICK RIOT WEB LOGIN WITH AUTO-RETURN */}
              {authMode === 'official' && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-gradient-to-r from-red-950/20 to-black/40 border border-red-500/20">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">1</span>
                    {isVi ? 'Mở trang đăng nhập Riot Games:' : 'Open Riot Official Login:'}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="primary"
                      href={RIOT_AUTH_URL}
                      target="_blank"
                      rel="noreferrer"
                      icon={<GlobalOutlined />}
                      style={{ backgroundColor: colorPrimary, borderColor: colorPrimary, fontWeight: 'bold' }}
                    >
                      {isVi ? 'MỞ TRANG ĐĂNG NHẬP RIOT' : 'OPEN RIOT LOGIN PAGE'}
                    </Button>
                    <span className="text-[11px] text-[#8f9499]">
                      {isVi
                        ? '(Đăng nhập an toàn 100% trên trang chính thức của Riot, không bị chặn)'
                        : '(100% safe on Riot official domain)'}
                    </span>
                  </div>

                  {/* AUTO-RETURN HELPER (Bookmarklet) */}
                  <div className="p-3 rounded-lg bg-black/60 border border-amber-500/30 flex flex-col gap-2 mt-1">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <ThunderboltOutlined className="text-amber-400" />
                      {isVi ? 'Mẹo Tự Động Nhảy Về Lại Web (Không Cần Copy/Paste):' : 'Auto-Return Shortcut:'}
                    </div>
                    <div className="text-[11px] text-[#8f9499] leading-relaxed">
                      {isVi
                        ? 'Riot chỉ cho phép chuyển hướng về playvalorant.com. Để tự động quay về đây ngay sau khi đăng nhập xong:'
                        : 'To auto-bounce back immediately after logging in:'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={copyBookmarkletCode}
                        className="text-xs font-bold"
                      >
                        {isVi ? 'Sao Chép Bookmarklet 1-Click' : 'Copy Bookmarklet'}
                      </Button>

                      <a
                        href="javascript:(function(){location.href='http://localhost:3000/shop'+location.hash;})();"
                        className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30"
                        title="Kéo nút này thả lên thanh Dấu trang (Bookmarks Bar) của trình duyệt"
                      >
                        ⚡ Kéo tôi lên thanh Bookmark
                      </a>
                    </div>
                    <div className="text-[10px] text-amber-200/60">
                      {isVi
                        ? '👉 Chỉ cần kéo nút trên vào thanh Bookmark trình duyệt. Đăng nhập Riot xong, click nút bookmark 1 cái là tự bay về web và tự đăng nhập luôn!'
                        : '👉 Drag this to your browser bookmarks bar. After Riot login, click it once to return here instantly!'}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white flex items-center gap-2 mt-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">2</span>
                    {isVi
                      ? 'Hoặc copy link trên thanh địa chỉ sau khi đăng nhập dán vào đây:'
                      : 'Or copy address bar URL and paste below:'}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={redirectUrlInput}
                      onChange={(e) => setRedirectUrlInput(e.target.value)}
                      placeholder="https://playvalorant.com/opt_in#access_token=ey... hoặc dán Token"
                      className="!bg-black/60 !border-white/10 !text-white font-mono text-xs"
                    />
                    <Button
                      type="primary"
                      loading={parsingUrl}
                      onClick={handleParseRedirectUrl}
                      icon={<LinkOutlined />}
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 'bold' }}
                    >
                      {isVi ? 'KẾT NỐI NGAY' : 'CONNECT'}
                    </Button>
                  </div>

                  <div className="text-[11px] text-[#8f9499] bg-black/40 p-2 rounded border border-white/5">
                    💡 {isVi
                      ? 'Lưu ý: Khi đăng nhập xong, trang Riot có thể hiện "404 Page Not Found" (vì Riot đã đóng trang sự kiện cũ), NHƯNG trên thanh địa chỉ URL của trình duyệt đã có chứa mã #access_token=ey... rồi. Bạn chỉ việc copy toàn bộ link đó dán vào ô trên hoặc bấm Bookmark là xong!'
                      : 'Note: If the final page shows 404, do not worry! The URL in your address bar already contains #access_token=ey... Just copy that URL or click the bookmark!'}
                  </div>

                  {loginError && (
                    <div className="text-red-400 text-xs p-2 rounded bg-red-950/40 border border-red-500/30">
                      {loginError}
                    </div>
                  )}

                  {currentAccount.accessToken && (
                    <div className="flex justify-end mt-1">
                      <Button danger onClick={handleLogoutSlot} icon={<DeleteOutlined />} size="small">
                        {isVi ? 'Đăng Xuất Acc Này' : 'Logout Slot'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: DIRECT USERNAME & PASSWORD */}
              {authMode === 'login' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#8f9499] block mb-1">
                        {isVi ? 'Tên đăng nhập Riot:' : 'Riot Username:'}
                      </label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Tên tài khoản Riot..."
                        className="!bg-black/50 !border-white/10 !text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8f9499] block mb-1">
                        {isVi ? 'Mật khẩu:' : 'Password:'}
                      </label>
                      <Input.Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu..."
                        className="!bg-black/50 !border-white/10 !text-white"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="text-red-400 text-xs p-2.5 rounded bg-red-950/40 border border-red-500/30 flex flex-col gap-1">
                      <div className="font-bold">Lỗi: {loginError}</div>
                      <div className="text-[11px] text-[#8f9499]">
                        * Lưu ý: Hiện tại Riot áp dụng Cloudflare Turnstile để chặn các request tự động từ code (invalid_request). Nếu gặp lỗi này, bạn chỉ cần bấm sang tab <b>"Web Riot 1-Click"</b> để đăng nhập chính thức chỉ mất 5 giây!
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <Button
                      type="primary"
                      loading={loggingIn}
                      onClick={handleLoginSubmit}
                      style={{ backgroundColor: colorPrimary, borderColor: colorPrimary, fontWeight: 'bold' }}
                    >
                      {isVi ? `Đăng Nhập Cho [${currentAccount.label}]` : `Login For [${currentAccount.label}]`}
                    </Button>

                    {currentAccount.accessToken && (
                      <Button danger onClick={handleLogoutSlot} icon={<DeleteOutlined />} size="small">
                        {isVi ? 'Đăng Xuất Acc Này' : 'Logout Slot'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 3: MANUAL TOKENS */}
              {authMode === 'token' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[11px] text-[#8f9499] block mb-1">Player UUID (PUUID):</label>
                    <Input
                      value={manualPuuid}
                      onChange={(e) => setManualPuuid(e.target.value)}
                      placeholder="e.g. 12345678-abcd-1234-..."
                      className="!bg-black/50 !border-white/10 !text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8f9499] block mb-1">Access Token:</label>
                    <Input.Password
                      value={manualAccessToken}
                      onChange={(e) => setManualAccessToken(e.target.value)}
                      placeholder="Bearer token..."
                      className="!bg-black/50 !border-white/10 !text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8f9499] block mb-1">Entitlements Token:</label>
                    <Input.Password
                      value={manualEntitlements}
                      onChange={(e) => setManualEntitlements(e.target.value)}
                      placeholder="Entitlements JWT..."
                      className="!bg-black/50 !border-white/10 !text-white font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <Button
                      type="primary"
                      onClick={handleSaveManualTokens}
                      style={{ backgroundColor: colorPrimary, borderColor: colorPrimary, fontWeight: 'bold' }}
                    >
                      {isVi ? 'Lưu Cấu Hình Token' : 'Save Tokens'}
                    </Button>

                    {currentAccount.accessToken && (
                      <Button danger onClick={handleLogoutSlot} icon={<DeleteOutlined />} size="small">
                        {isVi ? 'Xóa Token Acc Này' : 'Clear Tokens'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-white/10">
          <Button onClick={onClose} className="!border-white/20 !text-white hover:!border-white">
            {isVi ? 'Hoàn Tất & Đóng' : 'Done & Close'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
