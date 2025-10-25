const cloud = require('./cloud.js')
const storage = require('./storage.js')

async function fetchRemoteAll(coll, userId) {
  const totalRes = await coll.where({ userId }).count()
  const total = (totalRes && totalRes.total) || 0
  const pageSize = 100
  const out = {}
  for (let i = 0; i < total; i += pageSize) {
    const res = await coll.where({ userId }).skip(i).limit(pageSize).get()
    const list = (res && res.data) || []
    for (const it of list) {
      if (!it || !it.dateKey) continue
      out[it.dateKey] = { mood: it.mood || '', note: it.note || '', ts: it.ts || 0 }
    }
  }
  return out
}

async function upsertRemote(coll, id, doc) {
  try {
    const r = await coll.doc(id).update({ data: doc })
    if (r && r.stats && r.stats.updated > 0) return true
  } catch (e) {}
  try {
    await coll.add({ data: Object.assign({ _id: id }, doc) })
    return true
  } catch (e) { return false }
}

async function removeRemote(coll, id) {
  try { await coll.doc(id).remove(); return true } catch (e) { return false }
}

async function syncAll() {
  const ok = cloud.initCloud()
  if (!ok) throw new Error('cloud not inited')
  const userId = await cloud.getOpenId()
  const db = cloud.getDb()
  const coll = db.collection('moods')

  const remote = await fetchRemoteAll(coll, userId)
  const local = storage.getAllEntries()

  const keys = new Set([...Object.keys(local), ...Object.keys(remote)])
  let updatedLocal = 0
  let updatedRemote = 0

  for (const k of keys) {
    const l = local[k] || null
    const r = remote[k] || null
    const lts = l && l.ts ? l.ts : 0
    const rts = r && r.ts ? r.ts : 0

    if (!l && r) {
      storage.setMood(k, r.mood || '')
      storage.setNote(k, r.note || '')
      updatedLocal++
      continue
    }
    if (l && !r) {
      if (l.mood || l.note) {
        const id = userId + '_' + k
        const doc = { userId, dateKey: k, mood: l.mood || '', note: l.note || '', ts: l.ts || Date.now() }
        const ok = await upsertRemote(coll, id, doc)
        if (ok) updatedRemote++
      }
      continue
    }
    if (!l && !r) continue

    if (lts > rts) {
      if (l.mood || l.note) {
        const id = userId + '_' + k
        const doc = { userId, dateKey: k, mood: l.mood || '', note: l.note || '', ts: l.ts || Date.now() }
        const ok = await upsertRemote(coll, id, doc)
        if (ok) updatedRemote++
      } else {
        const id = userId + '_' + k
        await removeRemote(coll, id)
      }
    } else if (rts > lts) {
      storage.setMood(k, r.mood || '')
      storage.setNote(k, r.note || '')
      updatedLocal++
    }
  }

  return { updatedLocal, updatedRemote }
}

module.exports = { syncAll }
