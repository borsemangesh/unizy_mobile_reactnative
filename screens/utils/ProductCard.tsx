import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { wp, hp } from '../utils/component/responsive';

type ProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  isBookmarked: boolean;
  onBookmarkPress?: () => void;
  onpress?: () => void;
};

export default function ProductCard({
  tag,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  onBookmarkPress,
  isBookmarked,
  onpress,
}: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onpress} activeOpacity={0.9}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={productImage}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.tag}>
            <BlurView
              blurType="light"
              blurAmount={12}
              style={StyleSheet.absoluteFillObject}
            />
            <Text allowFontScaling={false} style={styles.tagText}>
              {tag}
            </Text>
          </View>

          <View style={styles.bookmark}>
            <BlurView
              blurType="light"
              blurAmount={12}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['rgba(0, 1, 102, 0.20)', 'rgba(0, 1, 102, 0.024)']}
              style={StyleSheet.absoluteFillObject}
              useAngle={false}
            />

            <TouchableOpacity onPress={onBookmarkPress}>
              <Image
                source={
                  isBookmarked
                    ? require('../../assets/images/favourite_filled.png')
                    : require('../../assets/images/favourite.png')
                }
                style={styles.bookmarkIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text numberOfLines={1} allowFontScaling={false} style={styles.title}>
            {infoTitle}
          </Text>
          <View style={styles.priceRow}>
            <Text allowFontScaling={false} style={styles.price}>
              {inforTitlePrice}
            </Text>
            {rating !== '0.0' && (
              <View style={styles.ratingRow}>
                <Image
                  source={require('../../assets/images/staricon.png')}
                  style={styles.starIcon}
                />
                <Text allowFontScaling={false} style={styles.ratingText}>
                  {rating}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Fills featured list height; width peeks next card
  card: {
    width: wp(86),
    height: '99%',
    marginRight: wp(3),
    borderRadius: wp(8),
    shadowColor: '#000',
    shadowOpacity: 0.15,
     marginTop: wp(0.2),
    shadowRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
    borderColor: '#ffffff11',
    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.17) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  imageContainer: {
    width: '100%',
    height: '76%',
    position: 'relative',
    paddingHorizontal: '3.5%',
    paddingTop: '3.5%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: wp(5),
    backgroundColor: '#ccc',
  },
  tag: {
    position: 'absolute',
    bottom: hp(1.2),
    right: wp(5.5),
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.45),
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    minHeight: hp(3.2),
    overflow: 'hidden',
    alignSelf: 'flex-end',
    flexShrink: 1,
    maxWidth: '58%',
  },
  tagText: {
    color: 'rgba(0, 0, 0, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: wp(2.8),
    lineHeight: wp(3.6),
    width: '100%',
    textAlign: 'right',
    flexShrink: 1,
    includeFontPadding: false,
  },
  bookmark: {
    position: 'absolute',
    top: hp(2.4),
    right: wp(5.5),
    width: wp(11),
    height: wp(11),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: wp(4),
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ffffff79',
    overflow: 'hidden',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(255, 255, 255, 0.25)',
  },
  bookmarkIcon: {
    width: wp(6),
    height: wp(6),
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: hp(1),
    flex: 1,
    paddingBottom: hp(1),
  },
  title: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: '#fff',
    width: '100%',
    fontFamily: 'Urbanist-SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: hp(0.4),
  },
  price: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  starIcon: {
    width: wp(4.1),
    height: wp(4.1),
  },
  ratingText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#fff',
  },
});
//------------------------------------------------------------

// import { BlurView } from '@react-native-community/blur';
// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ImageSourcePropType,
//   TouchableOpacity,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { hp, wp } from './component/responsive';

// type ProductCardProps = {
//   tag: string;
//   infoTitle: string;
//   inforTitlePrice: string;
//   rating: string;
//   productImage: ImageSourcePropType;
//   isBookmarked: boolean;
//   onBookmarkPress?: () => void;
//   onpress?: () => void;
// };

