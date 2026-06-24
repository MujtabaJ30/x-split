(function () {
  'use strict'

  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    window.browser = {
      storage: {
        local: {
          get: (keys) => new Promise((r) => chrome.storage.local.get(keys, r)),
          set: (items) => new Promise((r) => chrome.storage.local.set(items, r))
        },
        onChanged: chrome.storage.onChanged
      }
    }
  }

  let MAX_CHARS = 280
  const URL_LENGTH = 23
  let numStyle = 'parens'
  let urlCountingEnabled = true
  let fillMode = false

  let composeBox = null
  let inputTimer = null
  let chunks = []
  let chunkCopied = []
  let sourceText = ''
  let tab = null
  let panel = null
  let userCollapsed = false
  let darkMode = false

  function watchSettings() {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
      browser.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return
        if (changes.maxChars) { let p = parseInt(changes.maxChars.newValue, 10); if (p >= 50 && p <= 280) MAX_CHARS = p }
        if (changes.numStyle) numStyle = changes.numStyle.newValue
        if (changes.urlCounting !== undefined) urlCountingEnabled = changes.urlCounting.newValue
        if (changes.fillMode !== undefined) fillMode = changes.fillMode.newValue
      })
    }
  }

  function init() {
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.get(['maxChars', 'numStyle', 'urlCounting', 'fillMode']).then((result) => {
        if (result.maxChars) { let p = parseInt(result.maxChars, 10); if (p >= 50 && p <= 280) MAX_CHARS = p }
        if (result.numStyle) numStyle = result.numStyle
        if (result.urlCounting !== undefined) urlCountingEnabled = result.urlCounting
        if (result.fillMode !== undefined) fillMode = result.fillMode
      }).catch(() => {})
    }
    watchSettings()
    watchComposeBox()
    watchTheme()
  }

  function watchComposeBox() {
    let attach = (box) => {
      if (composeBox) {
        composeBox.removeEventListener('input', onInput)
      }
      composeBox = box
      composeBox.addEventListener('input', onInput)
      processInput(composeBox)
      updateHeader()
      if (chunks.length > 0) {
        ensureUI()
        if (!userCollapsed) openSidebar()
        else showTab()
      }
    }

    let detach = () => {
      if (inputTimer) clearTimeout(inputTimer)
      inputTimer = null
      if (composeBox) {
        composeBox.removeEventListener('input', onInput)
      }
      composeBox = null
      if (chunks.length > 0) {
        collapseSidebar()
        updateHeader()
      } else {
        if (tab) tab.style.display = 'none'
        if (panel) panel.classList.remove('open')
      }
    }

    let check = () => {
      let box = document.querySelector('[data-testid="tweetTextarea_0"], [role="textbox"][aria-label*="Post text"]')
      if (box && box !== composeBox) attach(box)
      if (!box && composeBox) detach()
    }

    check()
    let observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })

    document.addEventListener('focusin', (e) => {
      let box = e.target.closest('[data-testid="tweetTextarea_0"], [role="textbox"][aria-label*="Post text"]')
      if (box && box !== composeBox) attach(box)
    })
  }

  function onInput() {
    if (inputTimer) clearTimeout(inputTimer)
    inputTimer = setTimeout(() => {
      if (!composeBox) return
      processInput(composeBox)
      updateHeader()
    }, 100)
  }

  function processInput(box) {
    if (chunks.length > 0) return

    let text = box.innerText.trim().replace(/\s+/g, ' ')
    if (!text) return

    let newChunks = splitIntoChunks(text, MAX_CHARS)
    if (newChunks.length <= 1) return

    sourceText = text
    chunks = newChunks
    chunkCopied = new Array(chunks.length).fill(false)
    ensureUI()
    openSidebar()
    renderChunks()
    showToast(`Split into ${chunks.length}`)
    setTimeout(() => copyChunk(0), 50)
  }

  function reSplit() {
    if (!composeBox) return
    let text = composeBox.innerText.trim().replace(/\s+/g, ' ')
    if (!text) return
    let newChunks = splitIntoChunks(text, MAX_CHARS)
    sourceText = text
    chunks = newChunks
    chunkCopied = new Array(chunks.length).fill(false)
    ensureUI()
    openSidebar()
    renderChunks()
    let btn = panel?.querySelector('#x-split-sidebar-resplit')
    btn?.classList.remove('pulse')
    showToast(`Re-split into ${chunks.length}`)
    if (chunks.length > 0) setTimeout(() => copyChunk(0), 50)
  }

  function ensureUI() {
    if (panel && tab && document.body.contains(panel)) return

    if (tab) tab.remove()
    if (panel) panel.remove()

    tab = document.createElement('div')
    tab.id = 'x-split-tab'
    tab.title = 'Show split panel'
    tab.addEventListener('click', toggleSidebar)
    document.body.appendChild(tab)

    panel = document.createElement('div')
    panel.id = 'x-split-sidebar'

    let header = document.createElement('div')
    header.id = 'x-split-sidebar-header'

    let headerLeft = document.createElement('div')
    headerLeft.id = 'x-split-sidebar-header-left'

    let title = document.createElement('span')
    title.id = 'x-split-sidebar-title'

    let copied = document.createElement('span')
    copied.id = 'x-split-sidebar-copied'

    let headerRight = document.createElement('div')
    headerRight.id = 'x-split-sidebar-header-right'

    let reSplitBtn = document.createElement('button')
    reSplitBtn.id = 'x-split-sidebar-resplit'
    reSplitBtn.textContent = '⟳'
    reSplitBtn.title = 'Re-split from compose box'
    reSplitBtn.addEventListener('click', reSplit)

    let fillBtn = document.createElement('button')
    fillBtn.id = 'x-split-sidebar-fill'
    fillBtn.textContent = '▣'
    fillBtn.title = fillMode ? 'Fill mode: on' : 'Fill mode: off'
    fillBtn.classList.toggle('active', fillMode)
    fillBtn.addEventListener('click', toggleFillMode)

    let themeBtn = document.createElement('button')
    themeBtn.id = 'x-split-theme-toggle'
    themeBtn.textContent = darkMode ? '☀' : '☾'
    themeBtn.title = darkMode ? 'Light mode' : 'Dark mode'
    themeBtn.addEventListener('click', toggleTheme)

    let closeBtn = document.createElement('button')
    closeBtn.id = 'x-split-sidebar-close'
    closeBtn.textContent = '✕'
    closeBtn.title = 'Close panel'
    closeBtn.addEventListener('click', collapseSidebar)

    headerLeft.appendChild(title)
    headerLeft.appendChild(copied)
    headerRight.appendChild(reSplitBtn)
    headerRight.appendChild(fillBtn)
    headerRight.appendChild(themeBtn)
    headerRight.appendChild(closeBtn)
    header.appendChild(headerLeft)
    header.appendChild(headerRight)

    let stale = document.createElement('p')
    stale.id = 'x-split-sidebar-stale'

    let list = document.createElement('div')
    list.id = 'x-split-sidebar-list'
    list.addEventListener('click', (e) => {
      let item = e.target.closest('.x-split-chunk-item')
      if (!item) return
      let idx = parseInt(item.dataset.index)
      if (!isNaN(idx)) copyChunk(idx)
    })

    panel.appendChild(header)
    panel.appendChild(stale)
    panel.appendChild(list)
    document.body.appendChild(panel)
  }

  function showTab() {
    if (!tab) return
    tab.style.display = 'flex'
    tab.textContent = chunks.length
  }

  function hideTab() {
    if (!tab) return
    tab.style.display = 'none'
  }

  function openSidebar() {
    if (!panel) return
    panel.classList.add('open')
    hideTab()
    userCollapsed = false
  }

  function collapseSidebar() {
    if (!panel) return
    panel.classList.remove('open')
    userCollapsed = true
    if (chunks.length > 0) showTab()
  }

  function toggleSidebar() {
    if (panel && panel.classList.contains('open')) {
      collapseSidebar()
    } else {
      openSidebar()
    }
  }

  function clearChunks() {
    chunks = []
    chunkCopied = []
    sourceText = ''
    userCollapsed = false
    if (tab) tab.style.display = 'none'
    if (panel) {
      panel.classList.remove('open')
      let btn = panel.querySelector('#x-split-sidebar-resplit')
      btn?.classList.remove('pulse')
    }
  }

  function watchTheme() {
    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.get(['darkMode']).then((result) => {
        if (result.darkMode !== undefined) darkMode = result.darkMode
        applyTheme()
      }).catch(() => {})
    } else {
      applyTheme()
    }
  }

  function applyTheme() {
    document.documentElement.classList.toggle('x-split-dark-mode', darkMode)
    document.documentElement.classList.toggle('x-split-light-mode', !darkMode)
    let btn = document.getElementById('x-split-theme-toggle')
    if (btn) {
      btn.textContent = darkMode ? '☀' : '☾'
      btn.title = darkMode ? 'Light mode' : 'Dark mode'
    }
  }

  function toggleTheme() {
    darkMode = !darkMode
    applyTheme()
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.set({ darkMode }).catch(() => {})
    }
  }

  function toggleFillMode() {
    fillMode = !fillMode
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.set({ fillMode }).catch(() => {})
    }
    let btn = document.getElementById('x-split-sidebar-fill')
    if (btn) {
      btn.classList.toggle('active', fillMode)
      btn.title = fillMode ? 'Fill mode: on' : 'Fill mode: off'
    }
    if (chunks.length > 0) reSplit()
  }

  function renderChunks() {
    if (!panel) return
    updateHeader()

    let list = panel.querySelector('#x-split-sidebar-list')
    list.innerHTML = ''

    chunks.forEach((chunk, i) => {
      let item = document.createElement('div')
      item.className = 'x-split-chunk-item'
      item.dataset.index = i

      let num = document.createElement('span')
      num.className = 'x-split-chunk-num'
      num.textContent = i + 1

      let body = document.createElement('div')
      body.className = 'x-split-chunk-body'

      let textDiv = document.createElement('div')
      textDiv.className = 'x-split-chunk-text'
      textDiv.textContent = chunk.trim()

      let chars = document.createElement('span')
      chars.className = 'x-split-chunk-chars'
      chars.textContent = `(${effectiveLength(chunk)}/${MAX_CHARS})`

      body.appendChild(textDiv)
      body.appendChild(chars)

      let copiedIcon = document.createElement('span')
      copiedIcon.className = 'x-split-chunk-check'
      copiedIcon.textContent = '✓'

      item.appendChild(num)
      item.appendChild(body)
      item.appendChild(copiedIcon)
      list.appendChild(item)
    })
  }

  function copyChunk(index) {
    let text = chunks[index]
    if (!text) return

    let doCopy = (txt) => {
      navigator.clipboard.writeText(txt).then(() => {
        onCopied(index)
      }).catch(() => {
        let ta = document.createElement('textarea')
        ta.value = txt
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        onCopied(index)
      })
    }

    doCopy(text)
  }

  function onCopied(index) {
    chunkCopied[index] = true

    let item = panel?.querySelector(`.x-split-chunk-item[data-index="${index}"]`)
    if (item) {
      item.classList.add('flash')
      setTimeout(() => item.classList.remove('flash'), 400)
      item.classList.add('copied')

      let num = item.querySelector('.x-split-chunk-num')
      if (num) num.textContent = '✓'

      let check = item.querySelector('.x-split-chunk-check')
      if (check) check.style.display = 'inline'
    }

    updateHeader()
  }

  function updateHeader() {
    if (!panel) return

    let title = panel.querySelector('#x-split-sidebar-title')
    let totalChars = chunks.reduce((sum, c) => sum + c.length, 0)
    title.textContent = `Thread (${chunks.length}) • ${totalChars.toLocaleString()} chars`

    let copied = panel.querySelector('#x-split-sidebar-copied')
    let count = chunkCopied.filter(Boolean).length
    if (count === 0) {
      copied.textContent = ''
    } else if (count === chunks.length) {
      copied.textContent = '✓ All copied'
    } else {
      copied.textContent = `${count}/${chunks.length} copied`
    }

    let stale = panel.querySelector('#x-split-sidebar-stale')
    if (composeBox && chunks.length > 0) {
      let currentText = composeBox.innerText.trim().replace(/\s+/g, ' ')
      if (currentText.length > 0 && currentText !== sourceText) {
        stale.textContent = 'New text — click ⟳ to re-split'
        stale.style.display = 'block'
      } else {
        stale.style.display = 'none'
      }
    } else {
      stale.style.display = 'none'
    }

    let reSplitBtn = panel.querySelector('#x-split-sidebar-resplit')
    if (reSplitBtn) {
      if (composeBox && chunks.length > 0) {
        let currentText = composeBox.innerText.trim().replace(/\s+/g, ' ')
        reSplitBtn.classList.toggle('pulse', currentText.length > 0 && currentText !== sourceText)
      } else {
        reSplitBtn.classList.remove('pulse')
      }
    }
  }

  function showToast(msg) {
    let existing = document.getElementById('x-split-toast')
    if (existing) existing.remove()

    let toast = document.createElement('div')
    toast.id = 'x-split-toast'
    toast.textContent = msg
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transition = 'opacity 0.3s'
      setTimeout(() => {
        if (toast.parentNode) toast.remove()
      }, 300)
    }, 4000)
  }

  function formatSuffix(i, Y) {
    if (numStyle === 'brackets') return ` [${i + 1}/${Y}]`
    if (numStyle === 'slash') return ` ${i + 1}/${Y}`
    return ` (${i + 1}/${Y})`
  }

  function splitIntoChunks(text, maxChars) {
    text = text.trim()
    if (!text) return []
    if (effectiveLength(text) <= maxChars) return [text]

    let result = []
    let pos = 0
    let Y = 0
    let maxIter = 50

    for (let iter = 0; iter < maxIter; iter++) {
      result = []
      pos = 0

      if (Y === 0) {
        let rough = roughSplit(text, maxChars - 7)
        Y = rough.length
      }

      let padNext = false
      for (let i = 0; i < Y; i++) {
        if (pos >= text.length) break
        let remaining = text.slice(pos)
        let suffix = formatSuffix(i, Y)
        let available = maxChars - suffix.length
        if (available <= 10) {
          if (result.length > 0) {
            result[result.length - 1] += suffix
          }
          continue
        }
        let end = findSplitPoint(remaining, available)
        if (end <= 0) end = Math.min(available, remaining.length)
        let chunk = remaining.slice(0, end).replace(/[ \t]+$/, '')
        if (!chunk) {
          chunk = remaining.slice(0, Math.min(available, remaining.length))
          end = chunk.length
        }
        if (padNext) {
          chunk = ' ' + chunk
          padNext = false
        }
        result.push(chunk + suffix)
        pos += end
        let gap = 0
        while (pos + gap < text.length && (text[pos + gap] === ' ' || text[pos + gap] === '\n' || text[pos + gap] === '\r')) gap++
        pos += gap
        if (gap > 0) padNext = true
      }

      if (pos >= text.length) break

      if (Y < 10) {
        Y = result.length + 1
      } else if (Y < 100) {
        Y = result.length + Math.ceil((text.length - pos) / (maxChars - 8))
      } else {
        Y = result.length + Math.ceil((text.length - pos) / (maxChars - 9))
      }
    }

    return result
  }

  function roughSplit(text, limit) {
    let result = []
    let pos = 0
    while (pos < text.length) {
      let remaining = text.slice(pos)
      if (effectiveLength(remaining) <= limit) {
        result.push(remaining)
        break
      }
      let end = findSplitPoint(remaining, limit)
      if (end <= 0) end = findLengthCut(remaining, limit)
      result.push(remaining.slice(0, end))
      pos += end
      while (pos < text.length && (text[pos] === ' ' || text[pos] === '\n' || text[pos] === '\r')) pos++
    }
    return result
  }

  function findSplitPoint(text, limit) {
    if (text.length <= limit) return text.length
    if (limit <= 0) return 0

    let slice = text.slice(0, findLengthCut(text, limit))
    let actualLimit = slice.length

    if (actualLimit <= 0) return 0

    if (!fillMode) {
      for (let delim of ['.', '!', '?']) {
        let idx = slice.lastIndexOf(delim)
        if (idx > actualLimit * 0.4) {
          let nextChar = slice[idx + 1]
          if (!nextChar || nextChar === ' ' || nextChar === '\n') {
            return idx + 1
          }
        }
      }

      let para = slice.lastIndexOf('\n\n')
      if (para > actualLimit * 0.2) return para

      let line = slice.lastIndexOf('\n')
      if (line > actualLimit * 0.2) return line
    }

    let space = slice.lastIndexOf(' ')
    if (space > 0) {
      let nextWord = text.slice(space + 1).match(/^\S+/)
      let shortThreshold = fillMode ? 4 : 3
      if (nextWord && nextWord[0].length <= shortThreshold) {
        let earlierSpace = slice.lastIndexOf(' ', space - 1)
        if (earlierSpace > actualLimit * 0.3) {
          return earlierSpace
        }
      }
      return space
    }

    return actualLimit
  }

  function findLengthCut(text, limit) {
    if (!urlCountingEnabled) return Math.min(text.length, limit)
    let len = 0
    let i = 0
    let urlRegex = /https?:\/\/\S+/g
    urlRegex.lastIndex = 0

    while (i < text.length) {
      urlRegex.lastIndex = i
      let match = urlRegex.exec(text)
      if (match && match.index === i) {
        if (len + URL_LENGTH > limit) return i
        len += URL_LENGTH
        i = match.index + match[0].length
      } else {
        if (len + 1 > limit) return i
        len += 1
        i++
      }
    }

    return text.length
  }

  function effectiveLength(text) {
    if (!urlCountingEnabled) return text.length
    let len = 0
    let urlRegex = /https?:\/\/\S+/g
    let match
    let lastEnd = 0

    urlRegex.lastIndex = 0
    while ((match = urlRegex.exec(text)) !== null) {
      len += match.index - lastEnd
      len += URL_LENGTH
      lastEnd = match.index + match[0].length
    }
    len += text.length - lastEnd
    return len
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
