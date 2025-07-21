import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import SearchBar from './SearchBar';
import VocabCard from '@/components/VocabCard';
import vocabularyData from '@/i18n/locales/en-us/vocabulary.json';
import { Platform, View as RNView } from 'react-native';
import { CENTERED_MAX_WIDTH } from '@/constants/constants';
import { styles } from '@/app/[lesson]'; // Import styles from the lesson page

// Helper to flatten the vocabulary data
interface VocabEntry {
  word: string;
  key: string;
  __alternates?: string[];
  [key: string]: any;
}

function flattenVocabulary(vocabArr: any[]): VocabEntry[] {
  const seen = new Set<string>();
  const result: VocabEntry[] = [];
  vocabArr.forEach((entry: any) => {
    const key = Object.keys(entry)[0];
    const value = entry[key];
    if (value && typeof value === 'object' && value.word) {
      const sig = `${value.word}|${key}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        result.push({ ...value, key });
      }
    }
  });
  return result;
}

const vocabEntries: VocabEntry[] = flattenVocabulary(vocabularyData);

export default function VocabCardPicker() {
  const [selected, setSelected] = useState<VocabEntry[]>([]);
  // No need for searchQuery/searchResults, use VocabSearchInput for suggestions

  function handleAdd(item: any) {
    // Accepts item from SearchBar, which may be a Suggestion or VocabEntry
    // Only add vocab entries (not lessons)
    if (item.type === 'vocab') {
      const card = vocabEntries.find((v) => v.key === item.key);
      if (card && !selected.some((c) => c.key === card.key)) {
        setSelected([...selected, card]);
      }
    }
  }

  function handleRemove(card: VocabEntry) {
    setSelected(selected.filter((c) => c.key !== card.key));
  }

  // Determine if any selected card is large
  const hasLarge = selected.some((card) => card.size === 'large');

  return (
    <View style={styles.outerContainer}>
      <View
        style={{
          zIndex: 1,
          width: '100%',
          maxWidth: CENTERED_MAX_WIDTH,
          paddingHorizontal: 16,
        }}
      >
        <SearchBar onPress={handleAdd} />
      </View>
      {/* Render large cards in block, others inline */}
      {selected.some((card) => card.size === 'large') ? (
        <View style={{ width: '100%', alignItems: 'center' }}>
          {selected.map((card) =>
            card.size === 'large' ? (
              <View
                key={card.key}
                style={{
                  width: '100%',
                  maxWidth: 400,
                  alignSelf: 'center',
                  marginBottom: 2,
                }}
              >
                <VocabCard card={card} size="large" />
                <View
                  style={{
                    width: '100%',
                    backgroundColor: '#f2f2f2',
                    paddingVertical: 6,
                    alignItems: 'center',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <Button title="Remove" onPress={() => handleRemove(card)} />
                </View>
              </View>
            ) : null
          )}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: 3,
          columnGap: 3,
          justifyContent: Platform.OS !== 'web' ? 'space-between' : undefined,
          width: '100%',
        }}
      >
        {selected.map((card) =>
          card.size !== 'large' ? (
            <View
              key={card.key}
              style={{
                marginBottom: 8,
                minWidth: 180,
                maxWidth: 220,
                flexGrow: 1,
                flexShrink: 1,
                rowGap: 12,
                columnGap: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <VocabCard card={card} size={'medium'} minWidth={'100%'} />
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#f2f2f2',
                  paddingVertical: 6,
                  alignItems: 'center',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <Button title="Remove" onPress={() => handleRemove(card)} />
              </View>
            </View>
          ) : null
        )}
      </View>
    </View>
  );
}
