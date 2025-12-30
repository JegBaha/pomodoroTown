import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';

import { ForestBackground } from '@/components/forest-background';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocale } from '@/src/locale/i18n';

type Palette = {
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  inputPlaceholder: string;
  shadow: string;
};

const lightPalette: Palette = {
  surface: 'rgba(255,255,255,0.92)',
  surfaceAlt: 'rgba(255,255,255,0.86)',
  border: 'rgba(16,67,115,0.22)',
  text: '#0f1f33',
  muted: '#4a6985',
  inputPlaceholder: '#7ba3b8',
  shadow: '#1b3a52',
};

const darkPalette: Palette = {
  surface: 'rgba(10,20,32,0.94)',
  surfaceAlt: 'rgba(12,26,42,0.9)',
  border: 'rgba(92,230,255,0.26)',
  text: '#e7f2ff',
  muted: '#8ab4cc',
  inputPlaceholder: '#8ab4cc',
  shadow: '#5ac8ff',
};

type Note = { id: string; text: string; createdAt: number };

export default function NotesScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const { t } = useLocale();
  const palette = useMemo(() => (scheme === 'dark' ? darkPalette : lightPalette), [scheme]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: `${Date.now()}`, text, createdAt: Date.now() }, ...prev]);
    setDraft('');
  };

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) {
      removeNote(editingId);
    } else {
      setNotes((prev) => prev.map((n) => (n.id === editingId ? { ...n, text } : n)));
    }
    setEditingId(null);
    setEditingText('');
  };

  return (
    <ForestBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <ThemedText style={[styles.title, { color: palette.text }]}>{t('notes.title')}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
            {notes.length === 0 ? t('notes.subtitle.empty') : t('notes.subtitle.count', { count: notes.length })}
          </ThemedText>
          <View style={{ gap: 8 }}>
            <TextInput
              placeholder={t('notes.placeholder')}
              placeholderTextColor={palette.inputPlaceholder}
              style={[styles.input, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, color: palette.text }]}
              multiline
              value={draft}
              onChangeText={setDraft}
            />
            <Pressable onPress={addNote} style={[styles.addBtn, { borderColor: palette.border, backgroundColor: palette.surfaceAlt }]}>
              <ThemedText style={[styles.addBtnText, { color: palette.text }]}>{t('notes.add')}</ThemedText>
            </Pressable>
          </View>
        </View>

        {notes.length === 0 ? (
          <ThemedText style={[styles.subtitle, { color: palette.muted }]}>{t('notes.empty')}</ThemedText>
        ) : (
          notes.map((n) => {
            const isEditing = editingId === n.id;
            return (
              <View
                key={n.id}
                style={[styles.noteCard, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, shadowColor: palette.shadow }]}>
                {isEditing ? (
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    multiline
                    autoFocus
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                        color: palette.text,
                        minHeight: 80,
                      },
                    ]}
                  />
                ) : (
                  <ThemedText style={{ color: palette.text }}>{n.text}</ThemedText>
                )}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {isEditing ? (
                    <>
                      <Pressable onPress={saveEdit} style={[styles.deleteBtn, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                        <ThemedText style={[styles.deleteText, { color: palette.text }]}>{t('notes.save')}</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setEditingId(null);
                          setEditingText('');
                        }}
                        style={[styles.deleteBtn, { borderColor: palette.border }]}>
                        <ThemedText style={[styles.deleteText, { color: palette.muted }]}>{t('notes.cancel')}</ThemedText>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => startEdit(n)}
                        style={[styles.deleteBtn, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                        <ThemedText style={[styles.deleteText, { color: palette.text }]}>{t('notes.edit')}</ThemedText>
                      </Pressable>
                      <Pressable onPress={() => removeNote(n.id)} style={[styles.deleteBtn, { borderColor: palette.border }]}>
                        <ThemedText style={[styles.deleteText, { color: palette.muted }]}>{t('notes.delete')}</ThemedText>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
        </View>
      </ScrollView>
    </ForestBackground>
  );
}

const createStyles = (p: Palette) =>
  StyleSheet.create({
    container: { padding: 16, gap: 12, alignItems: 'center' },
    page: { width: '100%', maxWidth: 900, gap: 12 },
    card: {
      gap: 10,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: p.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    title: { fontSize: 20, fontWeight: '800' },
    subtitle: { fontSize: 14 },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      minHeight: 90,
      textAlignVertical: 'top',
    },
    addBtn: {
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    },
    addBtnText: { fontWeight: '800' },
    noteCard: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      gap: 10,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    deleteBtn: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderRadius: 10,
    },
    deleteText: { fontWeight: '700' },
  });
