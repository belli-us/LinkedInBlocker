(() => {
  "use strict";

  const FEED_PATH_REGEX = /^\/feed(?:\/|$)/i;
  const OVERLAY_ID = "li-feed-blocker-overlay";
  const STYLE_ID = "li-feed-blocker-style";
  const BLOCKED_CLASS = "li-feed-blocker-active";
  const OVERFLOW_DATA_KEY = "liFeedBlockerOverflow";

  function isFeedPath(pathname = window.location.pathname) {
    return FEED_PATH_REGEX.test(pathname || "/");
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.${BLOCKED_CLASS} body {
        visibility: hidden !important;
      }

      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #f3f2ef;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      }

      #${OVERLAY_ID} .li-feed-blocker-card {
        width: min(680px, 100%);
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      #${OVERLAY_ID} h1 {
        margin: 0 0 8px;
        font-size: 24px;
        color: #1d2226;
      }

      #${OVERLAY_ID} p {
        margin: 0 0 16px;
        font-size: 16px;
        line-height: 1.5;
        color: #526a6e;
      }

      #${OVERLAY_ID} a {
        display: inline-block;
        padding: 10px 14px;
        border-radius: 999px;
        text-decoration: none;
        background: #0a66c2;
        color: #fff;
        font-weight: 600;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function createOverlay() {
    const overlay = document.createElement("section");
    overlay.id = OVERLAY_ID;

    const card = document.createElement("div");
    card.className = "li-feed-blocker-card";

    const title = document.createElement("h1");
    title.textContent = "LinkedIn feed blocked";

    const text = document.createElement("p");
    text.textContent = "Your LinkedIn newsfeed is hidden by this extension.";

    const link = document.createElement("a");
    link.href = "https://www.linkedin.com/mynetwork/";
    link.textContent = "Go to My Network";

    card.append(title, text, link);
    overlay.appendChild(card);
    return overlay;
  }

  function showOverlay() {
    ensureStyles();
    const root = document.documentElement;
    if (!root) {
      return;
    }

    root.classList.add(BLOCKED_CLASS);
    if (root.dataset[OVERFLOW_DATA_KEY] === undefined) {
      root.dataset[OVERFLOW_DATA_KEY] = root.style.overflow || "";
    }
    root.style.overflow = "hidden";

    if (document.getElementById(OVERLAY_ID)) {
      return;
    }

    const parent = document.documentElement || document.body;
    if (!parent) {
      return;
    }

    parent.appendChild(createOverlay());
  }

  function hideOverlay() {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    root.classList.remove(BLOCKED_CLASS);
    if (root.dataset[OVERFLOW_DATA_KEY] !== undefined) {
      root.style.overflow = root.dataset[OVERFLOW_DATA_KEY];
      delete root.dataset[OVERFLOW_DATA_KEY];
    } else {
      root.style.overflow = "";
    }

    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.remove();
    }
  }

  let scheduled = false;

  function syncBlockState() {
    if (isFeedPath()) {
      showOverlay();
      return;
    }

    hideOverlay();
  }

  function scheduleSync() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncBlockState();
    });
  }

  if (isFeedPath()) {
    document.documentElement.classList.add(BLOCKED_CLASS);
  }

  ensureStyles();

  const observer = new MutationObserver(scheduleSync);

  observer.observe(document.documentElement, { childList: true, subtree: true });

  const originalPushState = history.pushState;
  history.pushState = function pushStatePatched(...args) {
    const result = originalPushState.apply(this, args);
    scheduleSync();
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function replaceStatePatched(...args) {
    const result = originalReplaceState.apply(this, args);
    scheduleSync();
    return result;
  };

  window.addEventListener("popstate", scheduleSync);
  window.addEventListener("hashchange", scheduleSync);
  document.addEventListener("DOMContentLoaded", scheduleSync, { once: true });

  scheduleSync();
})();
