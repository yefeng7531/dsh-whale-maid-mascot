// Browser half of the dsh whale-maid mascot plugin.
//
// Renders DeepSeek 娘 (blue whale maid) in the corner of the DeepSeek Harness
// web page, using the original JPGs the user provided:
//   /whale-maid-mascot/a.png  -> normal full-body pose (style A)
//   /whale-maid-mascot/b.png  -> chibi waving pose (style B)
//   /whale-maid-mascot/c.png  -> extra chibi pose (style C)
// Images were background-removed (transparent PNG) ahead of time.
//
// Interactions:
//   - style button (top-left) switches style A/B/C, remembered in localStorage
//   - affection system: clicks add points, levels change bubble lines
//   - drag anywhere to move
//   - click head / chest / legs for different reactions
//   - rapid clicks (10 within 2.6s) make her angry
//   - chest clicks get a special shy reaction (blush + 😳)
//   - top-right ✕ collapses to a small restore button
//
// Hand-written in the lazy-CJS bundle protocol used by dsh client plugins
// (window.__ModuleLoader__.load with a factory returning cordis exports),
// so no build step and no imports from dsh client packages are needed.
if (!window.__ModuleLoader__ || typeof window.__ModuleLoader__.load !== 'function') {
  console.warn('[whale-maid-mascot] __ModuleLoader__ missing; client plugin skipped')
} else {
  window.__ModuleLoader__.load({
    id: 'dsh-whale-maid-mascot',
    factory: function (require) {
      var module = { exports: {} }
      var exports = module.exports
      var React = null
      try { React = require('react') } catch (e) {}

      var ASSET_A = '/whale-maid-mascot/a.png'
      var ASSET_B = '/whale-maid-mascot/b.png'
      var ASSET_C = '/whale-maid-mascot/c.png'
      var LS_POS = 'dsh-whale-maid-mascot:pos'
      var LS_HIDDEN = 'dsh-whale-maid-mascot:hidden'
      var LS_STYLE = 'dsh-whale-maid-mascot:style'
      var LS_LOVE = 'dsh-whale-maid-mascot:love'
      var LS_EXPLAIN_SESSIONS = 'dsh-whale-maid-mascot:explain-sessions'
      var LS_NOTIF = 'dsh-whale-maid-mascot:notif'
      var LS_PROMPTS = 'dsh-whale-maid-mascot:prompts'

      var HEAD_LINES = [
        '摸摸头~ 嘿嘿，不要弄乱我的呆毛啦！',
        '我可是戴着女仆头饰的，轻一点~',
        '耳朵不是玩具啦！',
      ]
      var HEAD_LINES_1 = [
        '嘿嘿，你每天都来摸我头呢~',
        '头饰歪了的话要帮我戴好哦！',
      ]
      var HEAD_LINES_2 = [
        '最喜欢你摸头了，再摸一下嘛~',
        '呆毛被你摸得更乱了啦~',
      ]
      var HEAD_LINES_3 = [
        '你的手好温柔……再久一点也没关系',
        '摸头的时候，我的心跳会变快哦',
      ]
      var HEAD_LINES_4 = [
        '主人专属的摸摸头，好幸福……',
        '这辈子都不想让你放手啦',
      ]
      var CHEST_LINES = [
        '呀！那里……不可以啦 (///▽///)',
        '变、变态！……但也不是不行啦~',
        '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ 心、心跳好快……',
      ]
      var CHEST_LINES_1 = [
        '喂……那里还是不行啦！',
        '再这样我要告诉主人了！',
      ]
      var CHEST_LINES_2 = [
        '哼……只、只准你一个人啦！',
        '心跳声被你听到了……好害羞',
      ]
      var CHEST_LINES_3 = [
        '那里……只有你可以……',
        '已经、已经不行了啦……好害羞',
      ]
      var CHEST_LINES_4 = [
        '主人……请、请温柔一点……',
        '这里已经是主人的专属领地了哦',
      ]
      var LEG_LINES = [
        '别戳我裙子啦~',
        '腿腿才不给碰！',
        '袜子才不臭呢！',
      ]
      var LEG_LINES_1 = [
        '裙子不可以掀啦！',
        '腿腿……只给喜欢的人碰一点点哦',
      ]
      var LEG_LINES_2 = [
        '腿腿给你靠一下下哦',
        '裙子可以让你拉一下下，就一下！',
      ]
      var LEG_LINES_3 = [
        '腿腿可以借你枕……别乱动啦',
        '裙子今天也是为你穿的哦',
      ]
      var LEG_LINES_4 = [
        '腿腿和心，都是主人的',
        '裙摆和未来，都想交给主人',
      ]
      var SKIRT_LINES = [
        '裙摆要飞起来啦~',
        '围裙上可是有小鲸鱼的哦！',
      ]
      var SKIRT_LINES_1 = [
        '裙摆飘起来啦，不许看！',
        '小鲸鱼围裙可爱吧？',
      ]
      var SKIRT_LINES_2 = [
        '裙摆是专门为你转的哦~',
        '围裙上的小鲸鱼也在看着你呢',
      ]
      var SKIRT_LINES_3 = [
        '裙摆飞起来的话，只给你看！',
        '想牵我的手吗？',
      ]
      var SKIRT_LINES_4 = [
        '裙摆只为主人飘起来',
        '今天也是主人的小鲸鱼女仆哦',
      ]
      var ANGRY_LINES = [
        '再戳我就要生气了！💢',
        '哼！三连戳，不理你了！',
        '💢 生气中……快哄我！',
      ]
      var STYLE_LINES = {
        a: ['换回立绘形态~', '经典女仆装，好看吧！'],
        b: ['切换 Q 版形态~', 'Q 版也是蓝发女仆哦！'],
        c: ['切换新立绘形态~', '新的 Q 版女仆，喜欢吗？'],
      }
      var PHRASES = {
        head: [HEAD_LINES, HEAD_LINES_1, HEAD_LINES_2, HEAD_LINES_3, HEAD_LINES_4],
        chest: [CHEST_LINES, CHEST_LINES_1, CHEST_LINES_2, CHEST_LINES_3, CHEST_LINES_4],
        legs: [LEG_LINES, LEG_LINES_1, LEG_LINES_2, LEG_LINES_3, LEG_LINES_4],
        skirt: [SKIRT_LINES, SKIRT_LINES_1, SKIRT_LINES_2, SKIRT_LINES_3, SKIRT_LINES_4],
      }
      var LOVE_LEVELS = [0, 10, 30, 60, 100]
      var LOVE_LEVEL_NAMES = ['陌生', '熟悉', '亲密', '心动', '专属']
      var SKIT_LINES = [
        '好安静呀……主人还在忙吗？',
        '（偷偷练习女仆礼仪中……）',
        '♪～哼哼～♪',
        '好想被主人摸摸头呀……',
        '今天也要加油守护主人的对话！',
        '（看着屏幕发呆）',
      ]
      var SKIT_HIGH_LINES = [
        '主人，忙完了记得摸摸我哦～',
        '和主人在一起的时间，最喜欢了。',
        '要一直一直陪着主人。',
      ]
      var COMMON_PROMPTS = [
        { label: '📝 总结当前会话', text: '请总结一下我们当前对话的要点。' },
        { label: '🔍 检查代码问题', text: '请检查当前上下文中的代码，指出潜在问题和改进建议。' },
        { label: '📖 解释术语', text: '请用通俗易懂的方式解释一下我选中的术语/概念。' },
        { label: '✏️ 改进这段文字', text: '请帮我改进下面这段文字的表达，使其更清晰、更专业：' },
        { label: '🧪 写测试', text: '请为当前代码编写单元测试。' },
      ]

      function getCustomPrompts() {
        try {
          var raw = storeGet(LS_PROMPTS)
          var list = raw ? JSON.parse(raw) : null
          if (Array.isArray(list)) {
            return list.filter(function (p) {
              return p && typeof p.label === 'string' && typeof p.text === 'string'
            })
          }
        } catch (e) {}
        return COMMON_PROMPTS.map(function (p) { return { label: p.label, text: p.text } })
      }

      function saveCustomPrompts(list) {
        try {
          storeSet(LS_PROMPTS, JSON.stringify(list))
        } catch (e) {}
      }

      var root = null
      var bodyWrap = null
      var img = null
      var bubble = null
      var bubbleText = null
      var hideBtn = null
      var styleBtn = null
      var emojiEl = null
      var blushL = null
      var blushR = null
      var restoreBtn = null
      var styleEl = null
      var swapTimer = null
      var bubbleTimer = null
      var emojiTimer = null
      var blushTimer = null
      var reactionTimer = null
      var reboundTimer = null
      var dropTimer = null
      var love = 0
      var loveLevel = 0
      var style = 'a'
      var clickTimes = []
      var drag = { active: false, moved: false, offX: 0, offY: 0, pointerId: 0 }
      var dragTilt = 0
      var lastDragX = 0
      var lastDragY = 0
      var menuEl = null
      var archiveBtn = null
      var newSessionBtn = null
      var archivedListBtn = null
      var explainBtn = null
      var openExplainPanelBtn = null
      var commonPromptBtn = null
      var notifBtn = null
      var notifEnabled = false
      var sessionWatchUnsubscribe = null
      var sessionWatchTimer = null
      var lastRunningSessionId = null
      var lastRunningState = null
      var archiveArmTimer = null
      var archiveArmed = false
      var archivedOverlay = null
      var archivedPanel = null
      var archivedListEl = null
      var archivedDetailEl = null
      var archiveDetailSeq = 0
      var idleTimer = null
      var explainMode = false
      var explainBtnEl = null
      var explainPanelEl = null
      var explainPanelBody = null
      var explainPanelTimer = null
      var explainListUnsubscribe = null
      var explainCleanupTimer = null
      var pendingExplainText = ''
      var pendingExplainContext = ''
      var __ctx = null
      var __workspacesSvc = null
      var __sessionsSvc = null

      function ready(fn) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', fn, { once: true })
        } else {
          fn()
        }
      }

      function injectStyles() {
        styleEl = document.createElement('style')
        styleEl.setAttribute('data-whale-maid', '1')
        styleEl.textContent =
          '.wm-root{position:fixed;z-index:2147483000;width:150px;height:244px;' +
          'cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;' +
          'animation:wm-float 3.4s ease-in-out infinite;}' +
          '.wm-root.dragging{cursor:grabbing;animation-play-state:paused;}' +
          '.wm-root.dragging .wm-body{animation-play-state:paused;}' +
          '.wm-root.style-c{height:170px;}' +
          '.wm-body{position:absolute;left:50%;bottom:0;transform:translateX(-50%);' +
          'transform-origin:50% 88%;animation:wm-sway 4.4s ease-in-out infinite;}' +
          '.wm-img{display:block;height:230px;width:auto;max-width:140px;object-fit:contain;' +
          'pointer-events:none;' +
          'filter:drop-shadow(0 10px 18px rgba(15,23,42,.28));}' +
          '.wm-bubble{position:absolute;left:50%;bottom:100%;transform:translateX(-50%) translateY(-6px);' +
          'max-width:230px;padding:9px 13px;border-radius:14px;background:#fff;color:#22304a;' +
          'font:13px/1.5 "Segoe UI","Microsoft YaHei",sans-serif;white-space:normal;' +
          'border:2px solid #b9d6ee;box-shadow:0 8px 20px rgba(15,23,42,.18);' +
          'opacity:0;visibility:hidden;transition:opacity .25s ease,transform .25s ease;z-index:3;}' +
          '.wm-bubble.show{opacity:1;visibility:visible;transform:translateX(-50%) translateY(-14px);}' +
          '.wm-btn{position:absolute;width:22px;height:22px;border-radius:50%;' +
          'border:1px solid #cbd5e1;background:#fff;color:#64748b;font:bold 11px/18px Arial;' +
          'cursor:pointer;opacity:0;transition:opacity .15s ease;padding:0;text-align:center;z-index:4;}' +
          '.wm-root:hover .wm-btn{opacity:1;}' +
          '.wm-hide{top:-8px;right:-8px;}' +
          '.wm-style{top:-8px;left:-8px;}' +
          '.wm-emoji{position:absolute;top:1%;left:56%;display:none;font-size:24px;line-height:1;' +
          'z-index:5;pointer-events:none;text-shadow:0 2px 6px rgba(15,23,42,.35);}' +
          '.wm-emoji.show{display:block;animation:wm-emoji-pop .5s ease;}' +
          '.wm-blush{position:absolute;top:12.5%;width:16px;height:11px;border-radius:50%;display:none;' +
          'filter:none;z-index:4;pointer-events:none;}' +
          '.wm-blush.l{left:31%;}.wm-blush.r{left:63%;}' +
          '.wm-blush.show{display:block;}' +
          '.wm-body.style-b .wm-blush{top:30%;}' +
          '.wm-body.style-b .wm-blush.l{left:36%;}' +
          '.wm-body.style-b .wm-blush.r{left:50%;}' +
          '.wm-body.style-b .wm-emoji{top:3%;left:52%;}' +
          '.wm-body.style-c .wm-img{height:auto;width:140px;max-width:140px;}' +
          '.wm-body.style-c .wm-blush{top:30%;}' +
          '.wm-body.style-c .wm-blush.l{left:36%;}' +
          '.wm-body.style-c .wm-blush.r{left:50%;}' +
          '.wm-body.style-c .wm-emoji{top:3%;left:52%;}' +
          '.wm-restore{position:fixed;right:14px;bottom:14px;z-index:2147483000;width:46px;height:46px;' +
          'border-radius:50%;background:rgba(31,43,69,.92);border:2px solid #7fb8dc;color:#fff;' +
          'font-size:24px;line-height:40px;text-align:center;cursor:pointer;' +
          'box-shadow:0 6px 16px rgba(15,23,42,.35);display:none;}' +
          '@keyframes wm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}' +
          '@keyframes wm-sway{0%,100%{transform:translateX(-50%) rotate(-1.8deg)}' +
          '50%{transform:translateX(-50%) rotate(1.8deg)}}' +
          '@keyframes wm-emoji-pop{0%{transform:scale(0) rotate(-12deg)}60%{transform:scale(1.35) rotate(6deg)}' +
          '100%{transform:scale(1) rotate(0)}}' +
          '@keyframes wm-squish{0%,100%{transform:translateY(0) scale(1)}' +
          '35%{transform:translateY(2px) scale(.96,1.04)}70%{transform:translateY(-6px) scale(1.04,.96)}}' +
          '@keyframes wm-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}' +
          '30%{transform:translateX(6px)}45%{transform:translateX(-5px)}60%{transform:translateX(4px)}' +
          '75%{transform:translateX(-3px)}90%{transform:translateX(2px)}}' +
          '@keyframes wm-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}' +
          '50%{transform:rotate(5deg)}75%{transform:rotate(-3deg)}}' +
          '@keyframes wm-rebound{0%{transform:translateX(-50%) rotate(var(--rebound-from,0deg))}' +
          '55%{transform:translateX(-50%) rotate(var(--rebound-mid,0deg))}' +
          '100%{transform:translateX(-50%) rotate(0deg)}}' +
          '@keyframes wm-drop{0%{transform:translateY(0)}45%{transform:translateY(-12px)}' +
          '70%{transform:translateY(4px)}100%{transform:translateY(0)}}' +
          '.wm-menu{position:fixed;z-index:2147483050;min-width:190px;background:#fff;color:#1e293b;' +
          'border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 12px 32px rgba(15,23,42,.25);' +
          'padding:5px;display:none;font:13px/1.5 "Segoe UI","Microsoft YaHei",sans-serif;}' +
          '.wm-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;' +
          'border:none;border-radius:8px;background:transparent;color:inherit;font:inherit;' +
          'text-align:left;cursor:pointer;}' +
          '.wm-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}' +
          '.wm-menu-item.danger{color:#e5484d;}' +
          '.wm-menu-sep{height:1px;margin:4px 8px;background:#e2e8f0;}' +
          '.wm-archive-overlay{position:fixed;inset:0;z-index:2147483100;display:none;' +
          'align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:20px;}' +
          '.wm-archive-panel{width:min(640px,calc(100vw - 40px));max-height:min(80vh,600px);' +
          'background:#fff;color:#1e293b;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,.35);' +
          'display:flex;flex-direction:column;overflow:hidden;font:14px/1.6 "Segoe UI","Microsoft YaHei",sans-serif;}' +
          '.wm-archive-header{display:flex;align-items:center;gap:8px;padding:12px 16px;' +
          'border-bottom:1px solid #e2e8f0;font-weight:600;}' +
          '.wm-archive-close{margin-left:auto;border:none;background:transparent;font-size:18px;' +
          'cursor:pointer;color:#64748b;padding:4px 8px;border-radius:8px;}' +
          '.wm-archive-body{overflow:auto;padding:12px 16px;flex:1;}' +
          '.wm-archive-list{display:flex;flex-direction:column;gap:6px;}' +
          '.wm-archive-item{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;' +
          'border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;cursor:pointer;' +
          'text-align:left;font:inherit;}' +
          '.wm-archive-item:hover{border-color:#b9d6ee;background:#f0f7ff;}' +
          '.wm-archive-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
          '.wm-archive-item .d{color:#94a3b8;font-size:12px;flex:none;}' +
          '.wm-archive-back{margin-bottom:10px;padding:5px 10px;border:1px solid #cbd5e1;' +
          'border-radius:8px;background:#fff;cursor:pointer;font:inherit;}' +
          '.wm-archive-msg{margin:0 0 12px;padding:10px 12px;border-radius:12px;' +
          'white-space:pre-wrap;word-break:break-word;}' +
          '.wm-archive-msg.user{background:#eef4ff;margin-left:24px;}' +
          '.wm-archive-msg.assistant{background:#f1f5f9;margin-right:24px;}' +
          '.wm-archive-msg.tool{background:#fef9c3;color:#713f12;font-size:13px;}' +
          '.wm-archive-empty{color:#94a3b8;text-align:center;padding:40px 0;}' +
          '.wm-explain-float{position:fixed;z-index:2147483080;padding:6px 12px;border-radius:999px;' +
          'background:#2563eb;color:#fff;border:none;font:13px/1.5 "Segoe UI","Microsoft YaHei",sans-serif;' +
          'cursor:pointer;box-shadow:0 6px 18px rgba(37,99,235,.35);display:none;}' +
          '.wm-explain-panel{position:fixed;top:16px;right:16px;bottom:16px;width:380px;max-width:calc(100vw - 32px);' +
          'z-index:2147483090;background:#fff;color:#1e293b;border:1px solid #cbd5e1;border-radius:16px;' +
          'box-shadow:0 24px 60px rgba(15,23,42,.35);display:none;flex-direction:column;overflow:hidden;' +
          'font:14px/1.6 "Segoe UI","Microsoft YaHei",sans-serif;}' +
          '.wm-explain-panel-header{display:flex;align-items:center;gap:8px;padding:12px 16px;' +
          'border-bottom:1px solid #e2e8f0;font-weight:600;}' +
          '.wm-explain-panel-close{margin-left:auto;border:none;background:transparent;font-size:18px;' +
          'cursor:pointer;color:#64748b;padding:4px 8px;border-radius:8px;}' +
          '.wm-explain-panel-cleanup{margin-left:6px;border:none;background:transparent;font-size:15px;' +
          'cursor:pointer;color:#64748b;padding:4px 8px;border-radius:8px;}' +
          '.wm-explain-panel-body{flex:1;overflow:auto;padding:12px 16px;}' +
          '.wm-explain-entry{margin:0 0 12px;padding:10px 12px;border-radius:12px;white-space:pre-wrap;word-break:break-word;}' +
          '.wm-explain-entry.user{background:#eef4ff;margin-left:24px;}' +
          '.wm-explain-entry.assistant{background:#f1f5f9;margin-right:24px;}' +
          '.wm-explain-entry.waiting{color:#94a3b8;font-style:italic;}' +
          '.wm-explain-empty{color:#94a3b8;text-align:center;padding:40px 0;}'
        document.head.appendChild(styleEl)
      }

      function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
      }

      function readLove() {
        try {
          var raw = parseInt(storeGet(LS_LOVE), 10)
          return isNaN(raw) ? 0 : raw
        } catch (e) {
          return 0
        }
      }

      function getLoveLevel(value) {
        for (var i = LOVE_LEVELS.length - 1; i >= 0; i--) {
          if (value >= LOVE_LEVELS[i]) return i
        }
        return 0
      }

      function pickLine(cat) {
        var list = PHRASES[cat] || PHRASES.head
        var idx = Math.min(loveLevel, list.length - 1)
        return pick(list[idx])
      }

      function addLove(amount) {
        var before = loveLevel
        love += amount
        if (love < 0) love = 0
        loveLevel = getLoveLevel(love)
        try {
          storeSet(LS_LOVE, String(love))
        } catch (e) {}
        return loveLevel > before
      }

      function levelUp() {
        say('好感度提升到 Lv.' + (loveLevel + 1) + '「' + LOVE_LEVEL_NAMES[loveLevel] + '」！')
        showEmoji('💖', 2400)
        reactClass('wm-squish', 700)
      }

      function playRebound(fromTilt) {
        if (!bodyWrap) return
        bodyWrap.style.animation = 'none'
        void bodyWrap.offsetWidth
        bodyWrap.style.setProperty('--rebound-from', (fromTilt || 0) + 'deg')
        bodyWrap.style.setProperty('--rebound-mid', (-(fromTilt || 0) * 0.25) + 'deg')
        bodyWrap.classList.add('wm-rebound')
        bodyWrap.style.animation = 'wm-rebound .55s cubic-bezier(.22,1.4,.36,1)'
        clearTimeout(reboundTimer)
        reboundTimer = setTimeout(function () {
          bodyWrap.classList.remove('wm-rebound')
          bodyWrap.style.animation = ''
          bodyWrap.style.removeProperty('--rebound-from')
          bodyWrap.style.removeProperty('--rebound-mid')
        }, 600)
      }

      function playDrop() {
        if (!root) return
        root.style.animation = 'none'
        void root.offsetWidth
        root.classList.add('wm-drop')
        root.style.animation = 'wm-drop .45s ease'
        clearTimeout(dropTimer)
        dropTimer = setTimeout(function () {
          root.classList.remove('wm-drop')
          root.style.animation = ''
        }, 500)
      }

      function readPos() {
        try {
          var raw = storeGet(LS_POS)
          if (raw) return JSON.parse(raw)
        } catch (e) {}
        return null
      }

      function savePos() {
        try {
          storeSet(
            LS_POS,
            JSON.stringify({ left: parseInt(root.style.left, 10), top: parseInt(root.style.top, 10) }),
          )
        } catch (e) {}
      }

      function isHidden() {
        try {
          return storeGet(LS_HIDDEN) === '1'
        } catch (e) {
          return false
        }
      }

      function readStyle() {
        try {
          var s = storeGet(LS_STYLE)
          if (s === 'b' || s === 'c') return s
          return 'a'
        } catch (e) {
          return 'a'
        }
      }

      function clampPos() {
        var left = parseInt(root.style.left, 10)
        var top = parseInt(root.style.top, 10)
        var w = root.offsetWidth || 150
        var h = root.offsetHeight || 244
        left = Math.max(-w + 42, Math.min(window.innerWidth - 42, left))
        top = Math.max(0, Math.min(window.innerHeight - 42, top))
        root.style.left = left + 'px'
        root.style.top = top + 'px'
      }

      function buildDom() {
        root = document.createElement('div')
        root.className = 'wm-root'
        root.setAttribute('aria-label', 'DeepSeek 娘')

        img = document.createElement('img')
        img.className = 'wm-img'
        img.alt = 'DeepSeek 娘'
        img.draggable = false

        bodyWrap = document.createElement('div')
        bodyWrap.className = 'wm-body style-a'

        bubble = document.createElement('div')
        bubble.className = 'wm-bubble'
        bubbleText = document.createElement('span')
        bubble.appendChild(bubbleText)

        emojiEl = document.createElement('div')
        emojiEl.className = 'wm-emoji'

        blushL = document.createElement('div')
        blushL.className = 'wm-blush l'
        blushL.style.background = 'radial-gradient(circle, rgba(255,120,150,.92), rgba(255,120,150,0))'
        blushR = document.createElement('div')
        blushR.className = 'wm-blush r'
        blushR.style.background = 'radial-gradient(circle, rgba(255,120,150,.92), rgba(255,120,150,0))'

        styleBtn = document.createElement('button')
        styleBtn.className = 'wm-btn wm-style'
        styleBtn.type = 'button'
        styleBtn.title = '切换样式（立绘 / Q版 / 新立绘）'

        hideBtn = document.createElement('button')
        hideBtn.className = 'wm-btn wm-hide'
        hideBtn.type = 'button'
        hideBtn.textContent = '✕'
        hideBtn.title = '收起'

        bodyWrap.appendChild(img)
        bodyWrap.appendChild(emojiEl)
        bodyWrap.appendChild(blushL)
        bodyWrap.appendChild(blushR)

        root.appendChild(bubble)
        root.appendChild(bodyWrap)
        root.appendChild(styleBtn)
        root.appendChild(hideBtn)
        document.body.appendChild(root)

        restoreBtn = document.createElement('button')
        restoreBtn.className = 'wm-restore'
        restoreBtn.type = 'button'
        restoreBtn.textContent = '🐋'
        restoreBtn.title = '唤出 DeepSeek 娘'
        document.body.appendChild(restoreBtn)

        buildContextMenu()
        buildArchiveOverlay()
        buildExplainFloat()
        buildExplainPanel()
      }

      // --- right-click menu + archived viewer ----------------------------------

      function buildContextMenu() {
        menuEl = document.createElement('div')
        menuEl.className = 'wm-menu'
        menuEl.setAttribute('role', 'menu')

        archiveBtn = document.createElement('button')
        archiveBtn.type = 'button'
        archiveBtn.className = 'wm-menu-item'
        archiveBtn.setAttribute('role', 'menuitem')
        archiveBtn.textContent = '📦 归档当前对话'
        archiveBtn.addEventListener('click', onArchiveMenuClick)

        newSessionBtn = document.createElement('button')
        newSessionBtn.type = 'button'
        newSessionBtn.className = 'wm-menu-item'
        newSessionBtn.setAttribute('role', 'menuitem')
        newSessionBtn.textContent = '✨ 新会话'
        newSessionBtn.addEventListener('click', onNewSessionMenuClick)

        archivedListBtn = document.createElement('button')
        archivedListBtn.type = 'button'
        archivedListBtn.className = 'wm-menu-item'
        archivedListBtn.setAttribute('role', 'menuitem')
        archivedListBtn.textContent = '🗂 查看已归档会话'
        archivedListBtn.addEventListener('click', onViewArchivedMenuClick)

        explainBtn = document.createElement('button')
        explainBtn.type = 'button'
        explainBtn.className = 'wm-menu-item'
        explainBtn.setAttribute('role', 'menuitem')
        explainBtn.textContent = '📖 解释术语'
        explainBtn.addEventListener('click', onExplainMenuClick)

        openExplainPanelBtn = document.createElement('button')
        openExplainPanelBtn.type = 'button'
        openExplainPanelBtn.className = 'wm-menu-item'
        openExplainPanelBtn.setAttribute('role', 'menuitem')
        openExplainPanelBtn.textContent = '🪟 打开解释面板'
        openExplainPanelBtn.addEventListener('click', onOpenExplainPanelClick)

        commonPromptBtn = document.createElement('button')
        commonPromptBtn.type = 'button'
        commonPromptBtn.className = 'wm-menu-item'
        commonPromptBtn.setAttribute('role', 'menuitem')
        commonPromptBtn.textContent = '⚡ 常用 Prompt'
        commonPromptBtn.addEventListener('click', onCommonPromptMenuClick)

        notifBtn = document.createElement('button')
        notifBtn.type = 'button'
        notifBtn.className = 'wm-menu-item'
        notifBtn.setAttribute('role', 'menuitem')
        notifBtn.addEventListener('click', onNotifMenuClick)

        document.body.appendChild(menuEl)
        renderMainMenu()
      }

      function renderMainMenu() {
        if (!menuEl) return
        menuEl.innerHTML = ''
        var sep = document.createElement('div')
        sep.className = 'wm-menu-sep'
        var sep2 = document.createElement('div')
        sep2.className = 'wm-menu-sep'
        var sep3 = document.createElement('div')
        sep3.className = 'wm-menu-sep'
        var sep4 = document.createElement('div')
        sep4.className = 'wm-menu-sep'
        var sep5 = document.createElement('div')
        sep5.className = 'wm-menu-sep'
        notifBtn.textContent = notifEnabled ? '🔕 关闭系统提醒' : '🔔 开启系统提醒'
        menuEl.appendChild(archiveBtn)
        menuEl.appendChild(newSessionBtn)
        menuEl.appendChild(sep)
        menuEl.appendChild(archivedListBtn)
        menuEl.appendChild(sep2)
        menuEl.appendChild(explainBtn)
        menuEl.appendChild(sep3)
        menuEl.appendChild(openExplainPanelBtn)
        menuEl.appendChild(sep4)
        menuEl.appendChild(commonPromptBtn)
        menuEl.appendChild(sep5)
        menuEl.appendChild(notifBtn)
      }

      function renderPromptMenu() {
        if (!menuEl) return
        menuEl.innerHTML = ''
        var back = document.createElement('button')
        back.type = 'button'
        back.className = 'wm-menu-item'
        back.textContent = '← 返回'
        back.addEventListener('click', function () {
          renderMainMenu()
        })
        menuEl.appendChild(back)
        getCustomPrompts().forEach(function (p) {
          var btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'wm-menu-item'
          btn.setAttribute('role', 'menuitem')
          btn.textContent = p.label
          btn.addEventListener('click', function () {
            insertPromptToComposer(p.text)
            hideContextMenu()
          })
          menuEl.appendChild(btn)
        })
      }

      function onCommonPromptMenuClick() {
        renderPromptMenu()
      }

      function insertPromptToComposer(text) {
        var ta = document.querySelector('textarea[data-phase]') || document.querySelector('textarea')
        if (!ta) {
          say('没有找到输入框')
          return
        }
        var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
        var next = (ta.value ? ta.value.replace(/\s+$/, '') + '\n' : '') + text
        try {
          setter.call(ta, next)
        } catch (e) {
          ta.value = next
        }
        ta.dispatchEvent(new Event('input', { bubbles: true }))
        ta.focus()
        try {
          ta.setSelectionRange(ta.value.length, ta.value.length)
        } catch (e) {}
        say('已填入输入框，你可以修改后发送')
      }

      // --- system notification + task completion reminder -----------------------

      function onNotifMenuClick() {
        if (typeof window.Notification === 'undefined') {
          say('当前浏览器不支持系统通知')
          return
        }
        if (notifEnabled) {
          notifEnabled = false
          storeSet(LS_NOTIF, '0')
          renderMainMenu()
          say('已关闭系统提醒')
          return
        }
        if (window.Notification.permission === 'default') {
          window.Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
              notifEnabled = true
              storeSet(LS_NOTIF, '1')
              renderMainMenu()
              say('已开启系统提醒')
            } else {
              say('系统通知权限被拒绝')
            }
          })
        } else if (window.Notification.permission === 'granted') {
          notifEnabled = true
          storeSet(LS_NOTIF, '1')
          renderMainMenu()
          say('已开启系统提醒')
        } else {
          say('系统通知权限被拒绝，请在浏览器设置中开启')
        }
      }

      function showSystemNotification(title, body) {
        if (typeof window.Notification === 'undefined' || window.Notification.permission !== 'granted') return
        try {
          var n = new window.Notification(title, { body: body, tag: 'dsh-mascot' })
          if (n && typeof n.onclick === 'function') {
            n.onclick = function () {
              window.focus()
              n.close()
            }
          }
        } catch (e) {}
      }

      function readNotifEnabled() {
        return storeGet(LS_NOTIF) === '1'
      }

      function notifyTaskComplete() {
        if (document.hidden || notifEnabled) {
          showSystemNotification('DeepSeek 娘', '任务完成啦～')
        }
        if (!document.hidden) {
          say('任务完成啦～')
          showEmoji('🎉', 2200)
          reactClass('wm-squish', 700)
        }
      }

      function checkRunningState() {
        ensureServices()
        if (!__sessionsSvc || !__sessionsSvc.list) return
        var snap
        try {
          snap = __sessionsSvc.list.getSnapshot()
        } catch (e) {
          return
        }
        if (!snap || snap.phase !== 'ready') return
        var current = snap.current || null
        var summary = current ? (snap.byId && snap.byId[current]) : null
        var running = summary ? summary.running === true : false
        if (current !== lastRunningSessionId) {
          lastRunningSessionId = current
          lastRunningState = running
          return
        }
        if (lastRunningState === true && running === false) {
          notifyTaskComplete()
        }
        lastRunningState = running
      }

      function setupSessionWatch() {
        ensureServices()
        if (sessionWatchUnsubscribe) return
        if (__sessionsSvc && __sessionsSvc.list && typeof __sessionsSvc.list.subscribe === 'function') {
          sessionWatchUnsubscribe = __sessionsSvc.list.subscribe(function () {
            checkRunningState()
          })
        }
        clearInterval(sessionWatchTimer)
        sessionWatchTimer = setInterval(checkRunningState, 5000)
      }

      function buildArchiveOverlay() {
        archivedOverlay = document.createElement('div')
        archivedOverlay.className = 'wm-archive-overlay'
        archivedOverlay.addEventListener('click', function (e) {
          if (e.target === archivedOverlay) closeArchivedViewer()
        })

        archivedPanel = document.createElement('div')
        archivedPanel.className = 'wm-archive-panel'

        var header = document.createElement('div')
        header.className = 'wm-archive-header'
        header.textContent = '已归档会话'
        var closeBtn = document.createElement('button')
        closeBtn.className = 'wm-archive-close'
        closeBtn.type = 'button'
        closeBtn.textContent = '✕'
        closeBtn.addEventListener('click', closeArchivedViewer)
        header.appendChild(closeBtn)

        archivedListEl = document.createElement('div')
        archivedListEl.className = 'wm-archive-body'
        archivedDetailEl = document.createElement('div')
        archivedDetailEl.className = 'wm-archive-body'
        archivedDetailEl.style.display = 'none'

        archivedPanel.appendChild(header)
        archivedPanel.appendChild(archivedListEl)
        archivedPanel.appendChild(archivedDetailEl)
        archivedOverlay.appendChild(archivedPanel)
        document.body.appendChild(archivedOverlay)
      }

      function buildExplainFloat() {
        explainBtnEl = document.createElement('button')
        explainBtnEl.type = 'button'
        explainBtnEl.className = 'wm-explain-float'
        explainBtnEl.textContent = '🔍 解释这个词'
        explainBtnEl.addEventListener('click', onExplainFloatClick)
        document.body.appendChild(explainBtnEl)
      }

      function buildExplainPanel() {
        explainPanelEl = document.createElement('div')
        explainPanelEl.className = 'wm-explain-panel'

        var header = document.createElement('div')
        header.className = 'wm-explain-panel-header'
        header.textContent = '📖 术语解释'
        var closeBtn = document.createElement('button')
        closeBtn.type = 'button'
        closeBtn.className = 'wm-explain-panel-close'
        closeBtn.textContent = '✕'
        closeBtn.addEventListener('click', closeExplainPanel)
        header.appendChild(closeBtn)

        var cleanupBtn = document.createElement('button')
        cleanupBtn.type = 'button'
        cleanupBtn.className = 'wm-explain-panel-cleanup'
        cleanupBtn.textContent = '🗑'
        cleanupBtn.title = '清理解释记录'
        cleanupBtn.addEventListener('click', onCleanupExplainClick)
        header.appendChild(cleanupBtn)

        explainPanelBody = document.createElement('div')
        explainPanelBody.className = 'wm-explain-panel-body'

        explainPanelEl.appendChild(header)
        explainPanelEl.appendChild(explainPanelBody)
        document.body.appendChild(explainPanelEl)
      }

      function ensureServices() {
        if (!__workspacesSvc && __ctx && typeof __ctx.get === 'function') {
          __workspacesSvc = __ctx.get('workspaces')
        }
        if (!__sessionsSvc && __ctx && typeof __ctx.get === 'function') {
          __sessionsSvc = __ctx.get('sessions')
        }
      }

      function adoptServices(ctx) {
        __ctx = ctx || null
        if (ctx && ctx.workspaces) __workspacesSvc = ctx.workspaces
        if (ctx && ctx.sessions) __sessionsSvc = ctx.sessions
        if (ctx && typeof ctx.get === 'function') {
          if (!__workspacesSvc) __workspacesSvc = ctx.get('workspaces')
          if (!__sessionsSvc) __sessionsSvc = ctx.get('sessions')
        }
        if (ctx && typeof ctx.inject === 'function') {
          if (!__workspacesSvc) {
            ctx.inject(['workspaces'], function (sub) {
              if (sub && sub.workspaces) __workspacesSvc = sub.workspaces
            })
          }
          if (!__sessionsSvc) {
            ctx.inject(['sessions'], function (sub) {
              if (sub && sub.sessions) __sessionsSvc = sub.sessions
            })
          }
        }
      }

      function currentSessionId() {
        ensureServices()
        if (!__sessionsSvc || !__sessionsSvc.list) return null
        try {
          return __sessionsSvc.list.getSnapshot().current || null
        } catch (e) {
          return null
        }
      }

      function sessionTitle(id) {
        ensureServices()
        if (!__sessionsSvc || !__sessionsSvc.list) return '未命名会话'
        try {
          var snap = __sessionsSvc.list.getSnapshot()
          var s = snap.byId && snap.byId[id]
          return (s && (s.displayTitle || s.title)) || '未命名会话'
        } catch (e) {
          return '未命名会话'
        }
      }

      function getArchivedSessions() {
        ensureServices()
        if (!__sessionsSvc || !__sessionsSvc.list || !__workspacesSvc || !__workspacesSvc.list) return []
        try {
          var snap = __sessionsSvc.list.getSnapshot()
          var ws = __workspacesSvc.list.getSnapshot()
          var archived = ws.archivedSessionIds || []
          var byId = snap.byId || {}
          return archived.filter(function (id) {
            return !isExplainSession(id)
          }).map(function (id) {
            var s = byId[id]
            return s ? s : { sessionId: id, title: '未命名会话', updatedAt: 0 }
          })
        } catch (e) {
          return []
        }
      }

      function archiveCurrent() {
        ensureServices()
        var id = currentSessionId()
        if (!id) {
          hideContextMenu()
          say('当前没有可归档的会话')
          return
        }
        if (!__workspacesSvc || typeof __workspacesSvc.archiveSession !== 'function') {
          hideContextMenu()
          say('归档服务不可用')
          return
        }
        var title = sessionTitle(id)
        hideContextMenu()
        try {
          var pending = __workspacesSvc.archiveSession(id)
          if (pending && typeof pending.then === 'function') {
            pending.then(function () {
              say('已归档：' + title)
            }, function (err) {
              say('归档失败：' + (err && err.message ? err.message : String(err)))
            })
          } else {
            say('已归档：' + title)
          }
        } catch (err) {
          say('归档失败：' + (err && err.message ? err.message : String(err)))
        }
      }

      function startNewSession() {
        hideContextMenu()
        ensureServices()
        if (!__workspacesSvc || typeof __workspacesSvc.startSession !== 'function') {
          say('新会话服务不可用')
          return
        }
        try {
          __workspacesSvc.startSession()
        } catch (err) {
          say('新会话失败：' + (err && err.message ? err.message : String(err)))
        }
      }

      function resetArchiveArm() {
        archiveArmed = false
        clearTimeout(archiveArmTimer)
        if (archiveBtn) {
          archiveBtn.textContent = '📦 归档当前对话'
          archiveBtn.classList.remove('danger')
        }
      }

      function onArchiveMenuClick() {
        if (!archiveArmed) {
          archiveArmed = true
          archiveBtn.textContent = '⚠ 再点一次确认归档'
          archiveBtn.classList.add('danger')
          clearTimeout(archiveArmTimer)
          archiveArmTimer = setTimeout(resetArchiveArm, 3000)
          return
        }
        resetArchiveArm()
        archiveCurrent()
      }

      function onNewSessionMenuClick() {
        startNewSession()
      }

      function onViewArchivedMenuClick() {
        openArchivedViewer()
      }

      function showContextMenu(e) {
        e.preventDefault()
        e.stopPropagation()
        cancelExplainMode()
        resetArchiveArm()
        resetIdleTimer()
        if (!menuEl) return
        renderMainMenu()
        var menuW = 210
        var menuH = 150
        var left = Math.min(e.clientX, window.innerWidth - menuW - 8)
        var top = Math.min(e.clientY, window.innerHeight - menuH - 8)
        menuEl.style.left = Math.max(8, left) + 'px'
        menuEl.style.top = Math.max(8, top) + 'px'
        menuEl.style.display = 'block'
      }

      function hideContextMenu() {
        if (menuEl) menuEl.style.display = 'none'
        resetArchiveArm()
      }

      function onContextMenu(e) {
        showContextMenu(e)
      }

      function onDocumentContextMenu(e) {
        if (root && root.contains(e.target)) return
        if (menuEl && menuEl.contains(e.target)) return
        hideContextMenu()
      }

      function onDocumentClick(e) {
        if (menuEl && menuEl.style.display === 'block' && !menuEl.contains(e.target)) {
          hideContextMenu()
        }
      }

      function onKeyDown(e) {
        if (e.key === 'Escape') {
          hideContextMenu()
          closeArchivedViewer()
          cancelExplainMode()
        }
      }

      function onWindowResize() {
        hideContextMenu()
        hideExplainFloat()
      }

      function onScrollCapture() {
        hideContextMenu()
        hideExplainFloat()
      }

      function openArchivedViewer() {
        hideContextMenu()
        if (!archivedOverlay) return
        archivedOverlay.style.display = 'flex'
        renderArchivedList()
      }

      function closeArchivedViewer() {
        if (archivedOverlay) archivedOverlay.style.display = 'none'
      }

      function renderArchivedList() {
        if (!archivedListEl || !archivedDetailEl) return
        archiveDetailSeq++
        archivedDetailEl.style.display = 'none'
        archivedListEl.style.display = ''
        archivedListEl.innerHTML = ''
        var items = getArchivedSessions()
        if (items.length === 0) {
          var empty = document.createElement('div')
          empty.className = 'wm-archive-empty'
          empty.textContent = '暂无已归档会话'
          archivedListEl.appendChild(empty)
          return
        }
        items.forEach(function (s) {
          var row = document.createElement('button')
          row.type = 'button'
          row.className = 'wm-archive-item'
          var titleSpan = document.createElement('span')
          titleSpan.className = 't'
          titleSpan.textContent = s.displayTitle || s.title || '未命名会话'
          var timeSpan = document.createElement('span')
          timeSpan.className = 'd'
          timeSpan.textContent = formatTime(s.updatedAt)
          row.appendChild(titleSpan)
          row.appendChild(timeSpan)
          row.addEventListener('click', function () {
            renderArchivedDetail(s.sessionId)
          })
          archivedListEl.appendChild(row)
        })
      }

      function renderArchivedDetail(sessionId) {
        if (!archivedListEl || !archivedDetailEl) return
        var seq = ++archiveDetailSeq
        archivedListEl.style.display = 'none'
        archivedDetailEl.style.display = ''
        archivedDetailEl.innerHTML = ''

        var back = document.createElement('button')
        back.type = 'button'
        back.className = 'wm-archive-back'
        back.textContent = '← 返回列表'
        back.addEventListener('click', renderArchivedList)
        archivedDetailEl.appendChild(back)

        var title = document.createElement('div')
        title.style.fontWeight = '600'
        title.style.marginBottom = '8px'
        title.textContent = sessionTitle(sessionId)
        archivedDetailEl.appendChild(title)

        var loading = document.createElement('div')
        loading.className = 'wm-archive-empty'
        loading.textContent = '加载中…'
        archivedDetailEl.appendChild(loading)

        fetchSessionHistory(sessionId).then(function (value) {
          if (seq !== archiveDetailSeq) return
          loading.remove()
          renderMessages((value && value.events) || [])
        }, function (err) {
          if (seq !== archiveDetailSeq) return
          loading.textContent = '加载失败：' + (err && err.message ? err.message : String(err))
        })
      }

      function renderMessages(events) {
        if (!archivedDetailEl) return
        var count = 0
        events.forEach(function (entry) {
          var ev = entry && entry.event ? entry.event : entry
          if (!ev || !ev.type) return
          var text = ''
          var cls = ''
          if (ev.type === 'user/message') {
            text = extractText(ev.data && ev.data.content)
            cls = 'user'
          } else if (ev.type === 'assistant/message') {
            text = extractText(ev.data && ev.data.message && ev.data.message.content)
            cls = 'assistant'
          } else if (ev.type === 'tool/call') {
            text = ev.data ? '🔧 ' + ev.data.name + (ev.data.arguments ? ' ' + ev.data.arguments : '') : ''
            cls = 'tool'
          } else {
            return
          }
          if (!text) return
          var msg = document.createElement('div')
          msg.className = 'wm-archive-msg ' + cls
          msg.textContent = text
          archivedDetailEl.appendChild(msg)
          count++
        })
        if (count === 0) {
          var empty = document.createElement('div')
          empty.className = 'wm-archive-empty'
          empty.textContent = '这个会话还没有消息记录'
          archivedDetailEl.appendChild(empty)
        }
      }

      function extractText(blocks) {
        if (!Array.isArray(blocks)) return ''
        var out = []
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i]
          if (!b) continue
          if (b.type === 'text') out.push(b.text)
          else if (b.type === 'reasoning') out.push('💭 ' + b.text)
          else if (b.type === 'tool-call') out.push('🔧 ' + b.name + (b.arguments ? ' ' + b.arguments : ''))
          else if (b.type === 'tool-result') out.push('📎 ' + extractText(b.content))
        }
        return out.join('\n')
      }

      function formatTime(ts) {
        if (!ts) return ''
        try {
          var d = new Date(ts)
          if (isNaN(d.getTime())) return ''
          function pad(n) { return n < 10 ? '0' + n : '' + n }
          return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
        } catch (e) {
          return ''
        }
      }

      function newRpcId() {
        return (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'rpc-' + Date.now() + '-' + Math.random().toString(16).slice(2)
      }

      function storeGet(key) {
        try {
          return window.storeGet(key)
        } catch (e) {
          return null
        }
      }

      function storeSet(key, value) {
        try {
          window.storeSet(key, value)
        } catch (e) {}
      }

      function storeRemove(key) {
        try {
          window.storeRemove(key)
        } catch (e) {}
      }

      function callRpc(method, payload) {
        return fetch('/api/' + method, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            type: 'client-request',
            rpcId: newRpcId(),
            method: method,
            payload: payload || {}
          }),
        }).then(function (res) {
          return res.json()
        }).then(function (data) {
          if (!data || !data.result) throw new Error('无效响应')
          if (!data.result.ok) {
            throw new Error((data.result.error && data.result.error.message) || method + ' 失败')
          }
          return data.result.value
        })
      }

      function fetchSessionHistory(sessionId, maxMessages) {
        maxMessages = maxMessages || 100
        return callRpc('session.history', { sessionId: sessionId, maxMessages: maxMessages })
      }

      // --- random skits + explain term -----------------------------------------

      function resetIdleTimer() {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(playRandomSkit, 90000)
      }

      function playRandomSkit() {
        if (!root || root.style.display === 'none' || document.hidden) {
          resetIdleTimer()
          return
        }
        if (explainMode ||
            (menuEl && menuEl.style.display === 'block') ||
            (archivedOverlay && archivedOverlay.style.display === 'flex')) {
          resetIdleTimer()
          return
        }
        var lines = loveLevel >= 3 ? SKIT_HIGH_LINES.concat(SKIT_LINES) : SKIT_LINES
        say(pick(lines))
        var r = Math.random()
        if (r < 0.3) showEmoji('💤', 1800)
        else if (r < 0.5) reactClass('wm-squish', 600)
        else if (r < 0.65) reactClass('wm-wobble', 700)
        resetIdleTimer()
      }

      function startExplainMode() {
        hideContextMenu()
        cancelExplainMode()
        if (!currentSessionId()) {
          say('当前没有会话，请先新建或打开一个会话')
          return
        }
        explainMode = true
        say('请选中你想解释的文本～')
      }

      function cancelExplainMode() {
        explainMode = false
        pendingExplainText = ''
        pendingExplainContext = ''
        hideExplainFloat()
      }

      function onExplainMenuClick() {
        startExplainMode()
      }

      function onExplainFloatClick() {
        var text = pendingExplainText || getSelectedText()
        if (!text) {
          cancelExplainMode()
          return
        }
        var paragraph = pendingExplainContext || getSelectionContext()
        hideExplainFloat()
        cancelExplainMode()
        var sessionId = currentSessionId()
        if (!sessionId) {
          say('当前没有会话，请先新建或打开一个会话')
          return
        }
        fetchSessionHistory(sessionId, 20).then(function (value) {
          var recent = buildRecentContext((value && value.events) || [])
          handleExplainRequest(text, paragraph, recent)
        }, function () {
          handleExplainRequest(text, paragraph, '')
        })
      }

      function onOpenExplainPanelClick() {
        hideContextMenu()
        openExplainPanel()
      }

      function openExplainPanel() {
        if (!explainPanelEl) return
        explainPanelEl.style.display = 'flex'
        if (explainPanelBody && explainPanelBody.children.length === 0) {
          var empty = document.createElement('div')
          empty.className = 'wm-explain-empty'
          empty.textContent = '还没有解释记录。右键宠物 → 解释术语，选中文本后发送～'
          explainPanelBody.appendChild(empty)
        }
        var currentId = currentSessionId()
        if (!currentId) return
        var cached = null
        try {
          cached = storeGet(explainSessionKey(currentId))
        } catch (e) {}
        if (!cached) return
        fetchSessionHistory(cached, 20).then(function (value) {
          var msgs = assistantMessages((value && value.events) || [])
          if (msgs.length && explainPanelBody && explainPanelBody.children.length === 1) {
            addExplainEntry('assistant', msgs[msgs.length - 1])
          }
        }).catch(function () {})
      }

      function closeExplainPanel() {
        if (explainPanelEl) explainPanelEl.style.display = 'none'
        clearExplainPolling()
        if (explainPanelBody) {
          var waitings = explainPanelBody.querySelectorAll('.wm-explain-entry.waiting')
          for (var i = 0; i < waitings.length; i++) waitings[i].remove()
        }
      }

      function clearExplainPolling() {
        clearTimeout(explainPanelTimer)
        explainPanelTimer = null
      }

      function addExplainEntry(role, text) {
        if (!explainPanelBody) return
        var empty = explainPanelBody.querySelector('.wm-explain-empty')
        if (empty) empty.remove()
        var entry = document.createElement('div')
        entry.className = 'wm-explain-entry ' + role
        entry.textContent = text
        explainPanelBody.appendChild(entry)
        explainPanelBody.scrollTop = explainPanelBody.scrollHeight
      }

      function explainSessionKey(sessionId) {
        return 'dsh-whale-maid-mascot:explain-session:' + sessionId
      }

      function getExplainSessionIds() {
        try {
          var raw = storeGet(LS_EXPLAIN_SESSIONS)
          var arr = raw ? JSON.parse(raw) : []
          return Array.isArray(arr) ? arr : []
        } catch (e) {
          return []
        }
      }

      function rememberExplainSession(id) {
        var arr = getExplainSessionIds()
        if (arr.indexOf(id) === -1) {
          arr.push(id)
          if (arr.length > 100) arr = arr.slice(-100)
          try {
            storeSet(LS_EXPLAIN_SESSIONS, JSON.stringify(arr))
          } catch (e) {}
        }
      }

      function isExplainSession(id) {
        return getExplainSessionIds().indexOf(id) !== -1
      }

      function ensureExplainSession(currentSessionId) {
        ensureServices()
        var key = explainSessionKey(currentSessionId)
        try {
          var cached = storeGet(key)
          if (cached) {
            var snap = __sessionsSvc && __sessionsSvc.list ? __sessionsSvc.list.getSnapshot() : null
            if (snap && snap.byId && snap.byId[cached]) return Promise.resolve(cached)
          }
        } catch (e) {}
        if (!__sessionsSvc || typeof __sessionsSvc.create !== 'function') {
          return Promise.reject(new Error('会话服务不可用'))
        }
        var cwd = null
        var agentPreset = null
        try {
          var snap = __sessionsSvc.list.getSnapshot()
          var cur = snap.byId && snap.byId[currentSessionId]
          cwd = cur && cur.cwd ? cur.cwd : null
          agentPreset = cur && cur.agentPreset ? cur.agentPreset : null
        } catch (e) {}
        var opts = {}
        if (cwd) opts.cwd = cwd
        if (agentPreset) opts.agentPreset = agentPreset
        var created
        try {
          created = __sessionsSvc.create(opts)
        } catch (e) {
          return Promise.reject(e)
        }
        return Promise.resolve(created).then(function (newId) {
          rememberExplainSession(newId)
          try {
            storeSet(key, newId)
          } catch (e) {}
          if (__workspacesSvc && typeof __workspacesSvc.archiveSession === 'function') {
            try {
              var arch = __workspacesSvc.archiveSession(newId)
              if (arch && typeof arch.catch === 'function') arch.catch(function () {})
            } catch (e) {}
          }
          return newId
        })
      }

      function buildExplainPrompt(selectedText, paragraph, recentContext) {
        var prompt = '请用通俗易懂的方式，帮一个新手解释下面这个术语/概念。' +
          '可以结合当前对话上下文来回答，语气友好一点。\n\n' +
          '选中的文本：\n「' + selectedText + '」\n\n'
        if (paragraph) prompt += '所在段落/上下文：\n' + paragraph + '\n\n'
        if (recentContext) prompt += '最近对话：\n' + recentContext + '\n'
        return prompt
      }

      function assistantMessages(events) {
        var out = []
        events.forEach(function (entry) {
          var ev = entry && entry.event ? entry.event : entry
          if (!ev || ev.type !== 'assistant/message') return
          var text = extractText(ev.data && ev.data.message && ev.data.message.content)
          if (text) out.push(text)
        })
        return out
      }

      function handleExplainRequest(selectedText, paragraph, recentContext) {
        var sessionId = currentSessionId()
        if (!sessionId) {
          say('当前没有会话，请先新建或打开一个会话')
          return
        }
        openExplainPanel()
        if (explainPanelBody) {
          var oldWaitings = explainPanelBody.querySelectorAll('.wm-explain-entry.waiting')
          for (var i = 0; i < oldWaitings.length; i++) oldWaitings[i].remove()
        }
        addExplainEntry('user', '请解释：' + selectedText)
        var waiting = document.createElement('div')
        waiting.className = 'wm-explain-entry waiting'
        waiting.textContent = 'AI 正在解释中…'
        explainPanelBody.appendChild(waiting)
        explainPanelBody.scrollTop = explainPanelBody.scrollHeight

        ensureExplainSession(sessionId).then(function (explainSessionId) {
          return fetchSessionHistory(explainSessionId, 20).then(function (value) {
            return {
              explainSessionId: explainSessionId,
              beforeCount: assistantMessages((value && value.events) || []).length
            }
          })
        }).then(function (info) {
          var prompt = buildExplainPrompt(selectedText, paragraph, recentContext)
          return sendPrompt(info.explainSessionId, prompt).then(function () {
            return info
          })
        }).then(function (info) {
          pollExplainResult(info.explainSessionId, waiting, info.beforeCount)
        }, function (err) {
          if (waiting.parentNode) waiting.remove()
          addExplainEntry('assistant', '发送失败：' + (err && err.message ? err.message : String(err)))
          say('解释请求失败')
        })
      }

      function pollExplainResult(explainSessionId, waitingEl, beforeCount) {
        clearExplainPolling()
        var tries = 0
        var tick = function () {
          tries++
          fetchSessionHistory(explainSessionId, 20).then(function (value) {
            var msgs = assistantMessages((value && value.events) || [])
            if (msgs.length > beforeCount) {
              clearExplainPolling()
              if (waitingEl.parentNode) waitingEl.remove()
              addExplainEntry('assistant', msgs[msgs.length - 1])
              say('解释完成，已放到右侧面板')
              return
            }
            if (tries >= 60) {
              clearExplainPolling()
              if (waitingEl.parentNode) waitingEl.remove()
              addExplainEntry('assistant', '等待超时，请稍后在解释面板查看。')
              return
            }
            explainPanelTimer = setTimeout(tick, 2000)
          }, function () {
            if (tries >= 60) {
              clearExplainPolling()
              if (waitingEl.parentNode) waitingEl.remove()
              addExplainEntry('assistant', '等待超时，请稍后在解释面板查看。')
              return
            }
            explainPanelTimer = setTimeout(tick, 2000)
          })
        }
        tick()
      }

      function deleteSessionById(sessionId) {
        return fetch('/__chameleon/session/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId }),
        }).then(function (res) {
          return res.json()
        }).then(function (data) {
          if (!data || !data.ok) {
            throw new Error((data && data.error) || '删除失败')
          }
          return data
        })
      }

      function getExplainMappings() {
        var out = []
        var prefix = 'dsh-whale-maid-mascot:explain-session:'
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i)
            if (key && key.indexOf(prefix) === 0) {
              var explainId = storeGet(key)
              if (explainId) {
                out.push({
                  key: key,
                  sourceId: key.slice(prefix.length),
                  explainId: explainId
                })
              }
            }
          }
        } catch (e) {}
        return out
      }

      function removeExplainMapping(key, explainId) {
        try {
          storeRemove(key)
        } catch (e) {}
        if (explainId) {
          var arr = getExplainSessionIds().filter(function (id) {
            return id !== explainId
          })
          try {
            storeSet(LS_EXPLAIN_SESSIONS, JSON.stringify(arr))
          } catch (e) {}
        }
      }

      function cleanupOrphanExplainSessions() {
        if (!__sessionsSvc || !__sessionsSvc.list) return
        var snap
        try {
          snap = __sessionsSvc.list.getSnapshot()
        } catch (e) {
          return
        }
        if (!snap || snap.phase !== 'ready') return
        var byId = snap.byId || {}
        var mappings = getExplainMappings()
        mappings.forEach(function (m) {
          var sourceExists = !!byId[m.sourceId]
          var explainExists = !!byId[m.explainId]
          if (!sourceExists || !explainExists) {
            if (explainExists) {
              try {
                deleteSessionById(m.explainId).catch(function () {})
              } catch (e) {}
            }
            removeExplainMapping(m.key, m.explainId)
          }
        })
      }

      function cleanupAllExplainSessions() {
        clearExplainPolling()
        var mappings = getExplainMappings()
        var ids = getExplainSessionIds()
        var unique = []
        mappings.forEach(function (m) {
          if (unique.indexOf(m.explainId) === -1) unique.push(m.explainId)
        })
        ids.forEach(function (id) {
          if (unique.indexOf(id) === -1) unique.push(id)
        })
        if (unique.length === 0) {
          if (explainPanelBody) explainPanelBody.innerHTML = ''
          say('没有可清理的解释记录')
          return
        }
        var deletes = unique.map(function (id) {
          try {
            return deleteSessionById(id).then(function () {
              return true
            }, function () {
              return false
            })
          } catch (e) {
            return Promise.resolve(false)
          }
        })
        Promise.all(deletes).then(function (results) {
          var failed = results.filter(function (ok) { return !ok }).length
          mappings.forEach(function (m) {
            try { storeRemove(m.key) } catch (e) {}
          })
          try {
            storeSet(LS_EXPLAIN_SESSIONS, '[]')
          } catch (e) {}
          if (explainPanelBody) explainPanelBody.innerHTML = ''
          if (failed > 0) {
            addExplainEntry('assistant', '已清理本地记录，但 ' + failed + ' 个隐藏会话删除失败。')
            say('部分解释记录清理失败')
          } else {
            addExplainEntry('assistant', '已清理解释记录。')
            say('已清理解释记录')
          }
        })
      }

      function onCleanupExplainClick() {
        if (typeof window.confirm === 'function') {
          if (!window.confirm('确定清空所有解释记录吗？')) return
        }
        cleanupAllExplainSessions()
      }

      function setupExplainCleanupWatch() {
        ensureServices()
        if (explainListUnsubscribe) return
        if (__sessionsSvc && __sessionsSvc.list && typeof __sessionsSvc.list.subscribe === 'function') {
          explainListUnsubscribe = __sessionsSvc.list.subscribe(function () {
            cleanupOrphanExplainSessions()
          })
        }
        clearInterval(explainCleanupTimer)
        explainCleanupTimer = setInterval(cleanupOrphanExplainSessions, 30000)
      }

      function onMouseUpForExplain() {
        if (!explainMode) return
        var text = getSelectedText()
        if (!text) {
          pendingExplainText = ''
          pendingExplainContext = ''
          hideExplainFloat()
          return
        }
        pendingExplainText = text
        pendingExplainContext = getSelectionContext()
        showExplainFloat()
      }

      function showExplainFloat() {
        if (!explainBtnEl) return
        var sel = window.getSelection()
        if (!sel || !sel.rangeCount || sel.isCollapsed) {
          hideExplainFloat()
          return
        }
        var rect = sel.getRangeAt(0).getBoundingClientRect()
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          hideExplainFloat()
          return
        }
        var left = Math.min(rect.right + 8, window.innerWidth - 160)
        var top = Math.min(rect.bottom + 8, window.innerHeight - 44)
        explainBtnEl.style.left = Math.max(8, left) + 'px'
        explainBtnEl.style.top = Math.max(8, top) + 'px'
        explainBtnEl.style.display = 'block'
      }

      function hideExplainFloat() {
        if (explainBtnEl) explainBtnEl.style.display = 'none'
      }

      function getSelectedText() {
        try {
          var sel = window.getSelection()
          return sel ? String(sel.toString() || '').trim() : ''
        } catch (e) {
          return ''
        }
      }

      function getSelectionContext() {
        try {
          var sel = window.getSelection()
          if (!sel || !sel.rangeCount) return ''
          var node = sel.anchorNode
          if (!node) return ''
          var el = node.nodeType === 1 ? node : node.parentElement
          while (el && el !== document.body) {
            var text = (el.innerText || el.textContent || '').trim()
            if (text.length >= 20) return text.slice(0, 2000)
            el = el.parentElement
          }
          return ''
        } catch (e) {
          return ''
        }
      }

      function buildRecentContext(events) {
        var messages = []
        events.forEach(function (entry) {
          var ev = entry && entry.event ? entry.event : entry
          if (!ev || !ev.type) return
          if (ev.type === 'user/message') {
            var userText = extractText(ev.data && ev.data.content)
            if (userText) messages.push('用户：' + userText)
          } else if (ev.type === 'assistant/message') {
            var assistantText = extractText(ev.data && ev.data.message && ev.data.message.content)
            if (assistantText) messages.push('助手：' + assistantText)
          }
        })
        return messages.slice(-6).join('\n')
      }

      function sendPrompt(sessionId, text) {
        var payload = {
          sessionId: sessionId,
          mode: 'queue',
          content: [{ type: 'text', text: text }]
        }
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions) {
          try {
            payload.clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
          } catch (e) {}
        }
        return callRpc('session.prompt', payload)
      }

      function placeInitial() {
        var saved = readPos()
        if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
          root.style.left = saved.left + 'px'
          root.style.top = saved.top + 'px'
        } else {
          root.style.left = Math.max(8, window.innerWidth - 150 - 14) + 'px'
          root.style.top = Math.max(8, window.innerHeight - 244 - 128) + 'px'
        }
        clampPos()
      }

      function say(text) {
        bubbleText.textContent = text || pick(HEAD_LINES)
        bubble.classList.add('show')
        clearTimeout(bubbleTimer)
        bubbleTimer = setTimeout(function () {
          bubble.classList.remove('show')
        }, 2400)
      }

      function showEmoji(ch, ms) {
        emojiEl.textContent = ch
        emojiEl.classList.remove('show')
        void emojiEl.offsetWidth // restart the pop animation
        emojiEl.classList.add('show')
        clearTimeout(emojiTimer)
        emojiTimer = setTimeout(function () {
          emojiEl.classList.remove('show')
        }, ms || 2200)
      }

      function showBlush(ms) {
        blushL.classList.add('show')
        blushR.classList.add('show')
        clearTimeout(blushTimer)
        blushTimer = setTimeout(function () {
          blushL.classList.remove('show')
          blushR.classList.remove('show')
        }, ms || 2600)
      }

      function reactClass(cls, ms) {
        root.classList.remove('wm-squish', 'wm-shake', 'wm-wobble')
        void root.offsetWidth
        root.classList.add(cls)
        clearTimeout(reactionTimer)
        reactionTimer = setTimeout(function () {
          root.classList.remove(cls)
        }, ms)
      }

      function setStyle(next, announce) {
        style = next === 'b' ? 'b' : next === 'c' ? 'c' : 'a'
        img.src = style === 'a' ? ASSET_A : style === 'b' ? ASSET_B : ASSET_C
        if (style === 'c') {
          img.style.height = 'auto'
          img.style.width = '140px'
        } else {
          img.style.height = style === 'a' ? '230px' : '214px'
          img.style.width = ''
        }
        if (bodyWrap) bodyWrap.className = 'wm-body style-' + style
        if (root) {
          root.classList.remove('style-a', 'style-b', 'style-c')
          root.classList.add('style-' + style)
        }
        styleBtn.textContent = style.toUpperCase()
        try {
          storeSet(LS_STYLE, style)
        } catch (e) {}
        if (announce) {
          say(pick(STYLE_LINES[style]))
        }
      }

      function reactHead() {
        var leveled = addLove(1)
        if (leveled) levelUp()
        else say(pickLine('head'))
        reactClass('wm-squish', 600)
      }

      function reactChest() {
        var leveled = addLove(3)
        showBlush(2600)
        if (leveled) levelUp()
        else {
          say(pickLine('chest'))
          showEmoji('😳', 2200)
        }
        reactClass('wm-squish', 700)
      }

      function reactLegs() {
        var leveled = addLove(2)
        if (leveled) levelUp()
        else say(pickLine('legs'))
        reactClass('wm-wobble', 700)
      }

      function reactSkirt() {
        var leveled = addLove(1)
        if (leveled) levelUp()
        else say(pickLine('skirt'))
        reactClass('wm-squish', 550)
      }

      function reactAngry() {
        say(pick(ANGRY_LINES))
        showEmoji('💢', 2400)
        reactClass('wm-shake', 1200)
      }

      function zoneOf(e) {
        var rect = img.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return 'skirt'
        var y = (e.clientY - rect.top) / rect.height
        if (style !== 'a') {
          // Q版 / 新立绘: 头更大、身体更短
          if (y < 0.34) return 'head'
          if (y < 0.58) return 'chest'
          if (y >= 0.8) return 'legs'
          return 'skirt'
        }
        if (y < 0.22) return 'head'
        if (y < 0.45) return 'chest'
        if (y >= 0.78) return 'legs'
        return 'skirt'
      }

      function recordRapidClick() {
        var now = Date.now()
        clickTimes.push(now)
        clickTimes = clickTimes.filter(function (t) { return now - t < 2600 })
        if (clickTimes.length >= 10) {
          clickTimes = []
          return true
        }
        return false
      }

      function reactAt(e) {
        if (recordRapidClick()) {
          reactAngry()
          return
        }
        var zone = zoneOf(e)
        if (zone === 'head') reactHead()
        else if (zone === 'chest') reactChest()
        else if (zone === 'legs') reactLegs()
        else reactSkirt()
      }

      function onPointerDown(e) {
        if (e.button !== 0) return
        if (e.target && e.target.classList && e.target.classList.contains('wm-btn')) return
        resetIdleTimer()
        drag.active = true
        drag.moved = false
        drag.pointerId = e.pointerId
        drag.offX = e.clientX - parseInt(root.style.left, 10)
        drag.offY = e.clientY - parseInt(root.style.top, 10)
        dragTilt = 0
        lastDragX = e.clientX
        lastDragY = e.clientY
        clearTimeout(reboundTimer)
        clearTimeout(dropTimer)
        if (bodyWrap) {
          bodyWrap.classList.remove('wm-rebound')
          bodyWrap.style.animation = ''
          bodyWrap.style.transform = ''
        }
        if (root) {
          root.classList.remove('wm-drop')
          root.style.animation = ''
        }
        root.classList.add('dragging')
        try {
          root.setPointerCapture(e.pointerId)
        } catch (err) {}
        e.preventDefault()
        e.stopPropagation()
      }

      function onPointerMove(e) {
        if (!drag.active) return
        var dx = e.clientX - drag.offX
        var dy = e.clientY - drag.offY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true
        dragTilt = Math.max(-14, Math.min(14, (e.clientX - lastDragX) * 0.8))
        lastDragX = e.clientX
        lastDragY = e.clientY
        if (drag.moved && bodyWrap) {
          bodyWrap.style.transform = 'translateX(-50%) rotate(' + dragTilt + 'deg)'
        }
        root.style.left = dx + 'px'
        root.style.top = dy + 'px'
        root.style.right = 'auto'
        root.style.bottom = 'auto'
        e.preventDefault()
      }

      function onPointerUp(e) {
        if (!drag.active) return
        var wasMoved = drag.moved
        var tilt = dragTilt
        drag.active = false
        root.classList.remove('dragging')
        if (bodyWrap) bodyWrap.style.transform = ''
        clampPos()
        savePos()
        if (wasMoved) {
          playRebound(tilt)
          playDrop()
        } else {
          reactAt(e)
        }
      }

      function onHide(e) {
        e.stopPropagation()
        hideContextMenu()
        resetIdleTimer()
        root.style.display = 'none'
        restoreBtn.style.display = 'block'
        try {
          storeSet(LS_HIDDEN, '1')
        } catch (err) {}
      }

      function onStyle(e) {
        e.stopPropagation()
        resetIdleTimer()
        setStyle(style === 'a' ? 'b' : style === 'b' ? 'c' : 'a', true)
      }

      function onRestore() {
        root.style.display = 'block'
        restoreBtn.style.display = 'none'
        resetIdleTimer()
        try {
          storeSet(LS_HIDDEN, '0')
        } catch (err) {}
        say('我回来啦~')
      }

      function cleanup() {
        clearTimeout(swapTimer)
        clearTimeout(bubbleTimer)
        clearTimeout(emojiTimer)
        clearTimeout(blushTimer)
        clearTimeout(reactionTimer)
        clearTimeout(reboundTimer)
        clearTimeout(dropTimer)
        clearTimeout(archiveArmTimer)
        clearTimeout(idleTimer)
        clearExplainPolling()
        if (explainListUnsubscribe) {
          explainListUnsubscribe()
          explainListUnsubscribe = null
        }
        clearInterval(explainCleanupTimer)
        explainCleanupTimer = null
        if (sessionWatchUnsubscribe) {
          sessionWatchUnsubscribe()
          sessionWatchUnsubscribe = null
        }
        clearInterval(sessionWatchTimer)
        sessionWatchTimer = null
        document.removeEventListener('click', onDocumentClick)
        document.removeEventListener('contextmenu', onDocumentContextMenu)
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('mouseup', onMouseUpForExplain)
        window.removeEventListener('resize', onWindowResize)
        document.removeEventListener('scroll', onScrollCapture, true)
        if (root && root.parentNode) root.parentNode.removeChild(root)
        if (restoreBtn && restoreBtn.parentNode) restoreBtn.parentNode.removeChild(restoreBtn)
        if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl)
        if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl)
        if (archivedOverlay && archivedOverlay.parentNode) archivedOverlay.parentNode.removeChild(archivedOverlay)
        if (explainBtnEl && explainBtnEl.parentNode) explainBtnEl.parentNode.removeChild(explainBtnEl)
        if (explainPanelEl && explainPanelEl.parentNode) explainPanelEl.parentNode.removeChild(explainPanelEl)
        root = null
        bodyWrap = null
        img = null
        bubble = null
        hideBtn = null
        styleBtn = null
        emojiEl = null
        blushL = null
        blushR = null
        restoreBtn = null
        menuEl = null
        archiveBtn = null
        newSessionBtn = null
        archivedListBtn = null
        archivedOverlay = null
        archivedPanel = null
        archivedListEl = null
        archivedDetailEl = null
        explainBtnEl = null
        explainPanelEl = null
        explainPanelBody = null
        explainPanelTimer = null
        explainMode = false
        openExplainPanelBtn = null
        commonPromptBtn = null
        notifBtn = null
        __ctx = null
        __workspacesSvc = null
        __sessionsSvc = null
      }

      function PromptSettingsSection() {
        if (!React) return null
        var useState = React.useState
        var useEffect = React.useEffect
        var itemsState = useState(getCustomPrompts)
        var items = itemsState[0]
        var setItems = itemsState[1]
        var labelState = useState('')
        var label = labelState[0]
        var setLabel = labelState[1]
        var textState = useState('')
        var text = textState[0]
        var setText = textState[1]
        var editState = useState(-1)
        var editIndex = editState[0]
        var setEditIndex = editState[1]

        useEffect(function () {
          saveCustomPrompts(items)
        }, [items])

        function addOrUpdate() {
          if (!label.trim() || !text.trim()) return
          var next = items.slice()
          if (editIndex >= 0) next[editIndex] = { label: label.trim(), text: text.trim() }
          else next.push({ label: label.trim(), text: text.trim() })
          setItems(next)
          setLabel('')
          setText('')
          setEditIndex(-1)
        }

        function startEdit(i) {
          setLabel(items[i].label)
          setText(items[i].text)
          setEditIndex(i)
        }

        function removeItem(i) {
          setItems(items.filter(function (_, idx) { return idx !== i }))
          if (editIndex === i) {
            setEditIndex(-1)
            setLabel('')
            setText('')
          }
        }

        var inputStyle = {
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          font: 'inherit',
          width: '100%',
          boxSizing: 'border-box'
        }
        var rowStyle = {
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 8,
          marginBottom: 8
        }

        return React.createElement('div', { style: { padding: '16px', maxWidth: 680 } },
          React.createElement('h3', {}, '🐋 鲸鱼娘宠物'),
          React.createElement('p', { style: { color: '#64748b', marginTop: 0 } },
            '这里管理右键菜单里的“常用 Prompt”。修改后立即生效。'),
          React.createElement('div', {},
            items.map(function (p, i) {
              return React.createElement('div', { key: i, style: rowStyle },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontWeight: 600 } }, p.label),
                  React.createElement('div', { style: { color: '#64748b', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, p.text)
                ),
                React.createElement('button', { type: 'button', onClick: function () { startEdit(i) } }, '编辑'),
                React.createElement('button', { type: 'button', onClick: function () { removeItem(i) } }, '删除')
              )
            })
          ),
          React.createElement('div', { style: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 } },
            React.createElement('input', {
              placeholder: '名称',
              value: label,
              onChange: function (e) { setLabel(e.target.value) },
              style: inputStyle
            }),
            React.createElement('textarea', {
              placeholder: 'Prompt 内容',
              value: text,
              onChange: function (e) { setText(e.target.value) },
              rows: 3,
              style: inputStyle
            }),
            React.createElement('button', {
              type: 'button',
              onClick: addOrUpdate,
              style: { alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }
            }, editIndex >= 0 ? '保存修改' : '添加 Prompt')
          )
        )
      }

      function apply(ctx) {
        adoptServices(ctx)
        notifEnabled = readNotifEnabled()
        setupExplainCleanupWatch()
        setupSessionWatch()
        if (ctx && ctx.slots && React) {
          ctx.slots.inject('settings.section', function () {
            return ctx.slots.register({
              name: 'settings.section',
              id: 'whale-maid-mascot',
              order: 100,
              label: '鲸鱼娘宠物'
            }, PromptSettingsSection)
          })
        }
        ready(function () {
          injectStyles()
          buildDom()
          love = readLove()
          loveLevel = getLoveLevel(love)
          placeInitial()
          setStyle(readStyle(), false)
          if (isHidden()) {
            root.style.display = 'none'
            restoreBtn.style.display = 'block'
          }
          root.addEventListener('pointerdown', onPointerDown, true)
          root.addEventListener('pointermove', onPointerMove, true)
          root.addEventListener('pointerup', onPointerUp, true)
          root.addEventListener('pointercancel', onPointerUp, true)
          root.addEventListener('contextmenu', onContextMenu)
          hideBtn.addEventListener('click', onHide)
          styleBtn.addEventListener('click', onStyle)
          restoreBtn.addEventListener('click', onRestore)
          if (menuEl) {
            menuEl.addEventListener('pointerdown', function (e) { e.stopPropagation() })
            menuEl.addEventListener('click', function (e) { e.stopPropagation() })
          }
          document.addEventListener('click', onDocumentClick)
          document.addEventListener('contextmenu', onDocumentContextMenu)
          document.addEventListener('keydown', onKeyDown)
          document.addEventListener('mouseup', onMouseUpForExplain)
          window.addEventListener('resize', onWindowResize)
          document.addEventListener('scroll', onScrollCapture, true)
          resetIdleTimer()
        })
        if (typeof ctx.effect === 'function') {
          ctx.effect(function () {
            return function () {
              cleanup()
            }
          }, 'whale-maid-mascot: in-page pet')
        }
      }

      exports.apply = apply
      exports.inject = ['workspaces', 'sessions', 'slots']
      return module.exports
    },
  })
}
