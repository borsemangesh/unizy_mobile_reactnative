// import React from "react";
// import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";


// type PreviewCardProps = {
//   tag: string;
//   infoTitle: string;
//   inforTitlePrice: string;
//   rating:string;
//   productImage: ImageSourcePropType
// };


// export default function PreviewCard({tag,infoTitle,inforTitlePrice,rating,productImage}:PreviewCardProps) {
//   return (
//     <View style={styles.card}>
      
//       <View style={styles.imageContainer}>
//         <Image
//           source={productImage}
//           style={styles.image}
//         />

 
//         <View style={styles.tag}>
//           <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
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
//           <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
//           <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
//         </View>
       
//         <View style={styles.ratingAbsolute}>
//         <Image
//           source={require('../../assets/images/staricon.png')}
//           style={styles.image1}/>

//         <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
//       </View>
//       </View>
     
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width:320 ,
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
//     padding:(Platform.OS === 'ios' ? 0 : 12),
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
//     top: (Platform.OS === 'ios' ? 2 : 10),
//     right: (Platform.OS === 'ios' ? 2 : 10),
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
//     fontWeight: '600',
//     color: '#fff',
//      fontFamily: 'Urbanist-SemiBold',
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

import { BlurView } from "@react-native-community/blur";
import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";


type PreviewCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating:string;
  productImage: ImageSourcePropType
};


export default function PreviewCard({tag,infoTitle,inforTitlePrice,rating,productImage}:PreviewCardProps) {
  return (
    <View style={styles.card}>
      
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
        />

 
        <View style={styles.tag}>
          <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
        </View>
        {/* </LinearGradient> */}
      
        {/* <View style={styles.bookmark1}>
          <Image
            source={require('../../assets/images/bookmark.png')}
            style={{ width: 48, height: 48 }}
          />
        </View> */}

          <View style={styles.bookmark1}>
            <BlurView 
                                blurType="light"
                                blurAmount={100}
                                style={StyleSheet.absoluteFillObject}
                              />
            <LinearGradient
                        colors={[
                          'rgba(0, 1, 102, 0.20)',   // center strong blue tint
                          'rgba(0, 1, 102, 0.024)'  // outer faint blue tint
                        ]}
                        style={StyleSheet.absoluteFillObject}
                        useAngle={false} // radial
               />

          <Image
            source={require('../../assets/images/favourite.png')}
            style={{ width: 26, height: 26 }}
          />
        </View>
      </View>
{/* require('../../assets/images/bookmark.png') */}
      
      {/* <View style={styles.infoRow}>
        <View>
          <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
          <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
        </View>
       
        <View style={styles.ratingAbsolute}>
        <Image
          source={require('../../assets/images/staricon.png')}
          style={styles.image1}/>

        <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
      </View>
      </View> */}
     
          <View style={styles.infoRow}>
                      <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
              
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '90%',
                          justifyContent: 'space-between',
              
                        }}
                      >
                        <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Image
                            source={require('../../assets/images/staricon.png')}
                            style={styles.image1}
                          />
              
                          <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
                        </View>
                      </View>
                    </View>


    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width:320 ,
    borderRadius: 20,
    backgroundColor: '#5973c1ff',
    marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    height:290,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
  },
  imageContainer: {
    width: '100%',
    height: 230,
    position: 'relative',
    padding:(Platform.OS === 'ios' ? 0 : 12),
  },
  image: {
    width: '100%',
    height: '100%',
    padding:12,
    borderRadius:12,
    //borderColor:'000',
   // borderWidth:2,
    alignSelf:'center'
  },

   image1: {
    width: 16,
    height: 16,
    
  },
  bookmark1: {
    position: 'absolute',
    //top: 10,
    //right: 10,
    top: (Platform.OS === 'ios'? 20: 20),
    right: (Platform.OS === 'ios'? 20: 20),

    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',


    borderRadius: 16,

    //borderRadius: 12,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',

    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ffffff79',
    overflow: 'hidden',
    borderBlockStartColor: 'rgba(255, 255, 255, 0.25)',
    borderBlockColor: 'rgba(255, 255, 255, 0.25)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(255, 255, 255, 0.25)',

    
  },
   bookmark: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 2 : 10),
    right: (Platform.OS === 'ios' ? 2 : 10),
    borderRadius: 20,
    padding: 6,
  },
  // tag: {
  //   position: 'absolute',
  //   bottom: 10,
  //   right: 10,
  //   //backgroundColor: '#fff',
  //   backgroundColor:'rgba(255,255,255,0.4)',
  //   borderRadius: 12,
  //   padding: 8,
  //   marginVertical:8,
  //   marginHorizontal:8,
  //    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  // },
  tag: {
    position: 'absolute',
    bottom: (Platform.OS === 'ios' ? 16 : 16),
    right:(Platform.OS === 'ios' ? 16 : 16),
    //backgroundColor: '#fff',
    //backgroundColor:'rgba(255,255,255,0.4)',
    overflow:'hidden',
    borderRadius: 12,
    padding: 8,
     marginVertical:8,
    marginHorizontal:8,
     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
     //overflow:'hidden'
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',

  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    
  },
  // infoRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 16,
  //   //backgroundColor: '#fff',
  // },

   infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 2,

  
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 2,
    width:'90%'
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
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
  },
  
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
    marginLeft: 4,
  },
  ratingAbsolute: {
  position: 'absolute',
  bottom:10,
  right: 10,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
});