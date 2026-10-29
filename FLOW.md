# FLOW: from this code to the app on your phone

This guide is for people who have never built a mobile app. Follow it top to bottom.

```
 ┌──────────────┐   npm install   ┌──────────────┐  build (free)  ┌──────────┐  install  ┌──────────┐
 │ This repo on │ ──────────────▶ │ Dependencies │ ─────────────▶ │ .apk file│ ────────▶ │  Phone   │
 │   your PC    │                 │  installed   │  EAS cloud OR  └──────────┘           └────┬─────┘
 └──────────────┘                 └──────────────┘  local Gradle                              │
                                                                                              ▼
   Recording app ──Share──▶ DropMyRecording ──copies──▶ chosen folder ──USB──▶ PC
```

---

## Step 0: What you need (one time)

| Thing | Why | Get it |
|---|---|---|
| Node.js (LTS) | Runs the build tools | https://nodejs.org. Check with `node -v` |
| Git | Already installed if you cloned this repo | |
| Free Expo account | Needed for the free cloud build (Option A) | https://expo.dev/signup |
| Android phone + USB cable | To install the app and copy files to the PC | |

You **don't** need Android Studio for Option A.

## Step 1: Install dependencies

Open a terminal in the project folder:

```bash
npm install
```

Optional check that everything is fine:

```bash
npm run typecheck
npx expo-doctor
```

## Step 2: Build the APK (pick ONE option)

### Option A: Free cloud build with EAS (recommended, easiest)

Expo builds the app on its servers. The free plan includes a monthly quota of Android builds, which is plenty for this app.

```bash
npx eas-cli@latest login            # log in with your Expo account
npx eas-cli@latest build:configure  # first time only. Choose "Android". Say YES if it asks to create a project.
npm run build:apk                   # = eas build -p android --profile preview
```

- If it asks **"Generate a new Android Keystore?"**, answer **Yes**. Expo stores the signing key for you.
- The build waits in a queue and then runs. It usually takes 10–20 minutes on the free plan.
- When it finishes, the terminal shows a **link and a QR code**. You can also find the build at https://expo.dev, under your project, then **Builds**.

### Option B: Build locally on your PC (no account, more setup)

You need **Android Studio** (it includes the Android SDK) and **JDK 17**.
1. Install Android Studio. Open it once and let it download the SDK.
2. Set the environment variable `ANDROID_HOME` to the SDK path. On Windows that is usually `C:\Users\<you>\AppData\Local\Android\Sdk`.
3. Run:

```bash
npm run build:apk:local
```

The APK is created at `android/app/build/outputs/apk/release/app-release.apk`.

> The `android/` folder is generated and is ignored by git. Delete it and run the command again whenever you change `app.json`.

## Step 3: Install the APK on your phone

1. Open the build link or QR code from Step 2 **on your phone** and download the `.apk`.
   Or copy the `.apk` from your PC to the phone over USB.
2. Tap the downloaded file. Android will ask you to allow **"Install unknown apps"** for your browser or file manager. Allow it.
3. Tap **Install**. If Play Protect warns you, tap **More details**, then **Install anyway**. This happens because the app isn't from the Play Store.

## Step 4: First-time setup in the app

1. Open **DropMyRecording**.
2. Tap **Choose folder**.
3. In the picker, go to `Internal storage`. Create or select a folder, for example `Documents/CallRecordings`, then tap **Use this folder** and **Allow**.

   ⚠️ Android doesn't let apps use the root of storage or the `Download` folder itself. Pick a subfolder.
4. The app remembers this folder, so you only do this once.

## Step 5: Daily use

1. Open your phone's call recordings (Phone app, Recorder app, or file manager).
2. Long-press one or more recordings, tap **Share**, then tap **DropMyRecording**.
3. The app opens and shows ✅ **Saved** for each file. Files that are already saved show ℹ️ instead.

## Step 6: Copy to your PC

1. Connect the phone with USB and choose **File transfer / MTP** in the USB notification.
2. On the PC, open **This PC**, then your phone, then **Internal storage**, then **Documents**, then **CallRecordings**.
3. Copy the folder to your PC.

---

## Making changes later

| You want to… | Do this |
|---|---|
| Change the app name | Edit `"name"` in `app.json`, then rebuild (Step 2) |
| Change the app icon | Replace the images in `assets/`, then rebuild |
| Accept more file types | Add MIME types to `androidIntentFilters` / `androidMultiIntentFilters` in `app.json`, then rebuild |
| Change the UI | Edit `App.tsx`, then rebuild |
| Release a new version | Increase `"version"` in `app.json`, rebuild, and install the new APK over the old one |

> Always build from the same Expo account. The phone only accepts an update that is signed with the same key as the installed app.

## Testing changes faster (optional)

Live reload needs a development build, because the share menu uses native code:

```bash
npx expo run:android      # needs Option B setup, with the phone connected by USB and USB debugging on
```

## Troubleshooting

| Problem | Fix |
|---|---|
| DropMyRecording isn't in the Share menu | Make sure the APK is installed (not Expo Go). Some recorders share as an unusual file type. Add that type to `app.json` and rebuild |
| "Could not save" error | Tap **Change folder** and pick the folder again (permission may have been reset) |
| Folder shows "Not set yet" after a restart | The folder was deleted or renamed. Choose it again |
| `eas build` asks to install `expo-dev-client` | Answer **No**. It isn't needed for the `preview` profile |
| Local build: `SDK location not found` | Set `ANDROID_HOME` (see Option B) and open a new terminal |
| Play Protect blocks the install | Tap **More details**, then **Install anyway** |
