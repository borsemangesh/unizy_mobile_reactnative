import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { emoji } from "./emoji";


interface Emoji {
  char: string;
  name: string;
}

interface EmojiKeyboardProps {
  onEmojiSelected: (char: string) => void;
}

const { width } = Dimensions.get('window');


const EmojiKeyboard: React.FC<EmojiKeyboardProps> = ({ onEmojiSelected }) => {
    const emojiSize = width < 400 ? 28 : 32; 


   const renderItem = ({ item }: { item: Emoji }) => (
        <TouchableOpacity
            onPress={() => onEmojiSelected(item.char)}
            style={demoStyles.emojiItem}
        >
            <Text style={{ fontSize: emojiSize }}>{item.char}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={demoStyles.emojiPickerContainer}>
            <FlatList
                data={emoji}
                renderItem={renderItem}
                keyExtractor={(item) => item.char}
                numColumns={8}
                columnWrapperStyle={demoStyles.row}
            />
        </View>
    );
};

const demoStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2B63',
        paddingTop: 50,
        alignItems: 'center',
    },
    headerText: {
        color: '#FFF',
        fontSize: 18,
        marginBottom: 10,
    },
    selectedText: {
        color: '#FFD700',
        fontSize: 30,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: '80%',
        backgroundColor: '#ffffff5f',
        marginBottom: 20,
    },
    emojiPickerContainer: {
        height: Dimensions.get('window').height * 0.3, 
        width: '100%',
        backgroundColor: '#34478dff',
        paddingVertical: 0,
    },
    emojiItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    row: {
        justifyContent: 'space-around',
    },
});

export default EmojiKeyboard;