import { Directory, File, Paths } from 'expo-file-system';

// The chosen save folder is remembered in a small JSON file inside the app's private storage.
const settingsFile = new File(Paths.document, 'settings.json');

type Settings = { folderUri?: string };

async function readSettings(): Promise<Settings> {
  try {
    if (!settingsFile.exists) return {};
    return JSON.parse(await settingsFile.text()) as Settings;
  } catch {
    return {};
  }
}

export async function getSavedFolder(): Promise<Directory | null> {
  const { folderUri } = await readSettings();
  if (!folderUri) return null;
  const dir = new Directory(folderUri);
  return dir.exists ? dir : null;
}

// Opens Android's folder picker. Permission to the folder is kept across app restarts.
export async function pickFolder(): Promise<Directory> {
  const dir = await Directory.pickDirectoryAsync();
  if (!settingsFile.exists) settingsFile.create();
  await settingsFile.write(JSON.stringify({ folderUri: dir.uri }));
  return dir;
}

export type SavedRecording = { name: string; size: number | null };

export function listRecordings(dir: Directory): SavedRecording[] {
  return dir
    .list()
    .filter((item): item is File => item instanceof File)
    .map((file) => ({ name: file.name, size: file.size }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type IncomingFile = { path: string; fileName?: string | null; mimeType?: string | null; size?: number | null };

export type SaveResult = { name: string; status: 'saved' | 'skipped' | 'failed'; error?: string };

// Copies one shared file into the chosen folder. A file with the same name and size is treated as already saved.
export async function saveRecording(dir: Directory, incoming: IncomingFile): Promise<SaveResult> {
  const source = new File(incoming.path);
  const name = incoming.fileName || source.name;
  try {
    const existing = listRecordings(dir).find((r) => r.name === name);
    if (existing && existing.size === source.size) return { name, status: 'skipped' };

    const target = dir.createFile(name, incoming.mimeType || 'audio/*');
    try {
      await source.copy(target, { overwrite: true });
    } catch {
      await target.write(await source.bytes());
    }
    return { name: target.name, status: 'saved' };
  } catch (e) {
    return { name, status: 'failed', error: e instanceof Error ? e.message : String(e) };
  }
}
