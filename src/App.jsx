import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ChevronDown } from 'lucide-react'
import WelcomeScreen from './components/WelcomeScreen'
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
  const [showWelcome, setShowWelcome] = useState(true)
  const [showEveningCheck, setShowEveningCheck] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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

  const handleWelcomeSelectProfile = (id) => {
    handleProfileChange(id)
    setShowWelcome(false)
    setActiveTab('dashboard')
  }

  const handleWelcomeAddProfile = () => {
    setShowWelcome(false)
    setActiveTab('profile')
  }

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null

  // Show welcome screen
  if (showWelcome) {
    return (
      <>
        <WelcomeScreen
          profiles={profiles}
          onSelectProfile={handleWelcomeSelectProfile}
          onAddProfile={handleWelcomeAddProfile}
        />
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-5 right-5 z-50 p-2.5 bg-white/5 border border-white/10 rounded-xl
                     text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
        >
          <SettingsIcon size={18} />
        </button>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => setShowWelcome(true)}
            className="text-emerald-400 font-black text-lg tracking-tight hover:text-emerald-300 transition-colors"
          >
            VITALS
          </button>
          <div className="flex items-center gap-2">
            {profiles.length > 0 && (
              <div className="relative">
                <select
                  value={activeProfileId || ''}
                  onChange={e => handleProfileChange(e.target.value)}
                  className="appearance-none bg-white/[0.06] border border-white/[0.08] rounded-xl
                             pl-3 pr-7 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none
                             focus:border-emerald-500 cursor-pointer"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
            <button onClick={() => setShowSettings(true)}
              className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl transition-colors">
              <SettingsIcon size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-5 pb-28">
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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showEveningCheck && activeProfile && (
        <EveningCheckModal
          profile={activeProfile}
          onClose={() => setShowEveningCheck(false)}
        />
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
