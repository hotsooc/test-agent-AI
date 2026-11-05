import { NotificationSettings, DailyShopItem } from '../types/shop'

const STORAGE_KEY = 'valorant_notification_settings'

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  ntfyEnabled: true,
  ntfyTopic: 'val_shop_' + Math.random().toString(36).substring(2, 8),
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  discordEnabled: false,
  discordWebhookUrl: '',
  browserEnabled: true,
}

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('Error saving notification settings:', err)
  }
}

export async function sendNtfyPush(
  topic: string,
  title: string,
  message: string,
  imageUrl?: string,
): Promise<boolean> {
  if (!topic || !topic.trim()) return false
  try {
    const payload: Record<string, any> = {
      topic: topic.trim(),
      title,
      message,
      priority: 4, // High priority
      tags: ['tada', 'gun', 'star'],
    }
    if (imageUrl) {
      payload.attach = imageUrl
    }
    const res = await fetch('https://ntfy.sh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch (e) {
    console.warn('ntfy push failed:', e)
    return false
  }
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  imageUrl?: string,
): Promise<boolean> {
  if (!botToken || !chatId) return false
  try {
    if (imageUrl) {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: text,
          parse_mode: 'HTML',
        }),
      })
      if (res.ok) return true
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch (e) {
    console.warn('Telegram send failed:', e)
    return false
  }
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  title: string,
  message: string,
  imageUrl?: string,
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false
  try {
    const embed: Record<string, unknown> = {
      title,
      description: message,
      color: 0xff4655,
      timestamp: new Date().toISOString(),
      footer: { text: 'Valorant Daily Shop Tracker' },
    }
    if (imageUrl) {
      embed.image = { url: imageUrl }
    }
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **${title}**`,
        embeds: [embed],
      }),
    })
    return res.ok
  } catch (e) {
    console.warn('Discord webhook failed:', e)
    return false
  }
}

export function sendBrowserPush(title: string, message: string, icon?: string): boolean {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: icon || '/favicon.ico',
    })
    return true
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification(title, { body: message, icon })
      }
    })
  }
  return false
}

export async function dispatchShopNotification(
  matchedItems: DailyShopItem[],
  settings: NotificationSettings,
  isTest = false,
  accountName?: string,
  walletVp?: number,
): Promise<{ success: boolean; details: Record<string, boolean> }> {
  const details: Record<string, boolean> = {
    ntfy: false,
    telegram: false,
    discord: false,
    browser: false,
  }

  const skinNames = matchedItems.map((i) => `• ${i.displayName} (${i.weaponName} - ${i.cost} VP)`).join('\n')
  const accTag = accountName ? `[${accountName}] ` : ''

  const title = isTest
    ? `🔔 [TEST] Thông Báo Daily Shop ${accTag}`
    : `🎯 [VALORANT SHOP] ${accTag}Có ${matchedItems.length} Skin Yêu Thích Của Bạn!`

  const vpInfo = walletVp !== undefined ? `\n💰 Số dư hiện tại: ${walletVp.toLocaleString()} VP` : ''

  const textBody = isTest
    ? `Đây là thông báo thử nghiệm từ Valorant Daily Shop Tracker tới điện thoại của bạn!\nKết nối thành công! ${accountName ? `(Tài khoản: ${accountName})` : ''}`
    : `Tin cực vui! Skin trong danh sách yêu thích của bạn vừa xuất hiện trong Cửa hàng hôm nay:\n\n${skinNames}${vpInfo}\n\n⏰ Đừng quên đăng nhập game trước khi cửa hàng reset nhé!`

  const mainImage = matchedItems[0]?.displayIcon

  if (settings.ntfyEnabled && settings.ntfyTopic) {
    details.ntfy = await sendNtfyPush(settings.ntfyTopic, title, textBody, mainImage)
  }

  if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
    const tgHtml = isTest
      ? `🔔 <b>[TEST] Thông Báo Daily Shop ${accTag}</b>\n\nĐây là thông báo thử nghiệm tới điện thoại của bạn!\nKết nối thành công! 🎉`
      : `🎯 <b>[VALORANT DAILY SHOP ALERT]</b> 🎯\n${accountName ? `👤 <b>Tài khoản:</b> <code>${accountName}</code>\n` : ''}Skin trong danh sách yêu thích vừa xuất hiện trong Shop hôm nay:\n\n${matchedItems
          .map((i) => `🔫 <b>${i.displayName}</b> - <i>${i.cost} VP</i>`)
          .join('\n')}${walletVp !== undefined ? `\n\n💰 <b>Số dư ví:</b> <code>${walletVp.toLocaleString()} VP</code>` : ''}\n\n⏰ <i>Cửa hàng sẽ reset sau 24h! Vào mua ngay!</i>`
    details.telegram = await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, tgHtml, mainImage)
  }

  if (settings.discordEnabled && settings.discordWebhookUrl) {
    details.discord = await sendDiscordWebhook(settings.discordWebhookUrl, title, textBody, mainImage)
  }

  if (settings.browserEnabled) {
    details.browser = sendBrowserPush(title, textBody, mainImage)
  }

  const success = Object.values(details).some((v) => v === true)
  return { success, details }
}