// export default function ProductCard({
//   tag,
//   infoTitle,
//   inforTitlePrice,
//   rating,
//   productImage,
//   onBookmarkPress,
//   isBookmarked,
//   onpress,
// }: ProductCardProps) {
//   return (
//     <TouchableOpacity onPress={onpress} activeOpacity={0.9}>
//       <View style={styles.card}>
//         <View style={styles.imageContainer}>
//           <Image
//             source={productImage}
//             style={styles.image}
//             resizeMode="cover"
//           />

//           <View style={styles.tag}>
//             <BlurView
//               blurType="light"
//               blurAmount={12}
//               style={StyleSheet.absoluteFillObject}
//             />
//             <Text allowFontScaling={false} style={styles.tagText}>
//               {tag}
//             </Text>
//           </View>

//           <View style={styles.bookmark}>
//             <BlurView
//               blurType="light"
//               blurAmount={12}
//               style={StyleSheet.absoluteFillObject}
//             />
//             <LinearGradient
//               colors={['rgba(0, 1, 102, 0.20)', 'rgba(0, 1, 102, 0.024)']}
//               style={StyleSheet.absoluteFillObject}
//               useAngle={false}
//             />

//             <TouchableOpacity onPress={onBookmarkPress}>
//               <Image
//                 source={
//                   isBookmarked
//                     ? require('../../assets/images/favourite_filled.png')
//                     : require('../../assets/images/favourite.png')
//                 }
//                 style={styles.bookmarkIcon}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.infoRow}>
//           <Text numberOfLines={1} allowFontScaling={false} style={styles.title}>
//             {infoTitle}
//           </Text>
//           <View style={styles.priceRow}>
//             <Text allowFontScaling={false} style={styles.price}>
//               {inforTitlePrice}
//             </Text>
//             {rating !== '0.0' && (
//               <View style={styles.ratingRow}>
//                 <Image
//                   source={require('../../assets/images/staricon.png')}
//                   style={styles.starIcon}
//                 />
//                 <Text allowFontScaling={false} style={styles.ratingText}>
//                   {rating}
//                 </Text>
//               </View>
//              )}
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   // Figma: ~82% screen width, ~36% screen height — peeks next card
//   card: {
//     width: wp(82),
//     height: hp(36),
//     marginHorizontal: wp(2),
//     borderRadius: wp(8.5),
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     borderWidth: 0.5,
//     overflow: 'hidden',
//     borderColor: '#ffffff11',
//     boxShadow:
//       '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.17) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',
//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',
//     boxSizing: 'border-box',
//   },
//   imageContainer: {
//     width: '100%',
//     height: '76%',
//     position: 'relative',
//     paddingHorizontal: '3.5%',
//     paddingTop: '3.5%',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: wp(5),
//     backgroundColor: '#ccc',
//   },
//   tag: {
//     position: 'absolute',
//     bottom: hp(1.2),
//     right: wp(5.5),
//     borderRadius: wp(3),
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(0.45),
//     zIndex: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor:
//       'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
//     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
//     minHeight: hp(3.2),
//     overflow: 'hidden',
//     alignSelf: 'flex-end',
//     flexShrink: 1,
//     maxWidth: '58%',
//   },
//   tagText: {
//     color: 'rgba(0, 0, 0, 0.80)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: '600',
//     fontSize: wp(2.8),
//     lineHeight: wp(3.6),
//     width: '100%',
//     textAlign: 'right',
//     flexShrink: 1,
//     includeFontPadding: false,
//   },
//   bookmark: {
//     position: 'absolute',
//     top: hp(2.4),
//     right: wp(5.5),
//     width: wp(11),
//     height: wp(11),
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 2,
//     borderRadius: wp(4),
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     borderWidth: 0.5,
//     borderColor: '#ffffff79',
//     overflow: 'hidden',
//     borderTopColor: 'rgba(255, 255, 255, 0.25)',
//     borderBottomColor: 'rgba(255, 255, 255, 0.25)',
//     borderLeftColor: 'rgba(255, 255, 255, 0.25)',
//     borderRightColor: 'rgba(255, 255, 255, 0.25)',
//   },
//   bookmarkIcon: {
//     width: wp(6),
//     height: wp(6),
//   },
//   infoRow: {
//     flexDirection: 'column',
//     justifyContent: 'center',
//     width: '90%',
//     alignSelf: 'center',
//     marginTop: hp(1),
//     flex: 1,
//     paddingBottom: hp(1),
//   },
//   title: {
//     fontSize: wp(4.35),
//     fontWeight: '600',
//     color: '#fff',
//     width: '100%',
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     marginTop: hp(0.6),
//   },
//   price: {
//     fontSize: wp(4.35),
//     fontWeight: '700',
//     color: '#fff',
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: wp(1.5),
//   },
//   starIcon: {
//     width: wp(4.1),
//     height: wp(4.1),
//   },
//   ratingText: {
//     fontSize: wp(4.1),
//     fontWeight: '600',
//     color: '#fff',
//   },
// });

