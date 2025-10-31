import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

type MyReviewCardProps = {
  tag?: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string; // e.g., "3"
  reviewText?: string;
  productImage: ImageSourcePropType;
  topRightText?: string;
  isfeature?: boolean;
  navigation?: any;
  shareid: number;
  date:string
};

const MyReviewCard: React.FC<MyReviewCardProps> = ({
  infoTitle,
  inforTitlePrice,
  rating = '0',
  reviewText = '',
  productImage,
  navigation,
  shareid,
  date
}) => {
  const fullStar = require('../../assets/images/starfill.png'); 
  const emptyStar = require('../../assets/images/starempty.png'); 

  return (
    <TouchableOpacity
      style={styles.card}
     // onPress={() => navigation.navigate('ListingDetails', { shareid })}
      activeOpacity={0.8}
    >
     <View style={styles.row}>
      <Image source={productImage} style={styles.image} resizeMode="cover" />
      <View style={styles.details}>
        <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
        <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
        <Text allowFontScaling={false} style={styles.date}>{date}
        </Text>
      </View>
    </View>

  <View style={styles.dashedLine} />

  <View style={styles.bottomContent}>
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Image
          key={i}
          source={i < Number(rating) ? fullStar : emptyStar}
          style={styles.star}
        />
      ))}
    </View>

    {reviewText ? (
      <Text allowFontScaling={false} style={styles.reviewText} numberOfLines={3}>
        {reviewText}
      </Text>
    ) : null}
  </View>
    </TouchableOpacity>
  );
};

export default MyReviewCard;

const styles = StyleSheet.create({

  dashedLine: {
  borderBottomWidth: 1,
  borderColor: '#e6e3e3ff',
  borderStyle: 'dashed',
  marginTop:12,
  marginBottom:12,
  
  
  },
bottomContent: {
 // marginTop:2,
},
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  date: {
    fontSize: 12,
    color: '#FFFFFFE0',
    marginTop: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight:500,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  star: {
    width: 16, // adjust to match your design
    height: 16,
    marginRight: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#FFFFFFE0',
    marginTop: 8,
    fontFamily: 'Urbanist-Regular',
    fontWeight:400,
    lineHeight: 18,
  },
});
