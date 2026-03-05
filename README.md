# LinkedIn Feed Blocker (Chrome Extension)

This extension blocks LinkedIn's main newsfeed (`https://www.linkedin.com/feed`) so you can still use messages, profiles, jobs, and other LinkedIn pages without the feed distraction.

## Install locally in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `/Users/home/Documents/LinkedInBlocker`.
5. If already loaded, click the extension's **Reload** button after code changes.

## What it does

- Runs only on `linkedin.com` pages.
- Detects the feed route (`/feed`).
- Shows a full-page blocker overlay on feed routes.
- Keeps non-feed pages untouched.
