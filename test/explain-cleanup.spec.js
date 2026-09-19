import { test, expect } from '@playwright/test'

const prefix = 'dsh-whale-maid-mascot:explain-session:'
const idsKey = 'dsh-whale-maid-mascot:explain-sessions'

async function loadClient(page, mappings, ids = Object.values(mappings)) {
  await page.route('**/cleanup-test', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><head><title>Cleanup regression</title></head><body></body></html>',
  }))
  await page.goto('/cleanup-test')
  await page.evaluate(({ mappings, ids, prefix, idsKey }) => {
    for (const [source, id] of Object.entries(mappings)) localStorage.setItem(prefix + source, id)
    localStorage.setItem(idsKey, JSON.stringify(ids))
    const byId = {}
    for (const id of [...Object.keys(mappings), ...ids]) byId[id] = { id, title: id }
    window.sessionSnapshot = { phase: 'ready', current: null, byId }
    window.sessionListeners = []
    window.emitSessions = () => window.sessionListeners.forEach(fn => fn())
    window.__ModuleLoader__ = {
      load(spec) {
        spec.factory().apply({
          sessions: {
            list: {
              getSnapshot: () => window.sessionSnapshot,
              subscribe(fn) {
                window.sessionListeners.push(fn)
                return () => {}
              },
            },
          },
          effect(fn) { window.cleanupClient = fn() },
        })
      },
    }
  }, { mappings, ids, prefix, idsKey })
  await page.addScriptTag({ url: '/dsh/client.js' })
  page.on('dialog', dialog => dialog.accept())
}

async function tracked(page) {
  return page.evaluate(({ prefix, idsKey }) => ({
    mappings: Object.fromEntries(Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .map(key => [key.slice(prefix.length), localStorage.getItem(key)])),
    ids: JSON.parse(localStorage.getItem(idsKey) || '[]'),
  }), { prefix, idsKey })
}

async function openPanel(page) {
  await page.locator('.wm-root').dispatchEvent('contextmenu', { clientX: 100, clientY: 100 })
  await page.getByRole('menuitem', { name: '打开解释面板' }).click()
}

async function clearRecords(page) {
  await page.getByTitle('清理解释记录').click()
}

async function makeOrphans(page, sources) {
  await page.evaluate(sources => {
    for (const source of sources) delete window.sessionSnapshot.byId[source]
    window.emitSessions()
  }, sources)
}

test('manual cleanup retains failed records and retries only the failed sessions', async ({ page }) => {
  const requests = []
  let fail = true
  await page.route('**/__chameleon/session/delete', route => {
    const { sessionId } = route.request().postDataJSON()
    requests.push(sessionId)
    return route.fulfill({ json: { ok: !(fail && sessionId === 'failed'), error: 'unavailable' } })
  })
  await loadClient(page, { sourceA: 'deleted', sourceB: 'failed' }, ['deleted', 'failed', 'unmapped'])
  await openPanel(page)
  await clearRecords(page)
  await expect(page.locator('.wm-explain-panel-body')).toContainText('1 个隐藏会话删除失败')
  await expect.poll(() => tracked(page)).toEqual({ mappings: { sourceB: 'failed' }, ids: ['failed'] })
  expect(requests.sort()).toEqual(['deleted', 'failed', 'unmapped'])

  fail = false
  await clearRecords(page)
  await expect.poll(() => tracked(page)).toEqual({ mappings: {}, ids: [] })
  expect(requests.filter(id => id === 'failed')).toHaveLength(2)
  expect(requests.filter(id => id === 'deleted')).toHaveLength(1)
})

test('a network failure keeps manual cleanup retryable', async ({ page }) => {
  let fail = true
  await page.route('**/__chameleon/session/delete', route => fail
    ? route.abort('failed')
    : route.fulfill({ json: { ok: true } }))
  await loadClient(page, { source: 'explain' })
  await openPanel(page)
  await clearRecords(page)
  await expect(page.locator('.wm-explain-panel-body')).toContainText('删除失败')
  expect(await tracked(page)).toEqual({ mappings: { source: 'explain' }, ids: ['explain'] })
  fail = false
  await clearRecords(page)
  await expect.poll(() => tracked(page)).toEqual({ mappings: {}, ids: [] })
})

