const storage = require('./utils/storage.js')
const cloud = require('./utils/cloud.js')
const sync = require('./utils/sync.js')
const settings = require('./utils/settings.js')

App({
  onLaunch() {
    try { storage.migrateIfNeeded() } catch (e) {}
    try {
      const ok = cloud.initCloud()
      if (ok) {
        setTimeout(() => { try { sync.syncAll() } catch(e) {} }, 0)
      }
    } catch (e) {}
  },
  onLocalDataChange() {
    try {
      const s = settings.getSettings()
      if (!s.cloudEnabled) return
      const ok = cloud.initCloud()
      if (!ok) return
      setTimeout(() => { try { sync.syncAll() } catch(e) {} }, 0)
    } catch (e) {}
  }
})
