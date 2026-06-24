(function () {
  'use strict'

  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    window.browser = {
      storage: {
        local: {
          get: (keys) => new Promise((r) => chrome.storage.local.get(keys, r)),
          set: (items) => new Promise((r) => chrome.storage.local.set(items, r))
        }
      }
    }
  }

  const maxCharsInput = document.getElementById('maxChars')
  const numStyleSelect = document.getElementById('numStyle')
  const urlCountingCheck = document.getElementById('urlCounting')
  const fillModeCheck = document.getElementById('fillMode')

  function loadSettings() {
    browser.storage.local.get(['maxChars', 'numStyle', 'urlCounting', 'fillMode']).then((result) => {
      if (result.maxChars) maxCharsInput.value = result.maxChars
      if (result.numStyle) numStyleSelect.value = result.numStyle
      if (result.urlCounting !== undefined) urlCountingCheck.checked = result.urlCounting
      if (result.fillMode !== undefined) fillModeCheck.checked = result.fillMode
    }).catch(() => {})
  }

  function saveSettings() {
    browser.storage.local.set({
      maxChars: parseInt(maxCharsInput.value, 10) || 280,
      numStyle: numStyleSelect.value,
      urlCounting: urlCountingCheck.checked,
      fillMode: fillModeCheck.checked
    }).catch(() => {})
  }

  maxCharsInput.addEventListener('change', saveSettings)
  numStyleSelect.addEventListener('change', saveSettings)
  urlCountingCheck.addEventListener('change', saveSettings)
  fillModeCheck.addEventListener('change', saveSettings)

  loadSettings()
})()
