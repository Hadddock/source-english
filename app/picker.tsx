import NavigationBar from '@/components/NavigationBar';
import VoiceSelector from '@/components/VoiceSelector';

const headerHeight = 40;
import React from 'react';
import { View, ScrollView } from 'react-native';
import { styles } from '@/app/[lesson]';
import VocabCardPicker from '@/components/VocabCardPicker';

export default function VocabCardPickerPage() {
  return (
    <>
      <ScrollView>
        <View style={styles.outerContainerVocab}>
          <VocabCardPicker />
        </View>
      </ScrollView>
    </>
  );
}
