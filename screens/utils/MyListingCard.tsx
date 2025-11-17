// // MyListingCard.tsx
// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ImageSourcePropType,
//   TouchableOpacity,
// } from 'react-native';

// type MyListingCardProps = {
//   tag: string;
//   infoTitle: string;
//   inforTitlePrice: string;
//   rating: string;
//   productImage: ImageSourcePropType;
//   topRightText:string
//   isfeature:Boolean
//   navigation:any;
//   shareid:number;
//   catagory_id: number;
//   catagory_name: string;
//   isactive?: boolean;
// };

// const MyListingCard: React.FC<MyListingCardProps> = ({
//   tag,
//   infoTitle,
//   inforTitlePrice,
//   rating = '',
//   productImage,
//   topRightText,
//   isfeature,
//   navigation,
//   shareid,
//   catagory_id,
//   catagory_name,
//   isactive = true
// }) => {
// //  console.log('Share ID in card:', shareid, catagory_id);
//  return (
//   <TouchableOpacity style={styles.wrapper} onPress={() => {
//     navigation.navigate('ListingDetails',{ shareid ,catagory_id,catagory_name});
//   }}>
//     <Image source={productImage} style={styles.image} resizeMode="cover" />

//     <View style={styles.content}>
//     <View style={styles.titleRow}>
//       <Text allowFontScaling={false} style={styles.title} numberOfLines={2}>
//         {infoTitle}
//       </Text>
//       {topRightText ? (
//         <View style={[
//           styles.topRightBadge,
//           { backgroundColor: isactive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)' },
//         ]}>
//           <Text allowFontScaling={false} style={styles.topRightText}>{topRightText}</Text>
//         </View>
//       ) : null}
//     </View>

//       <View style={styles.priceRow}>
//       <Text allowFontScaling={false} style={styles.price} numberOfLines={1}>
//         {inforTitlePrice}
//       </Text>

//       {isfeature && (
//         <View style={styles.featureBadge}>
//           <Text allowFontScaling={false} style={styles.featureText}>Featured</Text>
//         </View>
//       )}
//     </View>

//       <View style={styles.metaRow}>
//         <Text allowFontScaling={false} style={styles.tag} numberOfLines={1}>
//           {tag}
//         </Text>


//       {rating ? (
//         <>
//           <Text allowFontScaling={false} style={styles.dot}> • </Text>
//           <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
//         </>
//       ) : null}
//       </View>
//       </View>
//   </TouchableOpacity>
// );
// };

// export default MyListingCard;

// const styles = StyleSheet.create({
//   wrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent:'center',
//     borderRadius: 18,
//     padding: 12,
//     marginVertical: 6,
//     backgroundColor: 'rgba(255, 255, 255, 0.06)',
//     borderWidth: 0.3,
//     borderColor: 'rgba(255, 255, 255, 0.08)',
//     //borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
//     color: 'rgba(255, 255, 255, 0.48)',
//     marginRight: 8,
//   },
//   image: {
//     width: 80,
//     height: 80,
//     borderRadius: 16,
//   },
//   content: {
//     flex: 1,
//     paddingLeft: 12,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 14,
//     color: '#fff',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight:600,
//   },
//   price: {
//     fontSize: 14,
//     color: '#fff',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight:600,
//   },
//   priceRow: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginTop: 6,
//   gap: 8, 
// },
//   metaRow: {
//     marginTop: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     gap: 8,
//   },
//   tag: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: 'Urbanist-Medium',
//   },
//   ratingWrap: {
//     marginLeft: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   ratingText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '500',
//     fontFamily: 'Urbanist-Medium',
//   },


// topRightBadge: {
//   backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
//   boxShadow:'0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',  paddingHorizontal: 6,
//     paddingVertical: 4,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
// },

// titleRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between', // title left, text right
//   alignItems: 'center',
// },

// topRightText: {
//   color: '#fff',
//   fontSize: 11,
//   fontWeight: '500',
//   fontFamily: 'Urbanist-Medium',
// },
// featureBadge: {
//    backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
//   boxShadow:'0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',  paddingHorizontal: 6,
//     paddingVertical: 4,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
// },

// featureText: {
//   color: '#fff',
//   fontSize: 11,
//   fontWeight: '500',
//   fontFamily: 'Urbanist-Medium',
// },
// dot: {
//   color: '#fff', // or lighter shade if you want
//   fontSize: 12,
//   marginHorizontal: 2,
// },
// });

// MyListingCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

type MyListingCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  topRightText:string
  isfeature:Boolean
  navigation:any;
  shareid:number;
  catagory_id: number;
  catagory_name: string;
  isactive?: boolean;
  categoryName?: string;
  profilePhoto?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

