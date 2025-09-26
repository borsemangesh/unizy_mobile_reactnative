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
  
};

const MyListingCard: React.FC<MyListingCardProps> = ({
  tag,
  infoTitle,
  inforTitlePrice,
  rating = '',
  productImage,
  topRightText,
  isfeature
}) => {

 return (
  <TouchableOpacity style={styles.wrapper}>
    <Image source={productImage} style={styles.image} resizeMode="cover" />

    <View style={styles.content}>
    <View style={styles.titleRow}>
      <Text style={styles.title} numberOfLines={2}>
        {infoTitle}
      </Text>
      {topRightText ? (
        <View style={styles.topRightBadge}>
          <Text style={styles.topRightText}>{topRightText}</Text>
        </View>
      ) : null}
    </View>

      <View style={styles.priceRow}>
      <Text style={styles.price} numberOfLines={1}>
        {inforTitlePrice}
      </Text>

      {isfeature && (
        <View style={styles.featureBadge}>
          <Text style={styles.featureText}>Featured</Text>
        </View>
      )}
    </View>

      <View style={styles.metaRow}>
        <Text style={styles.tag} numberOfLines={1}>
          {tag}
        </Text>


      {rating ? (
        <>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </>
      ) : null}
      </View>
      </View>
  </TouchableOpacity>
);
};

export default MyListingCard;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 12,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    marginRight: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight:600,
  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight:600,
  },
  priceRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 6,
  gap: 8, 
},
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: '#fff',
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
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
  },


topRightBadge: {
  backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow:'0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',  paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
},

titleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between', // title left, text right
  alignItems: 'center',
},

topRightText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
  fontFamily: 'Urbanist-SemiBold',
},
featureBadge: {
   backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow:'0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',  paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
},

featureText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
  fontFamily: 'Urbanist-SemiBold',
},
dot: {
  color: '#fff', // or lighter shade if you want
  fontSize: 12,
  marginHorizontal: 2,
},
});
