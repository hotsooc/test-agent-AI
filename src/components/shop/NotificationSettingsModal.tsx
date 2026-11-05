import { useState } from 'react'
import { Modal, Switch, Input, Button, Tabs, message, Alert } from 'antd'
import {
  BellOutlined,
  SendOutlined,
  CheckCircleOutlined,
  MobileOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useShop } from '../../context/ShopContext'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'

interface NotificationSettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function NotificationSettingsModal({ open, onClose }: NotificationSettingsModalProps) {
  const { isVi } = useLanguage()
  const { colorPrimary } = useGame()
  const { notificationSettings, updateNotificationSettings, sendTestNotification } = useShop()

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; details: Record<string, boolean> } | null>(null)

  const handleTestNotification = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await sendTestNotification()
      setTestResult(res)
      if (res.success) {
        message.success(
          isVi
            ? 'Đã gửi thông báo test thành công! Hãy kiểm tra điện thoại của bạn ngay.'
            : 'Test notification sent successfully! Check your phone now.',
        )
      } else {
        message.warning(
          isVi
            ? 'Chưa gửi được thông báo. Hãy kiểm tra lại kênh thông báo đã bật và thông tin cấu hình.'
            : 'Failed to send notification. Please check your enabled channels and configurations.',
        )
      }
    } catch {
      message.error(isVi ? 'Đã có lỗi xảy ra khi gửi thông báo.' : 'Error sending notification.')
    } finally {
      setTesting(false)
    }
  }

  const generateNewTopic = () => {
    const topic = 'val_shop_' + Math.random().toString(36).substring(2, 9)
    updateNotificationSettings({ ntfyTopic: topic })
    message.info(isVi ? `Đã tạo Topic mới: ${topic}` : `New Topic generated: ${topic}`)
  }

  const tabItems = [
    {
      key: 'ntfy',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <MobileOutlined /> ntfy.sh ({isVi ? 'Khuyên Dùng' : 'Recommended'})
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 text-xs">
          <Alert
            type="info"
            showIcon
            className="!bg-blue-950/40 !border-blue-800/50 !text-blue-200"
            message={isVi ? 'Cách nhận thông báo về điện thoại nhanh nhất (100% Miễn phí):' : 'Fastest way to get push notifications on phone:'}
            description={
              <div className="mt-1 flex flex-col gap-1 text-[11px] text-blue-300">
                <div>1. Cài app <b>ntfy</b> từ App Store (iOS) hoặc Google Play (Android). (Không cần đăng ký).</div>
                <div>2. Mở app ntfy, bấm dấu <b>+</b> (Subscribe) và nhập tên <b>Topic</b> bên dưới.</div>
                <div>3. Khi Daily Shop có skin trong Favorite, điện thoại của bạn sẽ reo chuông và hiện thông báo đẩy ngay trên màn hình khóa!</div>
              </div>
            }
          />

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-white font-bold">{isVi ? 'Kích hoạt ntfy.sh' : 'Enable ntfy.sh'}</div>
              <div className="text-[#8f9499] text-[11px]">
                {isVi ? 'Gửi thông báo đẩy tức thì tới điện thoại' : 'Push notifications instantly to phone'}
              </div>
            </div>
            <Switch
              checked={notificationSettings.ntfyEnabled}
              onChange={(val) => updateNotificationSettings({ ntfyEnabled: val })}
            />
          </div>

          <div>
            <div className="text-white font-bold mb-1.5 flex items-center justify-between">
              <span>{isVi ? 'Tên Topic ntfy của bạn:' : 'Your ntfy Topic:'}</span>
              <button
                onClick={generateNewTopic}
                className="text-[11px] text-amber-400 hover:underline bg-transparent border-none cursor-pointer"
              >
                {isVi ? 'Tạo topic mới ngẫu nhiên' : 'Generate random topic'}
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                value={notificationSettings.ntfyTopic}
                onChange={(e) => updateNotificationSettings({ ntfyTopic: e.target.value })}
                placeholder="ví dụ: valorant_shop_cuatoi_123"
                className="!bg-black/50 !border-white/10 !text-white font-mono"
              />
              <Button
                href={`https://ntfy.sh/${notificationSettings.ntfyTopic || ''}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs"
              >
                {isVi ? 'Xem trên Web' : 'Open Web'}
              </Button>
            </div>
            <div className="text-[#8f9499] text-[11px] mt-1">
              {isVi
                ? `Đường dẫn nhận thông báo: https://ntfy.sh/${notificationSettings.ntfyTopic || '...'}`
                : `Notification endpoint: https://ntfy.sh/${notificationSettings.ntfyTopic || '...'}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'telegram',
      label: <span className="flex items-center gap-1.5 font-bold"><SendOutlined /> Telegram Bot</span>,
      children: (
        <div className="flex flex-col gap-4 text-xs">
          <Alert
            type="info"
            showIcon
            className="!bg-indigo-950/40 !border-indigo-800/50 !text-indigo-200"
            message={isVi ? 'Hướng dẫn tạo Bot Telegram nhận thông báo:' : 'How to set up Telegram Bot:'}
            description={
              <div className="mt-1 flex flex-col gap-1 text-[11px] text-indigo-300">
                <div>1. Mở Telegram, nhắn cho bot <b>@BotFather</b> lệnh <code>/newbot</code> để lấy <b>Bot Token</b>.</div>
                <div>2. Nhắn tin <code>/start</code> cho con bot của bạn vừa tạo.</div>
                <div>3. Nhắn cho bot <b>@userinfobot</b> để xem <b>Chat ID</b> cá nhân của bạn. Dán vào ô bên dưới!</div>
              </div>
            }
          />

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-white font-bold">{isVi ? 'Kích hoạt thông báo Telegram' : 'Enable Telegram Alerts'}</div>
              <div className="text-[#8f9499] text-[11px]">
                {isVi ? 'Gửi tin nhắn kèm hình ảnh skin về app Telegram trên điện thoại' : 'Send message with skin preview to Telegram app'}
              </div>
            </div>
            <Switch
              checked={notificationSettings.telegramEnabled}
              onChange={(val) => updateNotificationSettings({ telegramEnabled: val })}
            />
          </div>

          <div>
            <label className="text-white font-bold mb-1 block">Telegram Bot Token:</label>
            <Input.Password
              value={notificationSettings.telegramBotToken}
              onChange={(e) => updateNotificationSettings({ telegramBotToken: e.target.value })}
              placeholder="ví dụ: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="!bg-black/50 !border-white/10 !text-white font-mono"
            />
          </div>

          <div>
            <label className="text-white font-bold mb-1 block">Telegram Chat ID:</label>
            <Input
              value={notificationSettings.telegramChatId}
              onChange={(e) => updateNotificationSettings({ telegramChatId: e.target.value })}
              placeholder="ví dụ: 987654321"
              className="!bg-black/50 !border-white/10 !text-white font-mono"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'discord',
      label: <span className="flex items-center gap-1.5 font-bold"><RocketOutlined /> Discord Webhook</span>,
      children: (
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-white font-bold">{isVi ? 'Kích hoạt Discord Webhook' : 'Enable Discord Webhook'}</div>
              <div className="text-[#8f9499] text-[11px]">
                {isVi ? 'Bắn tin nhắn embed vào kênh Discord cá nhân hoặc server' : 'Send rich embed message to Discord channel'}
              </div>
            </div>
            <Switch
              checked={notificationSettings.discordEnabled}
              onChange={(val) => updateNotificationSettings({ discordEnabled: val })}
            />
          </div>

          <div>
            <label className="text-white font-bold mb-1 block">Discord Webhook URL:</label>
            <Input
              value={notificationSettings.discordWebhookUrl}
              onChange={(e) => updateNotificationSettings({ discordWebhookUrl: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
              className="!bg-black/50 !border-white/10 !text-white font-mono"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'browser',
      label: <span className="flex items-center gap-1.5 font-bold"><BellOutlined /> Web Browser</span>,
      children: (
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-white font-bold">{isVi ? 'Thông báo trình duyệt (HTML5 Web Push)' : 'Browser Notification'}</div>
              <div className="text-[#8f9499] text-[11px]">
                {isVi ? 'Hiển thị thông báo trên trình duyệt máy tính hoặc điện thoại' : 'Display notifications on PC or mobile browser'}
              </div>
            </div>
            <Switch
              checked={notificationSettings.browserEnabled}
              onChange={(val) => {
                if (val && 'Notification' in window && Notification.permission !== 'granted') {
                  Notification.requestPermission()
                }
                updateNotificationSettings({ browserEnabled: val })
              }}
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div className="text-white flex items-center gap-2">
          <MobileOutlined style={{ color: colorPrimary }} />
          <span className="text-base font-bold uppercase tracking-wider">
            {isVi ? 'CÀI ĐẶT THÔNG BÁO VỀ ĐIỆN THOẠI' : 'PHONE NOTIFICATION SETTINGS'}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      classNames={{ body: '!bg-[#0c1015] !text-white !p-6' }}
      wrapClassName="game-modal-wrap"
      style={{ top: 50 }}
    >
      <div className="flex flex-col gap-5">
        {/* Master Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-black/40 border border-red-500/30">
          <div>
            <div className="text-white font-extrabold text-sm flex items-center gap-2">
              <BellOutlined className="text-red-400" />
              {isVi ? 'Tự Động Báo Khi Daily Shop Ra Skin Yêu Thích' : 'Auto Alert On Daily Shop Favorite Skin'}
            </div>
            <div className="text-[#8f9499] text-xs mt-0.5">
              {isVi
                ? 'Hệ thống sẽ tự động gửi thông báo về điện thoại ngay khi phát hiện skin trong danh sách Fav xuất hiện trong shop hôm nay.'
                : 'Instantly notify your phone whenever any skin in your favorites appears in the daily shop.'}
            </div>
          </div>
          <Switch
            checked={notificationSettings.enabled}
            onChange={(val) => updateNotificationSettings({ enabled: val })}
          />
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultActiveKey="ntfy" items={tabItems} className="custom-game-tabs" />

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircleOutlined />
              {testResult.success
                ? (isVi ? 'Đã gửi thông báo thử nghiệm thành công!' : 'Test notification dispatched successfully!')
                : (isVi ? 'Gửi thông báo thất bại. Chi tiết kênh:' : 'Failed to dispatch. Channel results:')}
            </div>
            <div className="text-[11px] opacity-80">
              ntfy: {testResult.details.ntfy ? '✓ Thành công' : '✗ Chưa cấu hình / không bật'} | Telegram:{' '}
              {testResult.details.telegram ? '✓ Thành công' : '✗ Chưa cấu hình / không bật'} | Discord:{' '}
              {testResult.details.discord ? '✓ Thành công' : '✗ Chưa cấu hình / không bật'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={testing}
            onClick={handleTestNotification}
            style={{
              backgroundColor: colorPrimary,
              borderColor: colorPrimary,
              fontWeight: 'bold',
            }}
          >
            {isVi ? 'GỬI THÔNG BÁO THỬ NGHIỆM ĐẾN ĐIỆN THOẠI' : 'SEND TEST NOTIFICATION TO PHONE'}
          </Button>

          <Button onClick={onClose} className="!border-white/20 !text-white hover:!border-white">
            {isVi ? 'Đóng' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
