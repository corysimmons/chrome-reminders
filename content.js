// content.js — Injects "Remind Me" buttons into tweets on X/Twitter

(() => {
  'use strict';

  const BUTTON_MARKER = 'data-remindme-injected';
  const POPOVER_ID = 'remindme-popover';

  // --- SVG Icons ---

  const bellIconSVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>`;

  const bellActiveIconSVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>`;

  // --- Tweet data extraction ---

  function extractTweetData(articleEl) {
    // Extract tweet URL from the timestamp link
    const timeLink = articleEl.querySelector('a[href*="/status/"] time');
    const linkEl = timeLink?.closest('a');
    const tweetUrl = linkEl ? linkEl.href : null;

    // Extract tweet ID from URL
    const tweetId = tweetUrl?.match(/\/status\/(\d+)/)?.[1] || null;

    // Extract tweet text
    const textEl = articleEl.querySelector('[data-testid="tweetText"]');
    const tweetText = textEl?.textContent?.slice(0, 280) || '';

    // Extract author handle from the tweet URL
    const authorHandle = tweetUrl
      ? '@' + new URL(tweetUrl).pathname.split('/')[1]
      : '';

    return { tweetUrl, tweetId, tweetText, authorHandle };
  }

  // --- Popover time presets ---

  function getPresets() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    return [
      { label: '1 hour', ms: 60 * 60 * 1000 },
      { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
      {
        label: 'Tomorrow 9 AM',
        absolute: tomorrow.getTime()
      },
      { label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
      { label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 }
    ];
  }

  // --- Popover creation ---

  function removePopover() {
    const existing = document.getElementById(POPOVER_ID);
    if (existing) existing.remove();
  }

  function createPopover(buttonEl, tweetData) {
    removePopover();

    const popover = document.createElement('div');
    popover.id = POPOVER_ID;
    popover.className = 'remindme-popover';

    // Header
    const header = document.createElement('div');
    header.className = 'remindme-popover-header';
    header.textContent = 'Remind me about this tweet';
    popover.appendChild(header);

    // Preset buttons
    const presetContainer = document.createElement('div');
    presetContainer.className = 'remindme-presets';

    const presets = getPresets();
    for (const preset of presets) {
      const btn = document.createElement('button');
      btn.className = 'remindme-preset-btn';
      btn.textContent = preset.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const reminderTime = preset.absolute || (Date.now() + preset.ms);
        setReminder(tweetData, reminderTime, buttonEl);
        removePopover();
      });
      presetContainer.appendChild(btn);
    }
    popover.appendChild(presetContainer);

    // Divider
    const divider = document.createElement('div');
    divider.className = 'remindme-divider';
    divider.textContent = 'or pick a date & time';
    popover.appendChild(divider);

    // Custom date/time picker
    const customContainer = document.createElement('div');
    customContainer.className = 'remindme-custom';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'remindme-input';
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'remindme-input';
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
    timeInput.value = `${String(defaultTime.getHours()).padStart(2, '0')}:${String(defaultTime.getMinutes()).padStart(2, '0')}`;

    const setBtn = document.createElement('button');
    setBtn.className = 'remindme-set-btn';
    setBtn.textContent = 'Set Reminder';
    setBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const [year, month, day] = dateInput.value.split('-').map(Number);
      const [hours, minutes] = timeInput.value.split(':').map(Number);
      const reminderDate = new Date(year, month - 1, day, hours, minutes);
      if (reminderDate.getTime() <= Date.now()) {
        setBtn.textContent = 'Pick a future time!';
        setBtn.style.color = '#f4212e';
        setTimeout(() => {
          setBtn.textContent = 'Set Reminder';
          setBtn.style.color = '';
        }, 2000);
        return;
      }
      setReminder(tweetData, reminderDate.getTime(), buttonEl);
      removePopover();
    });

    customContainer.appendChild(dateInput);
    customContainer.appendChild(timeInput);
    customContainer.appendChild(setBtn);
    popover.appendChild(customContainer);

    // Position the popover
    document.body.appendChild(popover);
    positionPopover(popover, buttonEl);

    // Close on outside click (delayed to avoid immediate close)
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!popover.contains(e.target) && !buttonEl.contains(e.target)) {
          removePopover();
          document.removeEventListener('click', closeHandler, true);
        }
      };
      document.addEventListener('click', closeHandler, true);
    }, 50);

    // Prevent tweet interactions from bubbling
    popover.addEventListener('click', (e) => e.stopPropagation());

    return popover;
  }

  function positionPopover(popover, anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    let top = rect.bottom + 8 + window.scrollY;
    let left = rect.left + (rect.width / 2) - (popoverRect.width / 2) + window.scrollX;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + popoverRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popoverRect.width - 8;
    }

    // If popover would go below viewport, show above
    if (rect.bottom + popoverRect.height + 8 > window.innerHeight) {
      top = rect.top - popoverRect.height - 8 + window.scrollY;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }

  // --- Set reminder ---

  async function setReminder(tweetData, reminderTime, buttonEl) {
    const reminder = {
      id: crypto.randomUUID(),
      tweetUrl: tweetData.tweetUrl,
      tweetId: tweetData.tweetId,
      tweetText: tweetData.tweetText,
      authorHandle: tweetData.authorHandle,
      reminderTime: reminderTime,
      createdAt: Date.now()
    };

    try {
      await chrome.runtime.sendMessage({
        type: 'ADD_REMINDER',
        reminder
      });
      markButtonActive(buttonEl, reminderTime);
      showToast('Reminder set!');
    } catch (err) {
      console.error('Failed to set reminder:', err);
      showToast('Failed to set reminder');
    }
  }

  // --- Toast notification ---

  function showToast(message) {
    const existing = document.querySelector('.remindme-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'remindme-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('remindme-toast-visible'));
    setTimeout(() => {
      toast.classList.remove('remindme-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // --- Button active state ---

  function markButtonActive(buttonEl, reminderTime) {
    buttonEl.classList.add('remindme-btn-active');
    buttonEl.innerHTML = bellActiveIconSVG;
    const date = new Date(reminderTime);
    buttonEl.title = `Reminder set for ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // --- Check existing reminders for a tweet ---

  async function checkExistingReminder(buttonEl, tweetId) {
    if (!tweetId) return;
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_REMINDERS_FOR_TWEET',
        tweetId
      });
      if (response?.reminders?.length > 0) {
        markButtonActive(buttonEl, response.reminders[0].reminderTime);
      }
    } catch {
      // Service worker might not be ready yet, ignore
    }
  }

  // --- Button injection ---

  function injectButton(articleEl) {
    if (articleEl.hasAttribute(BUTTON_MARKER)) return;
    articleEl.setAttribute(BUTTON_MARKER, 'true');

    // Find the action bar — it's the div[role="group"] inside the tweet
    const actionBar = articleEl.querySelector('[role="group"]');
    if (!actionBar) return;

    const tweetData = extractTweetData(articleEl);
    if (!tweetData.tweetUrl) return;

    // Create the reminder button container (matching X's action button structure)
    const container = document.createElement('div');
    container.className = 'remindme-btn-container';

    const button = document.createElement('button');
    button.className = 'remindme-btn';
    button.innerHTML = bellIconSVG;
    button.title = 'Set a reminder for this tweet';
    button.setAttribute('aria-label', 'Set reminder');

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const existingPopover = document.getElementById(POPOVER_ID);
      if (existingPopover) {
        removePopover();
        return;
      }

      createPopover(button, tweetData);
    });

    container.appendChild(button);
    actionBar.appendChild(container);

    // Check if this tweet already has a reminder
    checkExistingReminder(button, tweetData.tweetId);
  }

  // --- MutationObserver ---

  function processTweets(root) {
    const tweets = root.querySelectorAll
      ? root.querySelectorAll(`article[data-testid="tweet"]:not([${BUTTON_MARKER}])`)
      : [];
    tweets.forEach(injectButton);
  }

  function startObserver() {
    // Process existing tweets
    processTweets(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // Check if the added node itself is a tweet
          if (node.matches?.('article[data-testid="tweet"]')) {
            injectButton(node);
          }

          // Check children of the added node
          processTweets(node);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // --- Initialize ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
