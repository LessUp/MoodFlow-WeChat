const settings = require('../../utils/settings.js')
const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')
const sync = require('../../utils/sync.js')

Page({
  data: {
    weekStart: 1,
    emojiText: '',
    colorItems: [],
    cloudEnabled: false,
    cloudEnvId: '',
    syncStatus: '',
    theme: 'light',
    importText: ''
  },
  goPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  },
  onShow() {
    const s = settings.getSettings()
    const emojiOptions = s.emojiOptions || []
    const emojiText = emojiOptions.join('')
    const cm = s.colorMap || {}
    const colorItems = emojiOptions.map(em => ({ em, color: cm[em] || '' }))
    const theme = s.theme || 'light'
    this.setData({ weekStart: s.weekStart, emojiText, colorItems, cloudEnabled: !!s.cloudEnabled, cloudEnvId: s.cloudEnvId || '', theme })
    try { wx.setNavigationBarColor({ frontColor: theme === 'dark' ? '#ffffff' : '#000000', backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff' }) } catch(e) {}
  },
  onThemeTap(e) {
    const val = e.currentTarget.dataset.val === 'dark' ? 'dark' : 'light'
    this.setData({ theme: val })
    settings.setTheme(val)
    wx.showToast({ title: '已切换', icon: 'success', duration: 500 })
  },
  onCloudSwitch(e) {
    const v = !!e.detail.value
    this.setData({ cloudEnabled: v })
    settings.setCloudEnabled(v)
    wx.showToast({ title: v ? '云同步已启用' : '云同步已关闭', icon: 'success', duration: 600 })
  },
  onEnvIdInput(e) {
    this.setData({ cloudEnvId: e.detail.value })
  },
  onSaveCloud() {
    const envId = (this.data.cloudEnvId || '').trim()
    settings.setCloudEnvId(envId)
    const ok = cloud.initCloud()
    wx.showToast({ title: ok ? '云配置已保存' : '云配置已保存', icon: 'success', duration: 700 })
  },
  async onSyncNow() {
    this.setData({ syncStatus: '同步中...' })
    try {
      const ok = cloud.initCloud()
      if (!ok) {
        this.setData({ syncStatus: '未启用或配置云环境' })
        wx.showToast({ title: '请启用云并配置环境ID', icon: 'none' })
        return
      }
      const r = await sync.syncAll()
      const msg = `本地更新${r.updatedLocal}，云端更新${r.updatedRemote}`
      this.setData({ syncStatus: msg })
      wx.showToast({ title: '同步完成', icon: 'success' })
    } catch (e) {
      this.setData({ syncStatus: '同步失败' })
      wx.showToast({ title: '同步失败', icon: 'none' })
    }
  },
  onWeekTap(e) {
    const val = Number(e.currentTarget.dataset.val)
    this.setData({ weekStart: val })
    settings.setWeekStart(val)
    wx.showToast({ title: '已切换', icon: 'success', duration: 500 })
  },
  onEmojiInput(e) {
    this.setData({ emojiText: e.detail.value })
  },
  onSaveEmoji() {
    const arr = Array.from(this.data.emojiText).filter(x => x && x.trim())
    settings.setEmojiOptions(arr)
    const cm = settings.getSettings().colorMap || {}
    const colorItems = arr.map(em => ({ em, color: cm[em] || '' }))
    this.setData({ colorItems })
    wx.showToast({ title: '已保存', icon: 'success', duration: 700 })
  },
  onColorInput(e) {
    const idx = Number(e.currentTarget.dataset.idx)
    const val = e.detail.value
    const list = this.data.colorItems.slice()
    if (!isNaN(idx) && list[idx]) {
      list[idx].color = val
      this.setData({ colorItems: list })
    }
  },
  onSaveColors() {
    const list = this.data.colorItems || []
    const map = {}
    const hex = /^#?[0-9a-fA-F]{6}$/
    for (const it of list) {
      if (it && it.em) {
        let c = (it.color || '').trim()
        if (c) {
          if (!hex.test(c)) {
            wx.showToast({ title: '颜色格式需为#RRGGBB', icon: 'none' })
            return
          }
          if (c[0] !== '#') c = '#' + c
        }
        map[it.em] = c
      }
    }
    settings.setColorMap(map)
    wx.showToast({ title: '颜色已保存', icon: 'success', duration: 700 })
  },
  onReset() {
    const d = settings.getDefaults()
    settings.saveSettings(d)
    const emojiText = d.emojiOptions.join('')
    const colorItems = d.emojiOptions.map(em => ({ em, color: d.colorMap[em] || '' }))
    this.setData({ weekStart: d.weekStart, emojiText, colorItems })
    wx.showToast({ title: '已重置', icon: 'success', duration: 700 })
  },
  onExport() {
    const data = storage.getAllEntries()
    const text = JSON.stringify(data)
    wx.setClipboardData({ data: text, success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' }) })
  },
  onClearAll() {
    wx.showModal({ title: '确认', content: '确定清除全部心情记录？此操作不可恢复', success: (res) => {
      if (res.confirm) {
        try {
          wx.removeStorageSync('mood_records_v1')
          wx.removeStorageSync('mood_records_v2')
        } catch (e) {}
        wx.showToast({ title: '已清除', icon: 'success' })
      }
    } })
  },
  onImportInput(e) {
    this.setData({ importText: e.detail.value })
  },
  onImportApply() {
    const t = (this.data.importText || '').trim()
    if (!t) { wx.showToast({ title: '请输入JSON', icon: 'none' }); return }
    try {
      const obj = JSON.parse(t)
      const r = storage.mergeEntries(obj)
      wx.showToast({ title: '导入完成', icon: 'success' })
      this.setData({ importText: '' })
      if (r && typeof r.updated === 'number') this.setData({ syncStatus: '合并更新 ' + r.updated })
    } catch (e) {
      wx.showToast({ title: 'JSON格式错误', icon: 'none' })
    }
  }
})
