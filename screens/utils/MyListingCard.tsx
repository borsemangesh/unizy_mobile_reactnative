import React from 'react';
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import COMMONSTYLE from './CommonStyle';

type MyListingCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  topRightText: string
  isfeature: Boolean
  navigation: any;
  shareid: number;
  catagory_id: number;
  catagory_name: string;
  isactive?: boolean;
  categoryName?: string;
  profilePhoto?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  reviews?: string| null;
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
  reviews = null,
}) => {
  const isProfileCategory = catagory_id === 2 || catagory_id === 5;
  const { t } = useTranslation();
  const getInitials = (first: string | null = '', last: string | null = '') => {
    const f = first?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = last?.trim()?.charAt(0)?.toUpperCase() || '';
    return (f + l) || '?';
  };

  const shouldShowProfile = isProfileCategory && profilePhoto;
  const shouldShowInitials = isProfileCategory && !profilePhoto;

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => {
        navigation.navigate('ListingDetails', {
          shareid,
          catagory_id,
          catagory_name,
          reviews,
          key: String(Math.random()),
        });
      }}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {shouldShowInitials ? (
            <View style={styles.initialsCircle}>
              <Text allowFontScaling={false} style={styles.initialsText}>
                {getInitials(firstName, lastName)}
              </Text>
            </View>
          ) : shouldShowProfile ? (
            <Image
              source={{ uri: profilePhoto! }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={productImage}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.contentContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text
              allowFontScaling={false}
              style={[COMMONSTYLE.FONTFAMILY_SEMIBOLD, styles.title]}
              numberOfLines={2}
            >
              {infoTitle}
            </Text>
            {topRightText ? (
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.topRightBadge,
                    {
                      backgroundColor: isactive
                        ? 'rgba(97, 179, 255, 0.2)'
                        : 'rgba(134, 140, 213, 0.2)',
                    },
                  ]}
                >
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

          <View style={styles.priceRow}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                allowFontScaling={false}
                style={[COMMONSTYLE.FONTFAMILY_SEMIBOLD,styles.price]}
                numberOfLines={1}
              >
                {inforTitlePrice}
              </Text>
              {isfeature && (
                <View style={styles.featureBadge}>
                  <Text allowFontScaling={false} style={styles.featureText}>
                    {t('featured')}
                  </Text>
                </View>
              )}
            </View>
            {rating ? (
              <>
                <Text allowFontScaling={false} style={styles.ratingText}>
                  {rating}
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Text allowFontScaling={false} style={styles.tag} numberOfLines={2}>
              {tag}
            </Text>
            <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.topRightBadge,
                    {
                      backgroundColor: isactive
                        ? 'rgba(97, 179, 255, 0.2)'
                        : 'rgba(134, 140, 213, 0.2)',
                    },
                  ]}
                >
                  <Image
                      source={require('../../assets/images/staricon.png')}
                      style={{
                        width: 10,
                        height: 10,
                        marginRight: 4,
                        tintColor: 'rgba(140, 225, 255, 0.9)',
                      }}
                    />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.topRightText,
                      {
                        color: '#b4e6ff' ,
                      },
                    ]}
                  >
                    {reviews === '0.0'?'-.-': reviews }
                  </Text>
                </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyListingCard;

const styles = StyleSheet.create({

  contentContainer: {
    flex: 1,
    marginLeft: 10,
    width: '100%',
    gap: 8
  },


  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 22,
    justifyContent: 'space-between'

  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

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
    alignItems: 'center',
  },
  imageContainer: {
    width: 72,
    height: 72,
    resizeMode: 'center'
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    color: '#fff',

    fontWeight: 600,
    width: '71%',
    maxWidth: '80%',

  },
  price: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },

  statusContainer: {
    alignSelf: 'flex-start',
  },
  tag: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
    maxWidth: '80%',

  },
 
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
    marginRight: 5,
    textAlign: 'right'
  },

  topRightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 0,
    flexDirection: 'row'
  },

  topRightText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Urbanist-Medium',
  },
  featureBadge: {
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)', paddingHorizontal: 6,
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