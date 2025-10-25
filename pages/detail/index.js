const storage = require('../../utils/storage.js')
const settings = require('../../utils/settings.js')

Page({
  data: {
    dateKey: '',
    mood: '',
    note: '',
    emojiOptions: ['😀','🙂','😐','🙁','😭','😡','🤩','😴','🧘','🤒','🤗','🤯','🤤'],
    theme: 'light'
  },
  onLoad(options) {
    const dateKey = (options && options.dateKey) ? options.dateKey : ''
    const mood = dateKey ? storage.getMood(dateKey) : ''
    const note = dateKey ? storage.getNote(dateKey) : ''
    let s
    try { s = settings.getSettings() } catch(e) { s = null }
    const emojiOptions = s && s.emojiOptions && s.emojiOptions.length ? s.emojiOptions : this.data.emojiOptions
    const theme = s && s.theme ? s.theme : 'light'
    this.setData({ dateKey, mood, note, emojiOptions, theme })
  },
  onShow() {
    try {
      const s = settings.getSettings()
      const theme = s.theme || 'light'
      this.setData({ theme })
      try { wx.setNavigationBarColor({ frontColor: theme === 'dark' ? '#ffffff' : '#000000', backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff' }) } catch(e) {}
    } catch(e) {}
  },
  onChooseEmoji(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({ mood })
  },
  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },
  onSave() {
    const { dateKey, mood, note } = this.data
    if (!dateKey) return
    storage.setMood(dateKey, mood || '')
    storage.setNote(dateKey, note || '')
    wx.showToast({ title: '已保存', icon: 'success', duration: 600 })
    setTimeout(() => { wx.navigateBack({ delta: 1 }) }, 350)
  },
  onClear() {
    const { dateKey } = this.data
    if (!dateKey) return
    storage.clearEntry(dateKey)
    wx.showToast({ title: '已清除', icon: 'success', duration: 600 })
    setTimeout(() => { wx.navigateBack({ delta: 1 }) }, 350)
  }
})
