import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

type NotificationCardProps = {
  tag?: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string; // e.g., "3"
  reviewText?: string;
  productImage: ImageSourcePropType;
  topRightText?: string;
  isfeature?: boolean;
  navigation: any;
  shareid: number;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  infoTitle,
  inforTitlePrice,
  rating = '0',
  reviewText = '',
  productImage,
  navigation,
  shareid,
}) => {
  const fullStar = require('../../assets/images/starfill.png'); // your full star
  const emptyStar = require('../../assets/images/starempty.png'); // your empty star

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetails', { shareid })}
      activeOpacity={0.8}
    >
     <View style={styles.row}>
        <View style={styles.imgcontainer}>
      <Image source={productImage} style={styles.image} resizeMode="cover" />
     </View>
        <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
    </View>


  <View style={styles.bottomContent}>
      <Text allowFontScaling={false} style={styles.reviewText} numberOfLines={3}>
        {reviewText}
      </Text>
  </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({

imgcontainer:{
    width: 40,
    height: 40,
    borderRadius: 12, 
    padding:8,
    alignItems:'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxSizing: 'border-box'
    },

bottomContent: {
 // marginTop:2,
},
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode:'contain'
    
  },
  
  title: {
    fontSize: 17,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 4,
    alignSelf:'center',
    marginLeft:6
  },
 
  
  reviewText: {
    fontSize: 14,
    color: '#FFFFFFE0',
    marginTop: 8,
    fontFamily: 'Urbanist-Medium',
    fontWeight:500,
    lineHeight: 20,
  },
});
