import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Pressable,
  TouchableOpacity,
  DimensionValue,
} from 'react-native';
import posColors, {
  posColorsLight,
  getLexendFontSizeToFit,
  getTopPlaceholderText,
} from '@/constants/constants';
import ReadableText from '@/components/ReadableText';
import PlayPronunciationButton from './PlayPronunciationButton';
import { getIconForEntry } from '@/utils/iconMap';
import { useRouter, useSegments } from 'expo-router';
import { useSpeech } from '@/contexts/SpeechContext';
import { useDeck } from '@/contexts/DeckContext';

// Context to indicate if inside a VocabularyCarousel
export const VocabularyCarouselContext = React.createContext(false);

export type VocabCardSize = 'small' | 'medium' | 'large';

interface VocabCardProps {
  card: any;
  size: VocabCardSize;
  onPress?: () => void;
  vocabKey?: string;
  cardIndex?: number;
  minWidth?: DimensionValue;
}

const VocabCard: React.FC<VocabCardProps> = ({
  card,
  size,
  onPress,
  vocabKey,
  cardIndex,
  minWidth,
}) => {
  const {
    __pos,
    word,
    plural,
    __count,
    __forced_pronunciation,
    __consonant,
    __vowel,
    __show_word = true,
    __exampleEntries = [],
    __icon_text,
    examples,
    __tags,
    __gender,
  } = card as any;

  let borderColor = posColors[__pos] || '#000';
  let borderLeftColor = posColors[__pos] || '#000';
  let borderTopColor = posColors[__pos] || '#000';
  const color = posColors[__pos] || '#000';
  const screenWidth = Dimensions.get('window').width;
  const isMobile =
    size === 'small' ? Platform.OS !== 'web' : screenWidth <= 768;
  const objectKey = (card as any).__objectKey || vocabKey || word;
  const Icon = getIconForEntry({ ...card, __objectKey: objectKey });
  const isInCarousel = useContext(VocabularyCarouselContext);
  const router = useRouter();
  const segments = useSegments();
  const { readAloudMode } = useSpeech?.() || {};
  const { deckEntries, setDeckIndex, setDeckEntries } = useDeck?.() || {};
  const [isHovered, setIsHovered] = useState(false);

  // Special border color for letters: consonant/vowel
  if (__pos === 'letter') {
    if (__consonant) {
      borderColor = posColors['consonant'] || borderColor;
      borderLeftColor = borderColor;
      borderTopColor = borderColor;
      if (__vowel) {
        borderLeftColor = posColors['vowel'] || borderLeftColor;
        borderTopColor = posColors['vowel'] || borderTopColor;
      }
    } else {
      borderColor = posColors['vowel'] || borderColor;
      borderLeftColor = borderColor;
      borderTopColor = borderColor;
    }
  }

  // Special color for multigraphs
  if (__pos === 'multigraph') {
    borderColor = posColors['multigraph'] || '#8e44ad';
    borderLeftColor = borderColor;
    borderTopColor = borderColor;
  }

  // Press handler logic
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (size === 'small' && isInCarousel) {
      if (readAloudMode) return;
      const redirect = (card as any).__redirect;
      const isProperNoun =
        card.__pos === 'month' ||
        card.__pos === 'proper_noun' ||
        card.__pos === 'proper noun';
      let target;
      if (redirect) {
        target = redirect;
      } else if (isProperNoun) {
        if ((card as any).__objectKey) {
          target = (card as any).__objectKey.toLowerCase();
        } else if (card.word) {
          target = card.word.toLowerCase();
        } else {
          target = objectKey.toLowerCase();
        }
      } else {
        target = objectKey;
      }
      router.push(`/vocab/${encodeURIComponent(target)}`);
    } else if (size === 'medium') {
      const redirect = (card as any).__redirect;
      const isProperNoun =
        card.__pos === 'month' ||
        card.__pos === 'proper_noun' ||
        card.__pos === 'proper noun';
      let target;
      if (redirect) {
        target = redirect;
      } else if (isProperNoun) {
        if ((card as any).__objectKey) {
          target = (card as any).__objectKey.toLowerCase();
        } else if (card.word) {
          target = card.word.toLowerCase();
        } else {
          target = objectKey.toLowerCase();
        }
      } else {
        target = objectKey || word;
      }
      if (typeof cardIndex === 'number' && setDeckIndex) {
        setDeckIndex(cardIndex);
      } else if (setDeckEntries && setDeckIndex) {
        setDeckEntries(null);
        setDeckIndex(null);
      }
      router.push({ pathname: '/vocab/[entry]', params: { entry: target } });
    }
  };

  // Render logic for each size
  if (size === 'small') {
    // InlineCardPreview
    const borderRadius = 6;
    const CardContent = (
      <View
        style={[
          styles.inlineCard,
          { borderColor, borderLeftColor, borderTopColor, borderRadius },
          (__consonant || __vowel || __pos === 'number') && {},
          isMobile ? styles.mobile : styles.desktop,
          minWidth !== undefined
            ? {
                minWidth:
                  typeof minWidth === 'number' ||
                  (typeof minWidth === 'string' &&
                    (minWidth.endsWith('%') || minWidth === 'auto'))
                    ? minWidth
                    : undefined,
              }
            : {},
        ]}
      >
        {/* Top placeholder text */}
        <View
          style={[
            {
              backgroundColor:
                __pos === 'letter'
                  ? __consonant
                    ? posColorsLight['consonant']
                    : posColorsLight['vowel']
                  : posColorsLight[__pos],
            },
            styles.topTextContainer,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReadableText
              text={getTopPlaceholderText(
                __pos === 'letter'
                  ? __consonant
                    ? 'consonant'
                    : 'vowel'
                  : __pos
              )}
              style={{
                fontSize: isMobile ? 12 : 13,
                textAlign: 'center',
                color: '#000000',
                backgroundColor: '#111111', // Add background color for top placeholder
              }}
              pronunciation={
                __pos === 'letter'
                  ? __consonant
                    ? 'consonant'
                    : 'vowel'
                  : __pos
              }
              numberOfLines={1}
            />
            {/* Gender icon inline */}
            {__gender === 'masculine' && (
              <View style={{ marginLeft: 0 }}>
                {React.createElement(
                  require('@/utils/iconMap').iconMap['male'],
                  {
                    width: 16,
                    height: 16,
                  }
                )}
              </View>
            )}
            {__gender === 'feminine' && (
              <View style={{ marginLeft: 0 }}>
                {React.createElement(
                  require('@/utils/iconMap').iconMap['female'],
                  {
                    width: 16,
                    height: 16,
                  }
                )}
              </View>
            )}
          </View>
        </View>
        <View style={{ marginTop: __icon_text ? -7 : 0 }}>
          {Icon && (
            <Icon
              textsize={isMobile ? 24 : 22}
              textwidth={isMobile ? 42 : 42}
              width={isMobile ? 42 : 42}
              height={isMobile ? 28 : 32}
            />
          )}
        </View>
        {__show_word && (
          <ReadableText
            text={word}
            pronunciation={__forced_pronunciation}
            displayText={word.length > 7 ? word.slice(0, 6) + '…' : word}
            style={{
              fontSize: isMobile ? 13 : 14,
              marginBottom: 0,
              textAlign: 'center',

              // Only apply negative margin if Icon is a TextIcon
              marginTop: __icon_text ? -3 : 0,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        )}
      </View>
    );
    if (isInCarousel) {
      return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          {CardContent}
        </TouchableOpacity>
      );
    }
    return CardContent;
  }

  if (size === 'medium') {
    // CardPreview with redesigned top part of speech bar
    const previewBoxSize = isMobile ? 90 : 120;
    const minFontSize = isMobile ? 12 : 16;
    const words = word.split(/\s+/);
    return (
      <Pressable
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.card,
          isMobile ? styles.mobileCard : styles.desktopCard,
          { borderColor, borderLeftColor, borderTopColor },
          isHovered && styles.hoveredCard,
          minWidth ? { minWidth } : {},
        ]}
      >
        {/* Top part of speech bar anchored to top, overlapping border radius */}
        <View
          style={[
            styles.topTextContainerMedium,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 2,
              backgroundColor:
                __pos === 'letter'
                  ? __consonant
                    ? posColorsLight['consonant']
                    : posColorsLight['vowel']
                  : posColorsLight[__pos],
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible', // allow content to expand, prevents vertical clipping
              minHeight: 28, // ensure enough height for content
              paddingTop: 4,
              marginTop: 0,
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReadableText
              text={
                __pos === 'letter'
                  ? __consonant
                    ? 'consonant'
                    : 'vowel'
                  : __pos
              }
              style={{
                fontSize:
                  __pos === 'contraction' ||
                  __pos === 'punctuation' ||
                  __pos === 'exclamation' ||
                  __pos === 'proper noun'
                    ? isMobile
                      ? 16
                      : 22
                    : isMobile
                    ? 18
                    : 22,
                textAlign: 'center',
                color: '#000000',
                backgroundColor: '#111111',
              }}
              pronunciation={
                __pos === 'letter'
                  ? __consonant
                    ? 'consonant'
                    : 'vowel'
                  : __pos
              }
              numberOfLines={1}
            />
            {__gender === 'masculine' && (
              <View style={{ marginLeft: __pos === 'contraction' ? -2 : 4 }}>
                {React.createElement(
                  require('@/utils/iconMap').iconMap['male'],
                  {
                    width: 16,
                    height: 16,
                  }
                )}
              </View>
            )}
            {__gender === 'feminine' && (
              <View style={{ marginLeft: __pos === 'contraction' ? -2 : 4 }}>
                {React.createElement(
                  require('@/utils/iconMap').iconMap['female'],
                  {
                    width: 16,
                    height: 16,
                  }
                )}
              </View>
            )}
          </View>
        </View>
        {/* Spacer for top bar */}
        <View style={{ height: 22 }} />
        {Icon && (
          <View>
            <Icon
              width={isMobile ? 55 : 120}
              textsize={isMobile ? 40 : 60}
              textwidth={isMobile ? 80 : 120}
              height={isMobile ? 55 : 120}
            />
          </View>
        )}
        {/* Multigraph display */}
        {__pos === 'multigraph' && (
          <>
            <ReadableText
              text={
                word.length === 2
                  ? 'digraph'
                  : word.length === 3
                  ? 'trigraph'
                  : 'multigraph'
              }
              style={{
                fontStyle: 'italic',
                color: posColors['multigraph'] || '#8e44ad',
                fontSize: isMobile ? 13 : 18,
                textAlign: 'center',
                marginBottom: 2,
              }}
            />
          </>
        )}
        {__show_word !== false &&
          __pos !== 'letter' &&
          __pos !== 'multigraph' && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                width: '100%',
              }}
            >
              {words.map((w: string, idx: number) => {
                const displayText: string =
                  w.length > 14 ? w.slice(0, 13) + '…' : w;
                const fontSize: number =
                  w.length > 10
                    ? getLexendFontSizeToFit(w, previewBoxSize, minFontSize)
                    : isMobile
                    ? 18
                    : 28;
                return (
                  <ReadableText
                    key={idx}
                    text={w}
                    pronunciation={__forced_pronunciation}
                    displayText={displayText}
                    style={{
                      fontSize,
                      textAlign: 'center',
                      flexWrap: 'wrap',
                      alignSelf: 'center',
                      marginRight: idx < words.length - 1 ? 4 : 0,
                    }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  />
                );
              })}
            </View>
          )}
        {__pos === 'letter' && __vowel && (
          <ReadableText
            text={__consonant ? 'vowel,' : 'vowel'}
            style={{
              fontStyle: 'italic',
              color: posColors['vowel'],
              fontSize: isMobile ? 14 : 20,
              textAlign: 'center',
            }}
          />
        )}
        {__pos === 'letter' && __consonant && (
          <ReadableText
            text={'consonant'}
            style={{
              fontStyle: 'italic',
              color: posColors['consonant'],
              fontSize: isMobile ? 14 : 20,
              textAlign: 'center',
            }}
          />
        )}
      </Pressable>
    );
  }

  // Large: VocabEntryDisplay
  // Large: VocabEntryDisplay with redesigned top part of speech bar
  return (
    <View
      style={[
        styles.container,
        { borderColor, borderLeftColor, borderTopColor },
      ]}
    >
      {/* Top part of speech bar anchored to top, overlapping border radius */}
      <View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 2,
            backgroundColor:
              __pos === 'letter'
                ? __consonant
                  ? posColorsLight['consonant']
                  : posColorsLight['vowel']
                : posColorsLight[__pos],
            minHeight: 22,
            paddingTop: 4,
            marginTop: 0, // remove negative margin to prevent clipping
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ReadableText
            text={
              __pos === 'letter' ? (__consonant ? 'consonant' : 'vowel') : __pos
            }
            style={{
              fontSize: isMobile ? 24 : 32,
              textAlign: 'center',
              color: '#000000',
              backgroundColor: '#111111',
              // fontStyle: 'italic',
            }}
            pronunciation={
              __pos === 'letter' ? (__consonant ? 'consonant' : 'vowel') : __pos
            }
            numberOfLines={1}
          />
          {__gender === 'masculine' && (
            <View style={{ marginLeft: 6 }}>
              {React.createElement(require('@/utils/iconMap').iconMap['male'], {
                width: 28,
                height: 28,
              })}
            </View>
          )}
          {__gender === 'feminine' && (
            <View style={{ marginLeft: 6 }}>
              {React.createElement(
                require('@/utils/iconMap').iconMap['female'],
                {
                  width: 28,
                  height: 28,
                }
              )}
            </View>
          )}
        </View>
      </View>
      {/* Spacer for top bar */}
      <View style={{ height: 22 }} />
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon
            textsize={isMobile ? 40 : 60}
            textwidth={isMobile ? 80 : 120}
            width={isMobile ? 80 : 140}
            height={isMobile ? 80 : 140}
          />
        </View>
      )}
      {/* Multigraph display */}
      {__pos === 'multigraph' && (
        <>
          <ReadableText
            text={word.length == 2 ? 'digraph' : 'multigraph'}
            style={{
              fontStyle: 'italic',
              color: posColors['multigraph'] || '#8e44ad',
              fontSize: isMobile ? 18 : 24,
              textAlign: 'center',
              marginBottom: 8,
            }}
          />
        </>
      )}
      {__show_word !== false &&
        __pos !== 'letter' &&
        __pos !== 'multigraph' && (
          <ReadableText
            text={word}
            pronunciation={__forced_pronunciation}
            style={[styles.word, { fontSize: isMobile ? 28 : 40 }]}
          />
        )}
      {__pos === 'letter' && __vowel && (
        <ReadableText
          text={__consonant ? 'vowel,' : 'vowel'}
          style={{
            fontStyle: 'italic',
            color: posColors['vowel'],
            fontSize: isMobile ? 14 : 20,
            textAlign: 'center',
          }}
        />
      )}
      {__pos === 'letter' && __consonant && (
        <ReadableText
          text={'consonant'}
          style={{
            fontStyle: 'italic',
            color: posColors['consonant'],
            fontSize: isMobile ? 14 : 20,
            textAlign: 'center',
          }}
        />
      )}
      {__pos === 'noun' && plural && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ReadableText
            text="Plural:"
            style={[styles.plural, { fontSize: isMobile ? 18 : 28 }]}
          />
          <Text> </Text>
          <ReadableText
            text={`${plural}`}
            style={[styles.plural, { fontSize: isMobile ? 18 : 28 }]}
          />
        </View>
      )}
      {__pos === 'noun' && __count && (
        <ReadableText
          text={`${__count.charAt(0).toUpperCase() + __count.slice(1)} noun`}
          style={styles.countable}
        />
      )}
      {/* Play pronunciation button inside the card */}
      {(__pos === 'multigraph'
        ? Array.isArray(card.__exampleEntries) &&
          card.__exampleEntries.length === 1
        : true) && (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <PlayPronunciationButton
            word={word}
            pronunciation={
              card.__forced_pronunciation
                ? card.__forced_pronunciation
                : card.word
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Large (VocabEntryDisplay)
  container: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 400,
    minHeight: 350,
  },
  iconContainer: {
    marginBottom: 16,
  },
  word: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  pos: {
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  plural: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 22, // Increased font size for plural
  },
  countable: {
    marginBottom: 4,
    textAlign: 'center',
    color: '#666',
  },
  // Medium (CardPreview)
  card: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: 120,
    height: 150,
  },
  hoveredCard: {
    backgroundColor: '#ffeeee',
  },
  mobileCard: {
    width: '32%',
    fontSize: 20,
    padding: 8,
    margin: 1,
  },
  desktopCard: {
    width: '18%',
    fontSize: 24,
    padding: 12,
    height: 300,
  },
  // Small (InlineCardPreview)
  inlineCard: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start', // changed to flex-start
    marginHorizontal: 4,
    height: 72,
    flexShrink: 0,
    overflow: 'hidden',
  },
  topTextContainer: {
    width: '120%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 18,
    marginBottom: 6,
    marginTop: -4, // expand into border-radius
    zIndex: 2,

    overflow: 'hidden', // ensures background doesn't bleed outside
  },
  topTextContainerMedium: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
    marginBottom: 4,
    marginTop: -8, // expand into border-radius
    zIndex: 2,
    backgroundColor: '#ffccc0', // Add background color for top placeholder
  },
  mobile: {
    width: 54,
    height: 66,
    padding: 2,
  },
  desktop: {
    width: 63,
    height: 80,
    padding: 4,
  },
});

export default VocabCard;
