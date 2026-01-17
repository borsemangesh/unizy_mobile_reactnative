import { StyleSheet, View } from "react-native";

// const Pagination = ({ data, index }: any) => {
//     return (
//       <View style={styles.container}>
//         {data.map((_: any, i: number) => (
//           <View
//             key={i}
//             style={[
//               styles.dot,
//               index === i && styles.activeDot,
//             ]}
//           />
//         ))}
//       </View>
//     );
//   };

const Pagination = ({ data, index }: any) => {
  return (
    <View style={styles.stepIndicatorContainer}>
      {data.map((_: any, i: number) => (
        <View
          key={i}
          style={[
            styles.stepCircle,
            index === i ? styles.activeStepCircle : styles.inactiveStepCircle,
          ]}
        />
      ))}
    </View>
  );
};
  
  export default Pagination;
  
  const styles = StyleSheet.create({

     stepIndicatorContainer: {
    position: 'absolute',
    bottom: 97, // keep your carousel position
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },

  stepCircle: {
    width: 12,
    height: 12,
    borderRadius: 40,
  },

  activeStepCircle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ffffff4e',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.33,
    elevation: 2,
  },

  inactiveStepCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff4e',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.33,
    elevation: 2,
  },
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