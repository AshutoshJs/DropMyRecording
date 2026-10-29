# DropMyRecording

An Android app that collects call recordings into one folder.

Phones often keep call recordings where you can't get to them easily. Usually the only way out is to share them through WhatsApp or Bluetooth. With this app you share the recording to **DropMyRecording** instead, and it copies the file into a folder you picked once. Later you connect the phone to your PC and copy that folder.

## How it works

1. Open the app once and tap **Choose folder**. Pick or create a folder such as `Internal storage/Documents/CallRecordings`.
2. Open any call recording, tap **Share**, then tap **DropMyRecording**.
3. The file is copied into your folder. The app lists every recording in that folder.
4. Connect the phone to your PC with USB, choose **File transfer**, and copy the folder.

- You can share one recording or select several and share them all at once.
- If a file with the same name and size is already in the folder, it is skipped instead of saved twice.
- Accepted types: `audio/*` (mp3, m4a, amr, aac, wav, ogg…), `video/3gpp`, `application/ogg` and `application/octet-stream`.
- The app is Android only. It doesn't use the internet and needs no extra permissions, because Android's folder picker grants access to the folder you choose.

## Tech

- [Expo](https://expo.dev) SDK 58 / React Native, TypeScript
- [`expo-share-intent`](https://github.com/achorein/expo-share-intent) puts the app in Android's Share menu
- [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/) provides the folder picker (Storage Access Framework) and copies the files

```
App.tsx          UI: choose folder, save shared files, list saved recordings
src/storage.ts   remembers the folder and copies shared files into it
app.json         app name, Android package id, share filters (MIME types)
eas.json         free cloud build profile that outputs an installable .apk
FLOW.md          step-by-step setup and build guide (start here)
```

## Quick start

See **[FLOW.md](FLOW.md)** for the full guide, written for people who have never built a mobile app.

```bash
npm install
npm run build:apk     # free cloud build → download the .apk → install on your phone
```

> Expo Go can't run this app because the share menu needs native code. Use an APK build or `npm run android`.