const MyListingCard: React.FC<MyListingCardProps> = ({
  tag,
  infoTitle,
  inforTitlePrice,
  rating = '',
  productImage,
  topRightText,
  isfeature,
  navigation,
  shareid,
  catagory_id,
  catagory_name,
  isactive = true,
  categoryName = '',
  profilePhoto = null,
  firstName = null,
  lastName = null,
}) => {
  // Check if category is housekeeping or tuition
  const isProfileCategory = categoryName?.toLowerCase() === 'house keeping' || categoryName?.toLowerCase() === 'tuition';
  
  // Get initials helper function
  const getInitials = (first: string | null = '', last: string | null = '') => {
    const f = first?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = last?.trim()?.charAt(0)?.toUpperCase() || '';
    return (f + l) || '?';
  };

  // Determine what image to show
  const shouldShowProfile = isProfileCategory && profilePhoto;
  const shouldShowInitials = isProfileCategory && !profilePhoto;

//  console.log('Share ID in card:', shareid, catagory_id);
 return (
  <TouchableOpacity style={styles.wrapper} onPress={() => {
    console.log(navigation.getState());
    navigation.navigate('ListingDetails',{ shareid ,catagory_id,catagory_name,key: String(Math.random()) });
  }}>
    <View style={styles.container}>
      {/* Image View */}
      <View style={styles.imageContainer}>
        {shouldShowInitials ? (
          <View style={styles.initialsCircle}>
            <Text allowFontScaling={false} style={styles.initialsText}>
              {getInitials(firstName, lastName)}
            </Text>
          </View>
        ) : shouldShowProfile ? (
          <Image source={{ uri: profilePhoto! }} style={styles.image} resizeMode="cover" />
        ) : (
          <Image source={productImage} style={styles.image} resizeMode="cover" />
        )}
      </View>

      {/* Content View - Title, Price, University, Date */}
      <View style={styles.contentContainer}>
        <Text allowFontScaling={false} style={styles.title} numberOfLines={2}>
          {infoTitle}
        </Text>

        <View style={styles.priceRow}>
          <Text allowFontScaling={false} style={styles.price} numberOfLines={1}>
            {inforTitlePrice}
          </Text>
          {isfeature && (
            <View style={styles.featureBadge}>
              <Text allowFontScaling={false} style={styles.featureText}>Featured</Text>
            </View>
          )}
        </View>

        {/* <View style={styles.metaRow}>
          <Text allowFontScaling={false} style={styles.tag} numberOfLines={1}>
            {tag}
          </Text>
          {rating ? (
            <>
              <Text allowFontScaling={false} style={styles.dot}> • </Text>
              <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
            </>
          ) : null}
        </View> */}
        <View style={styles.metaRow}>
          <Text allowFontScaling={false} style={styles.tag} numberOfLines={0}>
            {tag}
          </Text>
          {rating ? (
            <>
              <Text allowFontScaling={false} style={styles.dot}>•</Text>
              <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Status View */}
      {topRightText ? (
        <View style={styles.statusContainer}>
          <View style={[
            styles.topRightBadge,
            { backgroundColor: isactive ? 'rgba(97, 179, 255, 0.2)' : 'rgba(134, 140, 213, 0.2)' },
          ]}>
            <Text
              allowFontScaling={false}
              style={[
                styles.topRightText,
                {
                  color: isactive ? '#b4e6ff' : '#868CD5',
                },
              ]}
            >
              {topRightText}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  </TouchableOpacity>
);
};

export default MyListingCard;

const styles = StyleSheet.create({

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
    
  },
tag: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
    
  },
dot: {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 12,
  marginHorizontal:1,
  marginLeft: 1
},
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
    marginRight:5
  },
  wrapper: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    width: '100%',
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 72,
    height: 72,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,

  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    minHeight: 22,
  },
  // metaRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'flex-start',
  //   marginTop: 8,
  // },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  // tag: {
  //   fontSize: 12,
  //   color: 'rgba(255, 255, 255, 0.7)',
  //   fontWeight: '500',
  //   fontFamily: 'Urbanist-Medium',
  // },
  // ratingWrap: {
  //   marginLeft: 8,
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  // },
  // ratingText: {
  //   fontSize: 12,
  //   color: 'rgba(255, 255, 255, 0.7)',
  //   fontWeight: '500',
  //   fontFamily: 'Urbanist-Medium',
  // },


topRightBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-start',
  marginTop: 0,
},


topRightText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '500',
  fontFamily: 'Urbanist-Medium',
},
featureBadge: {
   backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow:'0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',  paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  
},

featureText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '500',
  fontFamily: 'Urbanist-Medium',
},
// dot: {
//   color: 'rgba(255, 255, 255, 0.7)',
//   fontSize: 12,
//   marginHorizontal: 4,
// },
initialsCircle: {
  backgroundColor: '#8390D4',
  alignItems: 'center',
  justifyContent: 'center',
  width: 72,
  height: 72,
  borderRadius: 12,
},
initialsText: {
  color: '#fff',
  fontSize: 28,
  fontWeight: 600,
  textAlign: 'center',
  fontFamily: 'Urbanist-SemiBold',
},
});