
import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  LayoutDashboard,
  Save,
  RotateCcw,
} from 'lucide-react'

type Preferences = {
  defaultPage: string
  itemsPerPage: string
  compactMode: boolean
  reduceMotion: boolean
  notifications: boolean
  confirmActions: boolean
}

const defaults: Preferences = {
  defaultPage: 'Dashboard',
  itemsPerPage: '25',
  compactMode: false,
  reduceMotion: false,
  notifications: true,
  confirmActions: true,
}

function Settings() {
  const [activeTab, setActiveTab] = useState('General')
  const [settings, setSettings] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem('lovydate_admin_preferences')
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
    } catch {
      return defaults
    }
  })
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    setSaved(false)
  }, [settings])

  const update = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setSettings(previous => ({ ...previous, [key]: value }))
  }

  const saveSettings = () => {
    localStorage.setItem(
      'lovydate_admin_preferences',
      JSON.stringify(settings)
    )
    setSaved(true)
  }

  const resetSettings = () => {
    setSettings(defaults)
    localStorage.setItem(
      'lovydate_admin_preferences',
      JSON.stringify(defaults)
    )
    setSaved(true)
  }

  const tabs = [
    { label: 'General', icon: SettingsIcon },
    { label: 'Appearance', icon: Palette },
    { label: 'Notifications', icon: Bell },
    { label: 'Dashboard', icon: LayoutDashboard },
  ]

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean
    onChange: (value: boolean) => void
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full p-1 transition-colors ${
        checked ? 'bg-pink-600' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )

  const SettingRow = ({
    title,
    description,
    children,
  }: {
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <div className="flex justify-between items-center gap-4 border-b border-white/[0.06] py-5 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  )

  const Select = ({
    value,
    onChange,
    options,
  }: {
    value: string
    onChange: (value: string) => void
    options: string[]
  }) => (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-pink-500"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )

  return (
    <div className={`p-6 lg:p-8 space-y-7 text-white ${
      settings.reduceMotion ? '[&_*]:!transition-none' : ''
    }`}>
      <div>
        <p className="text-sm text-zinc-500">Management / Preferences</p>
        <h1 className="text-2xl font-semibold mt-1">Settings</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Customize your management panel experience.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-64 shrink-0 bg-[#111114] border border-white/[0.07] rounded-xl p-3 h-fit">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-1 transition ${
                activeTab === label
                  ? 'bg-pink-500/10 text-pink-400'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 bg-[#111114] border border-white/[0.07] rounded-xl p-5 lg:p-7">
          {activeTab === 'General' && (
            <>
              <h2 className="font-semibold">General Preferences</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Personalize your admin workspace.
              </p>

              <div className="mt-5">
                <SettingRow
                  title="Default landing page"
                  description="Choose which page you prefer to open first."
                >
                  <Select
                    value={settings.defaultPage}
                    onChange={value => update('defaultPage', value)}
                    options={['Dashboard', 'Users', 'Content', 'Reports']}
                  />
                </SettingRow>

                <SettingRow
                  title="Confirm sensitive actions"
                  description="Keep confirmation enabled before sensitive actions."
                >
                  <Toggle
                    checked={settings.confirmActions}
                    onChange={value => update('confirmActions', value)}
                  />
                </SettingRow>
              </div>
            </>
          )}

          {activeTab === 'Appearance' && (
            <>
              <h2 className="font-semibold">Appearance</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Adjust interface display preferences.
              </p>

              <div className="mt-5">
                <SettingRow
                  title="Compact layout"
                  description="Prefer a more compact settings layout."
                >
                  <Toggle
                    checked={settings.compactMode}
                    onChange={value => update('compactMode', value)}
                  />
                </SettingRow>

                <SettingRow
                  title="Reduce animations"
                  description="Reduce transitions on this settings page."
                >
                  <Toggle
                    checked={settings.reduceMotion}
                    onChange={value => update('reduceMotion', value)}
                  />
                </SettingRow>
              </div>
            </>
          )}

          {activeTab === 'Notifications' && (
            <>
              <h2 className="font-semibold">Notifications</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Manage your local panel notification preference.
              </p>

              <div className="mt-5">
                <SettingRow
                  title="Admin panel notifications"
                  description="Save your preference for panel notifications."
                >
                  <Toggle
                    checked={settings.notifications}
                    onChange={value => update('notifications', value)}
                  />
                </SettingRow>
              </div>
            </>
          )}

          {activeTab === 'Dashboard' && (
            <>
              <h2 className="font-semibold">Dashboard Preferences</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Choose your preferred dashboard data display.
              </p>

              <div className="mt-5">
                <SettingRow
                  title="Items per page"
                  description="Your preferred table pagination size."
                >
                  <Select
                    value={settings.itemsPerPage}
                    onChange={value => update('itemsPerPage', value)}
                    options={['10', '25', '50', '100']}
                  />
                </SettingRow>
              </div>
            </>
          )}

          <div className="border-t border-white/[0.07] mt-8 pt-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs text-zinc-400">
                {saved ? 'All preferences saved locally.' : 'You have unsaved changes.'}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Preferences are stored in this browser only.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetSettings}
                className="flex items-center gap-2 border border-white/10 hover:bg-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-zinc-300"
              >
                <RotateCcw size={15} /> Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saved}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-5 py-2.5 text-sm font-medium"
              >
                <Save size={16} /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
