import { useState } from 'react'
import { X, Eye, EyeOff, Check } from 'lucide-react'
import { getSettings, saveSettings } from '../utils/storage'
import { requestNotificationPermission } from '../utils/notifications'

export default function Settings({ onClose }) {
  const settings = getSettings()
  const [apiKey, setApiKey] = useState(settings.claudeApiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')

  const handleSave = () => {
    saveSettings({ claudeApiKey: apiKey.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNotifPermission = async () => {
    const granted = await requestNotificationPermission()
    setNotifGranted(granted)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Settings</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Claude API key */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claude API</div>
          <p className="text-xs text-slate-400">
            Required for AI-powered recipe generation and weekly meal plan creation.
            Get your key at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
               className="text-brand-400 underline">console.anthropic.com</a>
          </p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="pr-12"
            />
            <button
              onClick={() => setShowKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button onClick={handleSave} className="btn-primary">
            {saved ? <><Check size={16} className="inline mr-1.5" />Saved!</> : 'Save API Key'}
          </button>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notifications</div>
          <p className="text-xs text-slate-400">
            Enable push notifications to get the 6 PM evening meal plan check-in reminder.
          </p>
          {notifGranted ? (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check size={16} />
              Notifications enabled
            </div>
          ) : (
            <button onClick={handleNotifPermission} className="btn-secondary">
              Enable notifications
            </button>
          )}
        </div>

        {/* About */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-600">Vitals v1.0</div>
          <div className="text-xs text-slate-600">Data stored locally on your device</div>
        </div>
      </div>
    </div>
  )
}
