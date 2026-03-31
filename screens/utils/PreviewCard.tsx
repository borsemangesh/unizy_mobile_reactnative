
import { BlurView } from "@react-native-community/blur";
import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";


type PreviewCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType
};


export default function PreviewCard({ tag, infoTitle, inforTitlePrice, rating, productImage }: PreviewCardProps) {
  return (
    <View style={styles.card}>

      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
        />
        <View style={styles.tag}>
          <BlurView
            blurType="light"
            blurAmount={100}
            style={StyleSheet.absoluteFillObject}
          />
          <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
        </View>
        <View style={styles.bookmark1}>
          <BlurView
            blurType="light"
            blurAmount={100}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={[
              'rgba(0, 1, 102, 0.20)',
              'rgba(0, 1, 102, 0.024)'
            ]}
            style={StyleSheet.absoluteFillObject}
            useAngle={false}
          />

          <Image
            source={require('../../assets/images/favourite.png')}
            style={{ width: 26, height: 26 }}
          />
        </View>
      </View>
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
    width: 320,
    borderRadius: 20,
    backgroundColor: '#5973c1ff',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    height: 290,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
  },
  imageContainer: {
    width: '100%',
    height: 230,
    position: 'relative',
    padding: (Platform.OS === 'ios' ? 0 : 12),
  },
  image: {
    width: '100%',
    height: '100%',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'center'
  },

  image1: {
    width: 16,
    height: 16,

  },
  bookmark1: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 20 : 20),
    right: (Platform.OS === 'ios' ? 20 : 20),
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
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
  tag: {
    position: 'absolute',
    bottom: (Platform.OS === 'ios' ? 16 : 16),
    right: (Platform.OS === 'ios' ? 16 : 16),
    overflow: 'hidden',
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
    marginHorizontal: 8,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
    minHeight: 29,
    alignSelf: 'flex-end', 
    flexShrink: 1,
    alignContent: 'center',
    maxWidth: '56%',  
    flexWrap: 'wrap'
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    lineHeight: 14,
    width: '100%',
    textAlign: 'right',
    flexShrink: 1,
    textAlignVertical: 'center',
    includeFontPadding: false,

  },
  
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 2,
    width: '90%'
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
});