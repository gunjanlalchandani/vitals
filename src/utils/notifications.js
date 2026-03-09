export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleEveningCheck(onTrigger) {
  // Check every minute if it's 6:00 PM
  const NOTIF_HOUR = 18
  const NOTIF_MIN = 0
  const STORAGE_KEY = 'vitals_last_evening_notif'

  const check = () => {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    const dateStr = now.toISOString().split('T')[0]
    const lastNotif = localStorage.getItem(STORAGE_KEY)

    if (h === NOTIF_HOUR && m === NOTIF_MIN && lastNotif !== dateStr) {
      localStorage.setItem(STORAGE_KEY, dateStr)
      onTrigger()

      if (Notification.permission === 'granted') {
        new Notification('Vitals — Plan Tomorrow', {
          body: "Here's your food plan for tomorrow. Are you good to go, or would you like some changes?",
          icon: '/icon-192.png',
          tag: 'evening-check'
        })
      }
    }
  }

  check() // run once immediately
  const interval = setInterval(check, 60_000) // every minute
  return () => clearInterval(interval)
}
