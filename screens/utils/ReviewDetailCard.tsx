import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';



type ReviewDetailCardProps = {
  tag?: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string; // e.g., "3"
  reviewText?: string;
  navigation?: any;
  shareid: number;
  date: string,
  reviewer_name: string,
  category_id: number
  reviewer_image?: string
  feature_image?: string,

};

const ReviewDetailCard: React.FC<ReviewDetailCardProps> = ({
  infoTitle,
  inforTitlePrice,
  rating = '0',
  reviewText = '',
  navigation,
  shareid,
  date,
  reviewer_name,
  category_id,
  reviewer_image,
  feature_image

}) => {
  const fullStar = require('../../assets/images/starfill.png');
  const emptyStar = require('../../assets/images/starempty.png');

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '';

    const parts = fullName.trim().split(' ').filter(Boolean);

    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderProfileSection = () => {
    if (category_id === 2 || category_id === 5) {
      if (reviewer_image) {
        return (
          <Image
            source={{ uri: reviewer_image }}
            style={styles.image}
            resizeMode="cover"
          />
        );
      } else {
        return (
          <View style={styles.initialsCircle}>
            <Text allowFontScaling={false} style={styles.initialsText}>
              {getInitials(reviewer_name)}
            </Text>

          </View>
        );
      }
    } else {
      return (
        <Image source={{ uri: feature_image }} style={styles.image} resizeMode="cover" />
      );
    }
  };


  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        {renderProfileSection()}
        <View style={styles.details}>
          <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
          <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
          <Text allowFontScaling={false} style={styles.date}>{date}
          </Text>
        </View>
      </View>
      <View style={styles.cardconstinerdivider} />

      <View style={styles.bottomContent}>
        <View style={styles.topRow}>
          <Text allowFontScaling={false} style={styles.reviewerName}>
            {reviewer_name}
          </Text>

          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Image
                key={i}
                source={i < Number(rating) ? fullStar : emptyStar}
                style={styles.star}
              />
            ))}
          </View>
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

export default ReviewDetailCard;

const styles = StyleSheet.create({
  cardconstinerdivider: {

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: (Platform.OS === 'ios' ? 2 : 1.5),
    borderStyle: 'dashed',
    borderBottomWidth: (Platform.OS === 'ios' ? 0.9 : 1),
    borderColor: (Platform.OS === 'ios' ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)' : '#4169B8'),

  },

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 14,
    //marginRight: 12,
    overflow: 'hidden'
  },
  initialsText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  dashedLine: {
    borderBottomWidth: 1,
    borderColor: '#6592D4',
    borderStyle: 'dashed',
    width: '100%',
    opacity: 0,

  },

  dashedLine1: {
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reviewerName: {
    fontSize: 14,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  bottomContent: {
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    marginHorizontal: 8,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden'
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
    fontWeight: 500,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6

  },
  star: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#FFFFFFE0',
    marginTop: 8,
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
    lineHeight: 18,
  },
});