// // import { BlurView } from '@react-native-community/blur';
// // import React from 'react';
// // import {
// //   View,
// //   Text,
// //   Image,
// //   StyleSheet,
// //   ImageSourcePropType,
// //   Platform,
// //   Dimensions,
// //   TouchableOpacity,
// // } from 'react-native';
// // import LinearGradient from 'react-native-linear-gradient';

// // type ProductCardProps = {
// //   tag: string;
// //   infoTitle: string;
// //   inforTitlePrice: string;
// //   rating: string;
// //   productImage: ImageSourcePropType;
// //   isBookmarked: boolean;
// //   onBookmarkPress?: () => void;
// //   onpress?: () => void;
// // };

// // const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// // export default function ProductCard({
// //   tag,
// //   infoTitle,
// //   inforTitlePrice,
// //   rating,
// //   productImage,
// //   onBookmarkPress,
// //   isBookmarked,
// //   onpress,
// // }: ProductCardProps) {
// //   return (
// //     <TouchableOpacity onPress={onpress}>
// //       <View style={styles.card}>
// //         <View style={styles.imageContainer}>
// //           <Image
// //             source={productImage}
// //             style={styles.image}
// //             resizeMode="cover"
// //           />

// //           <View style={styles.tag}>
// //             <BlurView
// //               blurType="light"
// //               blurAmount={100}
// //               style={StyleSheet.absoluteFillObject}
// //             />
// //             <Text allowFontScaling={false} style={styles.tagText}>
// //               {tag}
// //             </Text>
// //           </View>

// //           <View style={[styles.bookmark]}>
// //             <BlurView
// //               blurType="light"
// //               blurAmount={100}
// //               style={StyleSheet.absoluteFillObject}
// //             />
// //             <LinearGradient
// //               colors={['rgba(0, 1, 102, 0.20)', 'rgba(0, 1, 102, 0.024)']}
// //               style={StyleSheet.absoluteFillObject}
// //               useAngle={false}
// //             />

// //             <TouchableOpacity onPress={onBookmarkPress}>
// //               <Image
// //                 source={
// //                   isBookmarked
// //                     ? require('../../assets/images/favourite_filled.png')
// //                     : require('../../assets/images/favourite.png')
// //                 }
// //                 style={styles.bookmarkIcon}
// //               />
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         {/* Info */}
// //         <View style={styles.infoRow}>
// //           <Text numberOfLines={1} allowFontScaling={false} style={styles.title}>
// //             {infoTitle}
// //           </Text>
// //           <View style={styles.priceRow}>
// //             <Text allowFontScaling={false} style={styles.price}>
// //               {inforTitlePrice}
// //             </Text>
// //             {rating !== '0.0' && (
// //               <View style={styles.ratingRow}>
// //                 <Image
// //                   source={require('../../assets/images/staricon.png')}
// //                   style={styles.starIcon}
// //                 />
// //                 <Text allowFontScaling={false} style={styles.ratingText}>
// //                   {rating}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </View>
// //     </TouchableOpacity>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   card: {
// //     // width: screenWidth * 0.85,
// //     // height: Platform.OS == 'ios' ? screenHeight * 0.35 : screenHeight * 0.35,
// //     height: '103%',
// //     width: screenWidth * 0.85,
// //     // flexDirection: 'row',
    
