# Studio Pro Talkback Monitoring Toggle

A small Fender Studio Pro 8 scripting package that automatically disables monitoring on designated talkback channels while the transport is recording, then restores monitoring when recording stops.

## Current configuration

The script targets these exact channel names:

- `Talkback`
- `TB - Room`

## Behavior

| Transport state | Talkback | TB - Room |
| --- | --- | --- |
| Stopped / playback | Monitor ON | Monitor ON |
| Recording | Monitor OFF | Monitor OFF |

Because the script watches Studio Pro's actual transport Record state, it works regardless of whether Record/Stop is triggered from:

- NumPad `*`
- Space/keyboard transport controls
- PreSonus ATOM
- Slate RAVEN
- Studio Pro's on-screen transport
- Other mapped transport controllers

This allows **Cue Mix Mute Follows Channel** to remain disabled, so normal channel mutes can stay independent from performer cue mixes.

## Build the package

From PowerShell in the repository root:

```powershell
.\build-package.ps1
```

The script creates:

```text
dist\Talkback_Record_Guard.package
```

## Install on Windows

1. Close Studio Pro 8.
2. Build the package or use an existing `Talkback_Record_Guard.package`.
3. Copy it to:

```text
C:\Program Files\Fender\Studio Pro 8\Scripts\
```

4. Start Studio Pro 8.
5. Open a test Song.
6. Confirm `Talkback` and `TB - Room` are monitored while stopped.
7. Start recording and confirm both Monitor buttons turn off.
8. Stop recording and confirm both Monitor buttons turn back on.

## Changing talkback channel names

Edit `TB_CHANNEL_NAMES` near the top of `main.js`:

```javascript
var TB_CHANNEL_NAMES = [
    "Talkback",
    "TB - Room"
];
```

The names must match the Studio Pro channel labels exactly.

## Notes

- The script does **not** mute the talkback channels. It changes their Monitor state directly.
- Poll interval is 25 ms.
- Version: `0.1.1`
- This uses Studio Pro's internal/community-documented scripting API, so it should be treated as experimental and retested after Studio Pro updates.
