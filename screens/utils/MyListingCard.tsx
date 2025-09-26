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
  rating?: string;
  productImage: ImageSourcePropType;
  
};

const MyListingCard: React.FC<MyListingCardProps> = ({
  tag,
  infoTitle,
  inforTitlePrice,
  rating = '',
  productImage,
}) => {
  return (
    <TouchableOpacity style={styles.wrapper}>
      <Image source={productImage} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {infoTitle}
        </Text>

        <Text style={styles.price} numberOfLines={1}>
          {inforTitlePrice}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.tag} numberOfLines={1}>
            {tag}
          </Text>

          {rating ? (
            <View style={styles.ratingWrap}>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
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
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    marginRight: 8,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
    
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
    fontSize: 15,
    fontWeight: '600',
    color: '#fff', // title color
  },
  price: {
    marginTop: 6,
    fontSize: 13,
    color: '#fff',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8, // supported on RN 0.71+, otherwise use marginRight on children
  },
  tag: {
    fontSize: 12,
    color: '#fff',
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
    fontWeight: '600',
  },
});
