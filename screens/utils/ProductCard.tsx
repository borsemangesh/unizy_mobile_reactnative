// import React from "react";
// import { View, Text, Image, StyleSheet, ImageSourcePropType } from "react-native";


// // export default function ProductCard() {
// //   return (
   
// //     <View style={{ 
// //         paddingTop: 10,
// //         paddingLeft: 12,
        
// //     }}>
// //       <View style={styles.imageContainer}>
// //         <Image
// //           source={{ uri: "https://picsum.photos/600/400" }}
// //           style={styles.image}
// //         />

// //           <Text style={styles.tagText}>University of Warwick</Text>
        
// //       </View>
// //       <View style={styles.infoRow}>
// //         <View>
// //           <Text style={styles.title}>Quadcopter (Drone)</Text>
// //           <Text style={styles.price}>$10.00</Text>
// //         </View>

      
// //         <View style={styles.rating}>
         
// //           <Text style={styles.ratingText}>4.5</Text>
// //         </View>
// //       </View>
// //       </View>
   
// //   );
// // }

// // const styles = StyleSheet.create({
// //   card: {
// //     borderRadius: 20,
// //     margin: 20,
// //     overflow: "hidden",
// //     shadowColor: "#000",
// //     shadowOpacity: 0.2,
// //     shadowRadius: 10,
// //     shadowOffset: { width: 0, height: 5 },
// //     elevation: 5,
// //   },
// //   imageContainer: {
// //     position: "relative",
// //     width: "100%",
// //     height: 160,
// //   },
// //   image: {
// //     width: "100%",
// //     height: "100%",
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //   },
// //   bookmark: {
// //     position: "absolute",
// //     top: 10,
// //     right: 10,
// //     borderRadius: 20,
// //     padding: 6,
// //     overflow: "hidden",
// //   },
// //   tag: {
// //     position: "absolute",
// //     bottom: 10,
// //     left: 10,
// //     borderRadius: 15,
// //     paddingHorizontal: 12,
// //     paddingVertical: 4,
// //     overflow: "hidden",
// //   },
// //   tagText: {
// //     fontSize: 12,
// //     fontWeight: "500",
// //     color: "#333",
// //   },
// //   infoRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     padding: 12,
// //   },
// //   title: {
// //     fontSize: 15,
// //     fontWeight: "600",
// //     color: "#fff",
// //     marginBottom: 2,
// //   },
// //   price: {
// //     fontSize: 13,
// //     fontWeight: "500",
// //     color: "#fff",
// //   },
// //   rating: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "rgba(255,255,255,0.15)",
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 12,
// //   },
// //   ratingText: {
// //     fontSize: 13,
// //     fontWeight: "500",
// //     color: "#fff",
// //     marginLeft: 4,
// //   },
// // });

// type ProductCardProps = {
//   tag: string;
//   infoTitle: string;
//   inforTitlePrice: string;
//   rating:string;
//   productImage: ImageSourcePropType
// };


// export default function ProductCard({tag,infoTitle,inforTitlePrice,rating,productImage}:ProductCardProps) {
//   return (
//     <View style={styles.card}>
      
//       <View style={styles.imageContainer}>
//         <Image
//           source={productImage}
//           style={styles.image}
//         />

 
//         <View style={styles.tag}>
//           <Text style={styles.tagText}>{tag}</Text>
//         </View>
//         {/* </LinearGradient> */}
      
//         <View style={styles.bookmark1}>
//           <Image
//             source={require('../../assets/images/bookmark.png')}
//             style={{ width: 48, height: 48 }}
//           />
//         </View>
//       </View>
// {/* require('../../assets/images/bookmark.png') */}
//       <View style={styles.infoRow}>
//         <View>
//           <Text style={styles.title}>{infoTitle}</Text>
//           <Text style={styles.price}>{inforTitlePrice}</Text>
//         </View>
       
//         <View style={styles.ratingAbsolute}>
//         <Image
//           source={require('../../assets/images/staricon.png')}
//           style={styles.image1}/>

//         <Text style={styles.ratingText}>{rating}</Text>
//       </View>
//       </View>
     
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width: 320,
//     borderRadius: 20,
//     backgroundColor: '#5973c1ff',
//     marginHorizontal: 8,
//     // shadow for iOS
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     overflow: 'hidden',
//     height:300,
//     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
    
//   },
//   imageContainer: {
//     width: '100%',
//     height: 230,
//     position: 'relative',
//     padding:12
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     padding:12,
//     borderRadius:12,
//     //borderColor:'000',
//    // borderWidth:2,
//     alignSelf:'center'
//   },

//    image1: {
//     width: 16,
//     height: 16,
    
//   },
//   bookmark1: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     borderRadius: 20,
    
