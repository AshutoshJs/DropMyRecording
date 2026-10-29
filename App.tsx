import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import type { Directory } from 'expo-file-system';
import {
  getSavedFolder,
  listRecordings,
  pickFolder,
  saveRecording,
  type SavedRecording,
  type SaveResult,
} from './src/storage';

function formatSize(bytes: number | null) {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Folder URIs look like content://.../tree/primary%3ADocuments%2FCalls — show the readable part.
function folderLabel(dir: Directory) {
  const tail = decodeURIComponent(dir.uri.split('/tree/').pop() ?? dir.uri);
  return tail.replace(/^primary:/, 'Internal storage/');
}

export default function App() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const [folder, setFolder] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<SaveResult[]>([]);
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);

  const refresh = useCallback((dir: Directory | null) => {
    try {
      setRecordings(dir ? listRecordings(dir) : []);
    } catch {
      setRecordings([]);
    }
  }, []);

  useEffect(() => {
    getSavedFolder().then((dir) => {
      setFolder(dir);
      refresh(dir);
      setLoading(false);
    });
  }, [refresh]);

  // Whenever files are shared into the app and a folder is set, save them.
  useEffect(() => {
    if (!hasShareIntent || !folder || saving) return;
    const files = shareIntent.files ?? [];
    if (files.length === 0) {
      resetShareIntent();
      return;
    }
    setSaving(true);
    (async () => {
      const out: SaveResult[] = [];
      for (const f of files) out.push(await saveRecording(folder, f));
      setResults(out);
      refresh(folder);
      resetShareIntent();
      setSaving(false);
    })();
  }, [hasShareIntent, shareIntent, folder, saving, resetShareIntent, refresh]);

  const chooseFolder = async () => {
    try {
      const dir = await pickFolder();
      setFolder(dir);
      refresh(dir);
    } catch {
      // User closed the picker without choosing.
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>DropMyRecording</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Save folder</Text>
        <Text style={styles.value}>{folder ? folderLabel(folder) : 'Not set yet'}</Text>
        <Pressable style={styles.button} onPress={chooseFolder}>
          <Text style={styles.buttonText}>{folder ? 'Change folder' : 'Choose folder'}</Text>
        </Pressable>
      </View>

      {!folder && hasShareIntent && (
        <Text style={styles.warn}>Choose a folder first — your shared recording will be saved right after.</Text>
      )}
      {saving && <Text style={styles.info}>Saving…</Text>}
      {error && <Text style={styles.warn}>Share error: {error}</Text>}
      {results.map((r, i) => (
        <Text key={i} style={r.status === 'failed' ? styles.warn : styles.info}>
          {r.status === 'saved' && `✅ Saved ${r.name}`}
          {r.status === 'skipped' && `ℹ️ Already saved: ${r.name}`}
          {r.status === 'failed' && `❌ Could not save ${r.name}: ${r.error}`}
        </Text>
      ))}

      <Text style={styles.label}>
        Recordings in folder ({recordings.length})
      </Text>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rowSize}>{formatSize(item.size)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.hint}>
            Open your call recording → Share → DropMyRecording. It will be copied into the folder above.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#F2F6FA', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 4, marginTop: 8 },
  value: { fontSize: 15, marginBottom: 12 },
  button: { backgroundColor: '#1E6FD9', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  info: { color: '#1B7F3B', marginBottom: 4 },
  warn: { color: '#B3261E', marginBottom: 4 },
  hint: { color: '#888', marginTop: 12 },
  row: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  rowName: { flex: 1, marginRight: 8 },
  rowSize: { color: '#666' },
});