// //     marginHorizontal: 8,
// //     borderRadius: 34,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //     borderWidth: 0.5,
// //     overflow: 'hidden',
// //     borderColor: '#ffffff11',
// //     boxShadow:
// //       '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
// //     backgroundColor:
// //       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.17) 0%, rgba(255, 255, 255, 0.10) 100%)',
// //     borderBlockStartColor: '#ffffff2e',
// //     borderBlockColor: '#ffffff2e',

// //     borderTopColor: '#ffffff2e',
// //     borderBottomColor: '#ffffff2e',
// //     borderLeftColor: '#ffffff2e',
// //     borderRightColor: '#ffffff2e',
// //     boxSizing: 'border-box',
// //   },
// //   imageContainer: {
// //     width: '100%',
// //     height: '78%',
// //     position: 'relative',
// //     paddingHorizontal: 14,
// //     paddingTop: 14,
// //   },
// //   image: {
// //     width: '100%',
// //     height: '100%',
// //     borderRadius: 20,
// //     backgroundColor: '#ccc',
// //   },

// //   tag: {
// //     position: 'absolute',
// //     bottom: 10,
// //     right: 22,
// //     borderRadius: 12,
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     zIndex: 2,
// //     padding: 8,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor:
// //       'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
// //     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
// //     minHeight: 29,
// //     overflow: 'hidden',
// //     alignSelf: 'flex-end',
// //     flexShrink: 1,
// //     alignContent: 'center',
// //     maxWidth: Platform.OS == 'ios' ? '58%' : '56%',
// //     flexWrap: 'wrap',
// //   },

// //   tagText: {
// //     color: 'rgba(0, 0, 0, 0.80)',
// //     fontFamily: 'Urbanist-SemiBold',
// //     fontWeight: 600,
// //     fontSize: 11,
// //     fontStyle: 'normal',
// //     lineHeight: 14,
// //     width: '100%',
// //     textAlign: 'right',
// //     flexShrink: 1,
// //     textAlignVertical: 'center',
// //     includeFontPadding: false,
// //   },
// //   bookmark: {
// //     position: 'absolute',
// //     top: Platform.OS === 'ios' ? 24 : 24,
// //     right: Platform.OS === 'ios' ? 24 : 24,
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 2,
// //     borderRadius: 16,
// //     backgroundColor:
// //       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
// //     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
// //     shadowColor: '#000',
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //     borderWidth: 0.5,
// //     borderColor: '#ffffff79',
// //     overflow: 'hidden',
// //     borderBlockStartColor: 'rgba(255, 255, 255, 0.25)',
// //     borderBlockColor: 'rgba(255, 255, 255, 0.25)',
// //     borderTopColor: 'rgba(255, 255, 255, 0.25)',
// //     borderBottomColor: 'rgba(255, 255, 255, 0.25)',
// //     borderLeftColor: 'rgba(255, 255, 255, 0.25)',
// //     borderRightColor: 'rgba(255, 255, 255, 0.25)',
// //   },
// //   bookmarkIcon: {
// //     width: 24,
// //     height: 24,
// //   },
// //   infoRow: {
// //     flexDirection: 'column',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     width: '90%',
// //     alignSelf: 'center',
// //     marginTop: 8,
// //   },
// //   title: {
// //     fontSize: 17,
// //     fontWeight: '600',
// //     color: '#fff',
// //     width: '100%',
// //     fontFamily: 'Urbanist-SemiBold',
// //     flexWrap: 'wrap',
// //   },
// //   priceRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //   },
// //   price: {
// //     fontSize: 17,
// //     fontWeight: '700',
// //     color: '#fff',
// //     fontFamily: 'Urbanist-SemiBold',
// //   },
// //   ratingRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //   },
// //   starIcon: {
// //     width: 16,
// //     height: 16,
// //   },
// //   ratingText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#fff',
// //   },
// // });
