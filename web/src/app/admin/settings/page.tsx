'use client'

import { useState } from 'react'

interface Settings {
  // Platform settings
  platformName: string
  platformFee: number
  minGroupSize: number
  maxCampaignDuration: number
  
  // Payment settings
  enablePreAuth: boolean
  preAuthAmount: number
  autoChargeOnSuccess: boolean
  refundFailedGroups: boolean
  
  // Notification settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  notifyOnJoin: boolean
  notifyOnComplete: boolean
  notifyOnFail: boolean
  
  // Security settings
  requireEmailVerification: boolean
  maxLoginAttempts: number
  sessionTimeout: number
}

const defaultSettings: Settings = {
  platformName: 'BuyForce',
  platformFee: 10,
  minGroupSize: 10,
  maxCampaignDuration: 14,
  
  enablePreAuth: true,
  preAuthAmount: 0,
  autoChargeOnSuccess: true,
  refundFailedGroups: true,
  
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  notifyOnJoin: true,
  notifyOnComplete: true,
  notifyOnFail: true,
  
  requireEmailVerification: false,
  maxLoginAttempts: 5,
  sessionTimeout: 30,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure platform settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : saved ? (
            <>✓ Saved</>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.platformFee}
              onChange={(e) => handleChange('platformFee', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Commission taken from each successful group purchase</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Group Size
            </label>
            <input
              type="number"
              min="2"
              max="1000"
              value={settings.minGroupSize}
              onChange={(e) => handleChange('minGroupSize', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Default minimum participants for campaigns</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Campaign Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={settings.maxCampaignDuration}
              onChange={(e) => handleChange('maxCampaignDuration', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable Pre-Authorization</p>
              <p className="text-sm text-gray-500">Hold customer funds until group succeeds</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enablePreAuth}
                onChange={(e) => handleChange('enablePreAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Charge on Success</p>
              <p className="text-sm text-gray-500">Automatically capture funds when group reaches target</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoChargeOnSuccess}
                onChange={(e) => handleChange('autoChargeOnSuccess', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Refund Failed Groups</p>
              <p className="text-sm text-gray-500">Release pre-auth when group fails to reach target</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.refundFailedGroups}
                onChange={(e) => handleChange('refundFailedGroups', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Channels</h3>
            {[
              { key: 'emailNotifications', label: 'Email Notifications' },
              { key: 'smsNotifications', label: 'SMS Notifications' },
              { key: 'pushNotifications', label: 'Push Notifications' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof Settings] as boolean}
                    onChange={(e) => handleChange(key as keyof Settings, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Events</h3>
            {[
              { key: 'notifyOnJoin', label: 'User Joins Group' },
              { key: 'notifyOnComplete', label: 'Group Completes' },
              { key: 'notifyOnFail', label: 'Group Fails' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof Settings] as boolean}
                    onChange={(e) => handleChange(key as keyof Settings, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-500">Users must verify email before joining groups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Lock account after X failed attempts</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Require re-login after X days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Clear All Data</p>
              <p className="text-sm text-gray-500">Remove all campaigns, orders, and user data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Clear Data
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Reset Settings</p>
              <p className="text-sm text-gray-500">Restore all settings to default values</p>
            </div>
            <button 
              onClick={() => setSettings(defaultSettings)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
