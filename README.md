<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/icons/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="public/icons/logo-light.svg">
  <img alt="Chrome Tweet Reminders" src="public/icons/logo-light.svg" width="48" height="48">
</picture>

# Chrome Tweet Reminders

Set reminders on any tweet. Get desktop notifications when it's time to revisit. No accounts, no servers — everything runs locally in your browser and syncs via your Google account.

## Features

- Bell icon on every tweet's action bar
- Quick presets (1h, 4h, tomorrow 9am, 1 week, 1 month) or custom date/time
- Desktop notifications with click-to-open and 1-hour snooze
- Popup dashboard to view, manage, and bulk-delete reminders
- Import/export reminders as JSON
- Badge count on extension icon
- Existing reminder detection — clicking the bell on a tweet with a reminder lets you change or cancel it
- Dark theme matching X's UI

## Install

```bash
git clone https://github.com/user/chrome-tweet-reminders.git
cd chrome-tweet-reminders
npm install && npm run build
```

Then load `dist/` as an unpacked extension in `chrome://extensions` (developer mode).

## Tech Stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Shadow DOM (content script isolation)

## Permissions

| Permission | Why |
|---|---|
| `storage` | Store reminders (syncs via Google account) |
| `alarms` | 1-minute polling for due reminders |
| `notifications` | Desktop notifications |
| `host_permissions: x.com` | Content script injection |

## License

MIT
