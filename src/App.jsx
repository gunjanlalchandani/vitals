import { useState, useEffect } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Dashboard from './components/Dashboard'
import ProfileTab from './components/profiles/ProfileTab'
import DietPlanTab from './components/diet/DietPlanTab'
import DailyLogTab from './components/log/DailyLogTab'
import MetricsTab from './components/metrics/MetricsTab'
import EveningCheckModal from './components/EveningCheckModal'
import Settings from './components/Settings'
import {
  getProfiles, getActiveProfileId, setActiveProfileId
} from './utils/storage'
import { scheduleEveningCheck } from './utils/notifications'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileIdState] = useState(null)
  const [showEveningCheck, setShowEveningCheck] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load profiles on mount
  useEffect(() => {
    const stored = getProfiles()
    setProfiles(stored)
    const activeId = getActiveProfileId()
    if (activeId && stored.find(p => p.id === activeId)) {
      setActiveProfileIdState(activeId)
    } else if (stored.length > 0) {
      setActiveProfileIdState(stored[0].id)
      setActiveProfileId(stored[0].id)
    }
  }, [])

  // Schedule 6 PM check
  useEffect(() => {
    const cleanup = scheduleEveningCheck(() => {
      if (activeProfileId) setShowEveningCheck(true)
    })
    return cleanup
  }, [activeProfileId])

  const handleProfileChange = (id) => {
    setActiveProfileIdState(id)
    setActiveProfileId(id)
  }

  const handleProfilesChange = (updated) => {
    setProfiles(updated)
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-brand-400 font-bold text-lg tracking-tight">Vitals</span>
          <div className="flex items-center gap-2">
            {profiles.length > 0 && (
              <div className="relative">
                <select
                  value={activeProfileId || ''}
                  onChange={e => handleProfileChange(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 rounded-xl
                             pl-3 pr-7 py-1.5 text-sm font-medium text-slate-100 focus:outline-none
                             focus:border-brand-500 cursor-pointer"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors">
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard profile={activeProfile} onTabChange={setActiveTab} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            profiles={profiles}
            activeProfileId={activeProfileId}
            onProfilesChange={handleProfilesChange}
            onProfileChange={handleProfileChange}
          />
        )}
        {activeTab === 'diet' && (
          <DietPlanTab profile={activeProfile} />
        )}
        {activeTab === 'log' && (
          <DailyLogTab profile={activeProfile} />
        )}
        {activeTab === 'metrics' && (
          <MetricsTab profile={activeProfile} />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Evening check modal */}
      {showEveningCheck && activeProfile && (
        <EveningCheckModal
          profile={activeProfile}
          onClose={() => setShowEveningCheck(false)}
        />
      )}

      {/* Settings */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
