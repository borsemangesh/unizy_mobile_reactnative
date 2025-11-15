import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { emoji } from './emoji';
// @ts-ignore - react-native-vector-icons types
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Emoji {
  char: string;
  name: string;
}

interface EmojiKeyboardProps {
  onEmojiSelected: (char: string) => void;
}

const { width } = Dimensions.get('window');

// Category definitions based on emoji data structure
const getCategoryEmojis = (categoryId: string) => {
  switch (categoryId) {
    case 'faces':
      return emoji.slice(0, 77); // Faces & Emotions (0-77)
    case 'gestures':
      return emoji.slice(79, 99); // Gestures & People (79-99)
    case 'objects':
      return emoji.slice(101, 132); // Objects & Symbols (101-132)
    case 'nature':
      return emoji.slice(134, 155); // Nature (134-155)
    case 'food':
      return emoji.slice(157, 186); // Food & Drink (157-186)
    case 'travel':
      return emoji.slice(188, 205); // Travel & Places (188-205)
    case 'flags':
      return emoji.slice(207, 217); // Flags & Symbols (207-217)
    default:
      return emoji.slice(0, 77);
  }
};

const categories = [
  { id: 'faces', name: 'Smileys & People', icon: '😀' },
  { id: 'gestures', name: 'Gestures & People', icon: '👍' },
  { id: 'objects', name: 'Objects & Symbols', icon: '💡' },
  { id: 'nature', name: 'Nature', icon: '🌍' },
  { id: 'food', name: 'Food & Drink', icon: '🍔' },
  { id: 'travel', name: 'Travel & Places', icon: '🚗' },
  { id: 'flags', name: 'Flags & Symbols', icon: '🏁' },
];

const EmojiKeyboard: React.FC<EmojiKeyboardProps> = ({ onEmojiSelected }) => {
  const [selectedCategory, setSelectedCategory] = useState('faces');
  const [selectedTopTab, setSelectedTopTab] = useState('smiley');

  const emojiSize = width < 400 ? 28 : 32;

  // Get emojis for selected category
  const filteredEmojis = useMemo(() => {
    return getCategoryEmojis(selectedCategory);
  }, [selectedCategory]);

  const renderItem = ({ item }: { item: Emoji }) => (
    <TouchableOpacity
      onPress={() => onEmojiSelected(item.char)}
      style={styles.emojiItem}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: emojiSize }}>{item.char}</Text>
    </TouchableOpacity>
  );

  const handleDelete = () => {
    // Delete last character - this will be handled by parent
    onEmojiSelected('DELETE');
  };

  return (
    <View style={styles.container}>
      {/* Top Category Tabs (WhatsApp style) */}
      <View style={styles.topTabsContainer}>
        <TouchableOpacity
          style={[styles.topTab, selectedTopTab === 'smiley' && styles.topTabActive]}
          onPress={() => {
            setSelectedTopTab('smiley');
            setSelectedCategory('faces');
          }}
        >
          <Text style={styles.topTabIcon}>😀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, selectedTopTab === 'gif' && styles.topTabActive]}
          onPress={() => setSelectedTopTab('gif')}
        >
          <Text style={styles.topTabText}>GIF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, selectedTopTab === 'person' && styles.topTabActive]}
          onPress={() => {
            setSelectedTopTab('person');
            setSelectedCategory('gestures');
          }}
        >
          <MaterialIcons name="person" size={20} color={selectedTopTab === 'person' ? '#0084ff' : '#666'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, selectedTopTab === 'sticker' && styles.topTabActive]}
          onPress={() => setSelectedTopTab('sticker')}
        >
          <MaterialIcons name="image" size={20} color={selectedTopTab === 'sticker' ? '#0084ff' : '#666'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topTab} onPress={handleDelete}>
          <MaterialIcons name="backspace" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Category Name */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>
          {categories.find(c => c.id === selectedCategory)?.name || 'Smileys & People'}
        </Text>
      </View>

      {/* Emoji Grid */}
      <FlatList
        data={filteredEmojis}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.char}-${index}`}
        numColumns={8}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.emojiList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Bottom Category Navigation - WhatsApp style */}
      <View style={styles.bottomNavContainer}>
        {/* Recently Used (Clock icon) */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'faces' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('faces');
            setSelectedTopTab('smiley');
          }}
        >
          <MaterialIcons
            name="access-time"
            size={22}
            color={selectedCategory === 'faces' ? '#0084ff' : '#666'}
          />
        </TouchableOpacity>
        
        {/* Smileys & People */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'faces' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('faces');
            setSelectedTopTab('smiley');
          }}
        >
          <Text style={styles.bottomNavEmoji}>😀</Text>
        </TouchableOpacity>
        
        {/* Gestures & People */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'gestures' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('gestures');
            setSelectedTopTab('person');
          }}
        >
          <Text style={styles.bottomNavEmoji}>👤</Text>
        </TouchableOpacity>
        
        {/* Nature */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'nature' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('nature');
          }}
        >
          <Text style={styles.bottomNavEmoji}>🌿</Text>
        </TouchableOpacity>
        
        {/* Food & Drink */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'food' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('food');
          }}
        >
          <Text style={styles.bottomNavEmoji}>🍔</Text>
        </TouchableOpacity>
        
        {/* Travel & Places */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'travel' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('travel');
          }}
        >
          <Text style={styles.bottomNavEmoji}>🚗</Text>
        </TouchableOpacity>
        
        {/* Objects & Symbols */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'objects' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('objects');
          }}
        >
          <Text style={styles.bottomNavEmoji}>💡</Text>
        </TouchableOpacity>
        
        {/* Symbols */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'objects' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('objects');
          }}
        >
          <MaterialIcons
            name="tag"
            size={20}
            color={selectedCategory === 'objects' ? '#0084ff' : '#666'}
          />
        </TouchableOpacity>
        
        {/* Flags */}
        <TouchableOpacity
          style={[styles.bottomNavItem, selectedCategory === 'flags' && styles.bottomNavItemActive]}
          onPress={() => {
            setSelectedCategory('flags');
          }}
        >
          <Text style={styles.bottomNavEmoji}>🚩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    fontFamily: 'Urbanist-Medium',
  },
  clearButton: {
    padding: 4,
  },
  topTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  topTabActive: {
    backgroundColor: '#FFFFFF',
  },
  topTabIcon: {
    fontSize: 24,
  },
  topTabText: {
    fontSize: 14,
    fontFamily: 'Urbanist-Medium',
    color: '#666',
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryName: {
    fontSize: 13,
    fontFamily: 'Urbanist-SemiBold',
    color: '#666',
    textTransform: 'uppercase',
  },
  emojiList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  row: {
    justifyContent: 'space-around',
  },
  emojiItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomNavItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  bottomNavItemActive: {
    backgroundColor: '#E3F2FD',
  },
  bottomNavEmoji: {
    fontSize: 22,
  },
});

export default EmojiKeyboard;
