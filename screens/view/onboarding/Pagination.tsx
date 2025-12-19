import { StyleSheet, View } from "react-native";

const Pagination = ({ data, index }: any) => {
    return (
      <View style={styles.container}>
        {data.map((_: any, i: number) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };
  
  export default Pagination;
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      // marginBottom: 110,
      position: 'absolute',
      bottom: 97,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    dot: {
      height: 8,
      width: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: '#FFFFFF',
      width: 8,
    },
  });