test('automatic cleanup retains tracking until deletion succeeds and retries failures', async ({ page }) => {
  const requests = []
  await page.route('**/__chameleon/session/delete', route => { requests.push(route) })
  await loadClient(page, { source: 'explain' })
  await openPanel(page)
  await makeOrphans(page, ['source'])
  await expect.poll(() => requests.length).toBe(1)
  expect(await tracked(page)).toEqual({ mappings: { source: 'explain' }, ids: ['explain'] })

  // Join the pending automatic cleanup through the public cleanup button.
  // Its failure message is a deterministic signal that the shared request settled.
  await clearRecords(page)
  await requests[0].fulfill({ json: { ok: false, error: 'unavailable' } })
  await expect(page.locator('.wm-explain-panel-body')).toContainText('删除失败')
  expect(requests).toHaveLength(1)
  expect(await tracked(page)).toEqual({ mappings: { source: 'explain' }, ids: ['explain'] })

  await page.evaluate(() => window.emitSessions())
  await expect.poll(() => requests.length).toBe(2)
  await requests[1].fulfill({ json: { ok: true } })
  await expect.poll(() => tracked(page)).toEqual({ mappings: {}, ids: [] })
})

test('repeated session updates and manual cleanup share an in-flight deletion', async ({ page }) => {
  const requests = []
  await page.route('**/__chameleon/session/delete', route => { requests.push(route) })
  await loadClient(page, { source: 'explain' })
  await openPanel(page)
  await makeOrphans(page, ['source'])
  await expect.poll(() => requests.length).toBe(1)
  await page.evaluate(() => { window.emitSessions(); window.emitSessions() })
  await clearRecords(page)
  expect(await tracked(page)).toEqual({ mappings: { source: 'explain' }, ids: ['explain'] })
  await requests[0].fulfill({ json: { ok: true } })
  await expect(page.locator('.wm-explain-panel-body')).toContainText('已清理解释记录')
  expect(requests).toHaveLength(1)
  expect(await tracked(page)).toEqual({ mappings: {}, ids: [] })
})

for (const automatic of [false, true]) {
  test(`${automatic ? 'automatic' : 'manual'} cleanup preserves new and replaced mappings created while deleting`, async ({ page }) => {
    const requests = []
    await page.route('**/__chameleon/session/delete', route => { requests.push(route) })
    await loadClient(page, { source: 'old' })
    if (automatic) {
      await makeOrphans(page, ['source'])
    } else {
      await openPanel(page)
      await clearRecords(page)
    }
    await expect.poll(() => requests.length).toBe(1)
    await page.evaluate(({ prefix, idsKey }) => {
      localStorage.setItem(prefix + 'source', 'replacement')
      localStorage.setItem(prefix + 'newSource', 'newExplanation')
      localStorage.setItem(idsKey, JSON.stringify(['old', 'replacement', 'newExplanation']))
    }, { prefix, idsKey })
    await requests[0].fulfill({ json: { ok: true } })
    await expect.poll(() => tracked(page)).toEqual({
      mappings: { source: 'replacement', newSource: 'newExplanation' },
      ids: ['replacement', 'newExplanation'],
    })
  })
}

test('a ready snapshot removes stale tracking without deleting an absent explanation', async ({ page }) => {
  const requests = []
  await page.route('**/__chameleon/session/delete', route => {
    requests.push(route.request().postDataJSON())
    return route.fulfill({ json: { ok: true } })
  })
  await loadClient(page, { source: 'missing' })
  await page.evaluate(() => {
    window.sessionSnapshot.phase = 'loading'
    window.sessionSnapshot.byId = {}
    window.emitSessions()
  })
  expect(await tracked(page)).toEqual({ mappings: { source: 'missing' }, ids: ['missing'] })
  await page.evaluate(() => {
    window.sessionSnapshot.phase = 'ready'
    window.emitSessions()
  })
  expect(await tracked(page)).toEqual({ mappings: {}, ids: [] })
  expect(requests).toHaveLength(0)
})
