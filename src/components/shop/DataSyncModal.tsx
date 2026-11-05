import { useState, useMemo } from 'react'
import { Modal, Tabs, Input, Button, message } from 'antd'
import {
  CloudSyncOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleFilled,
  LinkOutlined,
  HeartFilled,
  UserOutlined,
  FireOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useShop } from '../../context/ShopContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

interface DataSyncModalProps {
  open: boolean
  onClose: () => void
}

export default function DataSyncModal({ open, onClose }: DataSyncModalProps) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const {
    favorites,
    riotAccounts,
    appearanceCounter,
    notificationSettings,
    exportData,
    importData,
  } = useShop()

  const [activeTabKey, setActiveTabKey] = useState<'export' | 'import'>('export')
  const [importCodeInput, setImportCodeInput] = useState('')
  const [targetWebUrl, setTargetWebUrl] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Generate sync code dynamically
  const syncCode = useMemo(() => {
    if (!open) return ''
    return exportData()
  }, [open, exportData])

  const connectedAccountsCount = useMemo(() => {
    return riotAccounts.filter((a) => a.accessToken && a.puuid).length
  }, [riotAccounts])

  const appearanceSkinsCount = useMemo(() => {
    return Object.keys(appearanceCounter).length
  }, [appearanceCounter])

  const handleCopyCode = async () => {
    if (!syncCode) return
    try {
      await navigator.clipboard.writeText(syncCode)
      setCopiedCode(true)
      message.success(isVi ? 'Đã sao chép mã đồng bộ vào Clipboard!' : 'Sync code copied to clipboard!')
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      message.error(isVi ? 'Không thể sao chép tự động, vui lòng chọn văn bản để sao chép!' : 'Failed to copy!')
    }
  }

  const handleCopySyncLink = async () => {
    let baseUrl = targetWebUrl.trim()
    if (!baseUrl) {
      baseUrl = window.location.origin
    }
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, '')
    const fullLink = `${baseUrl}/#sync=${syncCode}`

    try {
      await navigator.clipboard.writeText(fullLink)
      setCopiedLink(true)
      message.success(
        isVi
          ? 'Đã sao chép link đồng bộ! Bạn chỉ cần dán mở link này trên trình duyệt web/điện thoại là xong!'
          : 'Sync link copied!',
      )
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      message.error(isVi ? 'Không thể sao chép link!' : 'Failed to copy link!')
    }
  }

  const handleExecuteImport = () => {
    if (!importCodeInput.trim()) {
      message.warning(isVi ? 'Vui lòng dán mã đồng bộ hoặc link đồng bộ vào khung!' : 'Please enter sync code!')
      return
    }

    let rawCode = importCodeInput.trim()
    // Support pasting full link with #sync=...
    if (rawCode.includes('sync=')) {
      rawCode = rawCode.split('sync=')[1].split('&')[0]
    }

    const success = importData(rawCode)
    if (success) {
      message.success(
        isVi
          ? '🎉 Đồng bộ thành công! Danh sách yêu thích, tài khoản Riot và bộ đếm đã được cập nhật!'
          : 'Sync successful! All data restored!',
      )
      setImportCodeInput('')
      onClose()
    } else {
      message.error(
        isVi
          ? 'Mã đồng bộ không hợp lệ hoặc đã bị lỗi cú pháp. Vui lòng kiểm tra lại!'
          : 'Invalid sync code format!',
      )
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      title={
        <div className="flex items-center gap-2 text-white">
          <CloudSyncOutlined style={{ color: colorPrimary }} className="text-xl" />
          <span className="font-black tracking-wider uppercase">
            {isVi ? 'ĐỒNG BỘ DỮ LIỆU (LOCAL ⇄ WEB / ĐIỆN THOẠI)' : 'DATA SYNC (LOCAL ⇄ WEB / MOBILE)'}
          </span>
        </div>
      }
      className="custom-riot-modal"
    >
      <div className="py-2 space-y-4">
        {/* Why sync explanation banner */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#8f9499] space-y-1.5">
          <div className="text-white font-bold flex items-center gap-1.5">
            <span className="text-amber-400">💡</span>
            {isVi ? 'Vì sao cần đồng bộ giữa Local và Web?' : 'Why is synchronization needed?'}
          </div>
          <p className="m-0 leading-relaxed text-[11px]">
            {isVi
              ? 'Theo quy tắc an toàn bảo mật trình duyệt (Same-Origin Policy), dữ liệu bạn lưu ở máy tính (localhost:3000) được lưu trữ độc lập trên máy bạn, không thể tự chuyển lên trang web đã deploy (Vercel/Netlify). Tính năng này giúp bạn đồng bộ toàn bộ Danh sách yêu thích ❤️, 3 Tài khoản Riot và Lịch sử bộ đếm chỉ trong 1 giây!'
              : 'Browser security isolates localhost storage from your deployed web domain. This tool transfers your favorites, accounts, and counters effortlessly in 1 click!'}
          </p>
        </div>

        {/* Current Data Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
            <HeartFilled className="text-red-500 text-sm mb-1" />
            <div className="text-[10px] text-[#8f9499] uppercase font-mono">{isVi ? 'Yêu Thích' : 'Favorites'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{favorites.length} skin</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
            <UserOutlined className="text-emerald-400 text-sm mb-1" />
            <div className="text-[10px] text-[#8f9499] uppercase font-mono">{isVi ? 'Tài Khoản Riot' : 'Riot Accounts'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{connectedAccountsCount} / {riotAccounts.length} kết nối</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
            <FireOutlined className="text-amber-400 text-sm mb-1" />
            <div className="text-[10px] text-[#8f9499] uppercase font-mono">{isVi ? 'Bộ Đếm Skin' : 'Counter'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{appearanceSkinsCount} skin</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-center">
            <BellOutlined className="text-purple-400 text-sm mb-1" />
            <div className="text-[10px] text-[#8f9499] uppercase font-mono">{isVi ? 'Báo Điện Thoại' : 'Phone Alerts'}</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {notificationSettings.enabled ? 'Đang bật' : 'Chưa bật'}
            </div>
          </div>
        </div>

        {/* Tabs: Export vs Import */}
        <Tabs
          activeKey={activeTabKey}
          onChange={(k) => setActiveTabKey(k as 'export' | 'import')}
          items={[
            {
              key: 'export',
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs uppercase">
                  <DownloadOutlined /> {isVi ? 'Xuất Dữ Liệu Từ Local' : 'Export From Local'}
                </span>
              ),
              children: (
                <div className="space-y-4 pt-1">
                  {/* Option A: 1-Click Sync Link */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold flex items-center gap-1.5">
                        <LinkOutlined className="text-blue-400" />
                        {isVi ? 'Cách 1: Tạo link mở tự động đồng bộ (Khuyên Dùng)' : 'Method 1: 1-Click Sync Link (Recommended)'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">1-CLICK SYNC</span>
                    </div>
                    <p className="text-[11px] text-[#8f9499] m-0">
                      {isVi
                        ? 'Nhập địa chỉ trang web đã deploy của bạn (ví dụ: https://ten-cua-ban.vercel.app), bấm nút bên dưới rồi mở link trên điện thoại hoặc trình duyệt khác!'
                        : 'Enter your deployed URL to generate a direct 1-click sync link.'}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://ten-du-an.vercel.app (hoặc để trống dùng URL hiện tại)"
                        value={targetWebUrl}
                        onChange={(e) => setTargetWebUrl(e.target.value)}
                        className="!bg-black/60 !border-white/20 !text-white !text-xs font-mono"
                      />
                      <Button
                        type="primary"
                        icon={copiedLink ? <CheckCircleFilled /> : <CopyOutlined />}
                        onClick={handleCopySyncLink}
                        style={{
                          backgroundColor: copiedLink ? '#10b981' : colorPrimary,
                          borderColor: copiedLink ? '#10b981' : colorPrimary,
                          fontWeight: 'bold',
                        }}
                        className="!text-xs shrink-0"
                      >
                        {copiedLink ? (isVi ? 'Đã Chép!' : 'Copied!') : (isVi ? 'Sao Chép Link Web' : 'Copy Web Link')}
                      </Button>
                    </div>
                  </div>

                  {/* Option B: Copy raw code */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold flex items-center gap-1.5">
                        <CopyOutlined className="text-emerald-400" />
                        {isVi ? 'Cách 2: Sao chép mã đồng bộ (Sync Code)' : 'Method 2: Copy Raw Sync Code'}
                      </span>
                      <Button
                        size="small"
                        icon={copiedCode ? <CheckCircleFilled /> : <CopyOutlined />}
                        onClick={handleCopyCode}
                        className="!text-xs !bg-white/10 !border-white/20 !text-white"
                      >
                        {copiedCode ? (isVi ? 'Đã Chép' : 'Copied') : (isVi ? 'Sao Chép Mã' : 'Copy Code')}
                      </Button>
                    </div>
                    <Input.TextArea
                      rows={3}
                      value={syncCode}
                      readOnly
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                      className="!bg-black/80 !border-white/15 !text-[#8f9499] !text-[10px] font-mono select-all resize-none"
                    />
                    <p className="text-[10px] text-white/40 m-0">
                      {isVi
                        ? '👉 Sang trang web đã deploy, mở tính năng "Đồng Bộ", chọn tab "Nhập Dữ Liệu" rồi dán mã này vào!'
                        : 'Paste this code into the Import tab on your deployed site.'}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: 'import',
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs uppercase">
                  <UploadOutlined /> {isVi ? 'Nhập Dữ Liệu Vào Web' : 'Import Into Web'}
                </span>
              ),
              children: (
                <div className="space-y-3.5 pt-1">
                  <p className="text-xs text-[#8f9499] m-0">
                    {isVi
                      ? 'Dán mã đồng bộ (hoặc dán đường link có chứa #sync=...) bạn đã sao chép từ máy tính vào đây:'
                      : 'Paste the sync code or sync link copied from your local machine below:'}
                  </p>
                  <Input.TextArea
                    rows={4}
                    placeholder={
                      isVi
                        ? 'Dán mã đồng bộ (chuỗi ký tự dài) hoặc link web vào đây...'
                        : 'Paste sync code or full sync link here...'
                    }
                    value={importCodeInput}
                    onChange={(e) => setImportCodeInput(e.target.value)}
                    className="!bg-black/80 !border-white/20 !text-white !text-xs font-mono"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={onClose} className="!text-xs">
                      {isVi ? 'Đóng' : 'Close'}
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleFilled />}
                      onClick={handleExecuteImport}
                      style={{
                        backgroundColor: '#10b981',
                        borderColor: '#10b981',
                        fontWeight: 'bold',
                      }}
                      className="!text-xs uppercase tracking-wider"
                    >
                      {isVi ? 'Khôi Phục & Đồng Bộ Ngay' : 'Restore & Sync Now'}
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  )
}
