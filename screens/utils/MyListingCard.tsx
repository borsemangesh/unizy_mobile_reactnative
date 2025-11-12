// MyListingCard.tsx
import React from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

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
  <SquircleView
      style={styles.wrapper}
      squircleParams={{
        cornerSmoothing: 1,
        cornerRadius: 18,
        fillColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
  <TouchableOpacity  onPress={() => {
    navigation.navigate('ListingDetails',{ shareid ,catagory_id,catagory_name});
  }}>
    <View style={styles.container}>
      {/* Image View */}
      {/* <View style={styles.imageContainer}> */}
        <SquircleView
      style={styles.imageContainer}
      squircleParams={{
        cornerSmoothing: 1,
        cornerRadius: 18,
      }}
>

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
  </SquircleView>
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

        <View style={styles.metaRow}>
          <Text allowFontScaling={false} style={styles.tag} numberOfLines={1}>
            {tag}
          </Text>
          {rating ? (
            <>
              <Text allowFontScaling={false} style={styles.dot}> • </Text>
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
  </SquircleView>
);
};

export default MyListingCard;

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    // backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
     overflow:'hidden',
     borderRadius:12,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  tag: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
  },
  ratingWrap: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
  },


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
dot: {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 12,
  marginHorizontal: 4,
},
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
