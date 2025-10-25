const storage = require('../../utils/storage.js')
const settings = require('../../utils/settings.js')
const dateUtil = require('../../utils/date.js')

function computeStreak(all) {
  let streak = 0
  const d = new Date()
  for (;;) {
    const key = dateUtil.formatDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const e = all[key]
    if (e && (e.mood || e.note)) streak++
    else break
    d.setDate(d.getDate() - 1)
  }
  return streak
}

Page({
  data: {
    theme: 'light',
    emojiOptions: [],
    moodCounts: [],
    monthMoodCounts: [],
    totalCount: 0,
    monthLabel: '',
    streakDays: 0
  },
  onShow() {
    try {
      const s = settings.getSettings()
      const theme = s.theme || 'light'
      this.setData({ theme })
      try { wx.setNavigationBarColor({ frontColor: theme === 'dark' ? '#ffffff' : '#000000', backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff' }) } catch(e) {}
    } catch(e) {}
    this.computeStats()
  },
  computeStats() {
    const s = settings.getSettings()
    const order = s.emojiOptions || []
    const all = storage.getAllEntries()

    const moodCountMap = {}
    let total = 0
    for (const k in all) {
      const e = all[k]
      if (e && (e.mood || e.note)) total++
      if (e && e.mood) moodCountMap[e.mood] = (moodCountMap[e.mood] || 0) + 1
    }

    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const prefix = y + '-' + (m < 10 ? '0' + m : '' + m)

    const monthCountMap = {}
    for (const k in all) {
      if (k.startsWith(prefix)) {
        const e = all[k]
        if (e && e.mood) monthCountMap[e.mood] = (monthCountMap[e.mood] || 0) + 1
      }
    }

    function orderedList(map) {
      const arr = []
      for (const em of order) {
        if (map[em]) arr.push({ mood: em, count: map[em] })
      }
      for (const key in map) {
        if (order.indexOf(key) === -1) arr.push({ mood: key, count: map[key] })
      }
      return arr
    }

    const moodCounts = orderedList(moodCountMap)
    const monthMoodCounts = orderedList(monthCountMap)
    const monthLabel = dateUtil.monthLabel(y, m)
    const streak = computeStreak(all)

    this.setData({ emojiOptions: order, moodCounts, monthMoodCounts, totalCount: total, monthLabel, streakDays: streak })
  }
})
