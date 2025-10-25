const KEY = 'settings_v1'

const DEFAULTS = {
  emojiOptions: ['😀','🙂','😐','🙁','😭','😡','🤩','😴','🧘','🤒','🤗','🤯','🤤'],
  colorMap: {
    '😀': '#FFF3BF', '🙂': '#FFE8A3', '😐': '#E9EDF1', '🙁': '#FFD6D6', '😭': '#FFC7DB', '😡': '#FFB3B3',
    '🤩': '#E6D4FF', '😴': '#DDECFD', '🧘': '#DFF6EA', '🤒': '#E0F0F0', '🤗': '#FFE3CF', '🤯': '#EAD6FF', '🤤': '#E5F7D7'
  },
  weekStart: 1,
  theme: 'light',
  cloudEnabled: false,
  cloudEnvId: ''
}

function getDefaults() { return JSON.parse(JSON.stringify(DEFAULTS)) }

function getSettings() {
  try {
    const s = wx.getStorageSync(KEY)
    if (s && typeof s === 'object') return Object.assign(getDefaults(), s)
  } catch(e) {}
  return getDefaults()
}

function saveSettings(s) {
  const merged = Object.assign(getDefaults(), s || {})
  try { wx.setStorageSync(KEY, merged) } catch(e) {}
  return merged
}

function setEmojiOptions(arr) { return saveSettings({ emojiOptions: Array.isArray(arr) ? arr : getDefaults().emojiOptions }) }
function setColorMap(map) { return saveSettings({ colorMap: Object.assign({}, getDefaults().colorMap, map || {}) }) }
function setWeekStart(weekStart) { return saveSettings({ weekStart: (weekStart === 0 ? 0 : 1) }) }
function setTheme(theme) { return saveSettings({ theme: (theme === 'dark' ? 'dark' : 'light') }) }
function setCloudEnabled(enabled) { return saveSettings({ cloudEnabled: !!enabled }) }
function setCloudEnvId(envId) { return saveSettings({ cloudEnvId: typeof envId === 'string' ? envId.trim() : '' }) }

module.exports = { KEY, getDefaults, getSettings, saveSettings, setEmojiOptions, setColorMap, setWeekStart, setTheme, setCloudEnabled, setCloudEnvId }
