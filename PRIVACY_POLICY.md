# Privacy Policy

**Chrome Tweet Reminders** does not collect, transmit, or share any personal data.

## What is stored

When you set a reminder, the extension saves the following using Chrome's built-in extension storage:

- Tweet URL and ID
- Tweet text (first 280 characters)
- Author handle
- Reminder time you selected

This data syncs across your signed-in Chrome browsers via your Google account (`chrome.storage.sync`). If sync storage is full, it falls back to device-only storage (`chrome.storage.local`). None of this data is accessible to websites or other extensions.

## What is not collected

- No analytics or tracking
- No data sent to external servers
- No cookies
- No browsing history
- No personal information beyond what you explicitly set reminders on

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save your reminders locally and sync via your Google account |
| `alarms` | Check for due reminders every minute |
| `notifications` | Show desktop notifications when reminders fire |
| `host_permissions: x.com` | Inject the reminder button into tweets |

## Contact

Issues: https://github.com/corysimmons/chrome-tweet-reminders/issues