//   },
//    bookmark: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     borderRadius: 20,
//     padding: 6,
//   },
//   tag: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     //backgroundColor: '#fff',
//     backgroundColor:'rgba(255,255,255,0.4)',
//     borderRadius: 12,
//     padding: 8,
//     marginVertical:8,
//     marginHorizontal:8,
//      boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
//   },
//   tagText: {
//     fontSize: 11,
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: '600',
//     color: '#000',
    
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     //backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#fff',
//     fontFamily: 'Urbanist-SemiBold',
//     marginBottom: 2,
//   },
//    title1: {
//     fontSize: 14,
//     fontWeight: '400',
//     color: '#000',
//     fontFamily: 'Urbanist-Regular',
//     marginBottom: 2,
//   },
//   price: {
//     fontSize: 17,
//     fontWeight: '500',
//     color: '#fff',
//      fontFamily: 'Urbanist-Bold',
//   },
  
//   ratingText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//      fontFamily: 'Urbanist-SemiBold',
//     marginLeft: 4,
//   },
//   ratingAbsolute: {
//   position: 'absolute',
//   bottom:10,
//   right: 10,
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingHorizontal: 8,
//   paddingVertical: 4,
//   borderRadius: 12,
// },
// });
import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";


// export default function ProductCard() {
//   return (
   
//     <View style={{ 
//         paddingTop: 10,
//         paddingLeft: 12,
        
//     }}>
//       <View style={styles.imageContainer}>
//         <Image
//           source={{ uri: "https://picsum.photos/600/400" }}
//           style={styles.image}
//         />

//           <Text style={styles.tagText}>University of Warwick</Text>
        
//       </View>
//       <View style={styles.infoRow}>
//         <View>
//           <Text style={styles.title}>Quadcopter (Drone)</Text>
//           <Text style={styles.price}>$10.00</Text>
//         </View>

      
//         <View style={styles.rating}>
         
//           <Text style={styles.ratingText}>4.5</Text>
//         </View>
//       </View>
//       </View>
   
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 20,
//     margin: 20,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     elevation: 5,
//   },
//   imageContainer: {
//     position: "relative",
//     width: "100%",
//     height: 160,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   bookmark: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     borderRadius: 20,
//     padding: 6,
//     overflow: "hidden",
//   },
//   tag: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     overflow: "hidden",
//   },
//   tagText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#333",
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 12,
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#fff",
//     marginBottom: 2,
//   },
//   price: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#fff",
//   },
//   rating: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   ratingText: {
//     fontSize: 13,
//     fontWeight: "500",
//     color: "#fff",
//     marginLeft: 4,
//   },
// });

type ProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating:string;
  productImage: ImageSourcePropType
};


export default function ProductCard({tag,infoTitle,inforTitlePrice,rating,productImage}:ProductCardProps) {
  return (
    <View style={styles.card}>
      
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
        />

 
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        {/* </LinearGradient> */}
      
        <View style={styles.bookmark1}>
          <Image
            source={require('../../assets/images/bookmark.png')}
            style={{ width: 48, height: 48 }}
          />
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.title}>{infoTitle}</Text>
          <View style={{flexDirection:'row',width: '100%',justifyContent:'space-between'}}>
            
            <Text style={styles.price}>{inforTitlePrice}</Text>
            <View style={{flexDirection:'row'}}>
              <Image
                source={require('../../assets/images/staricon.png')}
                style={styles.image1}/>

              <Text style={styles.ratingText}>{rating}</Text>
              </View>
          </View>
      </View>
     
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: (Platform.OS === 'ios' ? 350 : 290),
    minWidth: '80%',
    padding:(Platform.OS === 'ios' ? 0 : 10),
  
    height:'70%',
    minHeight: '90%',
    borderRadius: 34,
    backgroundColor: '#5973c1ff',
    marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
    borderBlockColor: '#ffffff79',
    borderStartColor: '#ffffff79',
    borderWidth: 0.4,
    borderColor: '#ffffff79',
    
    // borderTopColor: '#ffffff5d',
    // borderBottomColor: '#ffffff36',
    // borderLeftColor: '#ffffff5d',
    // borderRightColor: '#ffffff36',
  },
  imageContainer: {
    width: '100%',
    height: '80%',
  },
  image: {
    width: '100%',
    height: '100%',
    padding:12,
    borderRadius:34,
  },

   image1: {
    width: 16,
    height: 16,
    
  },
  bookmark1: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 25 : 10),
    right: (Platform.OS === 'ios' ? 25 : 10),
    borderRadius: 20,
    
  },
   bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    padding: 6,
  },
  tag: {
    position: 'absolute',
    // bottom: 10,
    // right: 10,
    bottom:  (Platform.OS === 'ios' ? 15 : 10),
    right: (Platform.OS === 'ios' ? 20 : 10),
    //backgroundColor: '#fff',
    backgroundColor:'rgba(255,255,255,0.4)',
    borderRadius: 12,
    padding: 8,
    marginVertical:8,
    marginHorizontal:8,
     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: (Platform.OS === 'ios' ? 0 : 10),
    width: '99%'
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 2,
    width: '100%',
  },
   title1: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Urbanist-Regular',
    marginBottom: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
     fontFamily: 'Urbanist-Bold',
  },
  
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
    marginLeft: 4,
  },
  ratingAbsolute: {
  // position: 'absolute',
  // bottom:10,
  // right: 10,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
});