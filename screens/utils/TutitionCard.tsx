import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Platform,
  Dimensions,
  Touchable,
  TouchableOpacity,
  ImageURISource,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type TutitionCardProps = {
  tag: string;
  title: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  isBookmarked: boolean;
  onBookmarkPress?: () => void;
  onpress?: () => void;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TutitionCard({
  tag,
  title,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  onBookmarkPress,
  isBookmarked,
  onpress,
}: TutitionCardProps) {
  return (
    <TouchableOpacity onPress={onpress}>
      <View style={styles.card}>

        
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.splitRow}>
           

            <View style={styles.leftPortion}>
          {productImage && (productImage as ImageURISource).uri ? (
            // ✅ Show user’s actual image
            <Image
              source={productImage}
              style={styles.leftImage}
              resizeMode="cover"
            />
          ) : (
            // ✅ When showing initials, apply same background as right portion
            <View style={styles.initialsContainer}>
              <Image
              source={require('../../assets/images/featurebg.png')}
              style={styles.initialsBackground}
              resizeMode="cover"
            />
            <View
              style={{
                ...StyleSheet.absoluteFillObject, // covers the image fully
                backgroundColor: 'rgba(255, 255, 255, 0.07)', // black overlay, 35% opacity
              }}
            />
      <View style={styles.initialsCircle}>
        <Text allowFontScaling={false} style={styles.initialsText}>
          {infoTitle
            ? infoTitle
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : '?'}
        </Text>
      </View>
    </View>
  )}
</View>

            <View style={styles.rightPortion}>
              <Image
                source={require('../../assets/images/featurebg.png')}
                style={[{ width: '220%', height: '220%', resizeMode: 'cover' }]}
                resizeMode="cover"
              />

              {/* <View
              style={{
                ...StyleSheet.absoluteFillObject, // covers the image fully
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // black overlay, 35% opacity
              }}
            /> */}

            
              <Text allowFontScaling={false} style={styles.rightText}>{infoTitle}</Text>

             

               <View style={[styles.bookmark]}>
                         <BlurView 
                                blurType="light"
                                blurAmount={100}
                                style={StyleSheet.absoluteFillObject}
                              />
                      <LinearGradient
                        colors={[
                          'rgba(0, 1, 102, 0.20)',   // center strong blue tint
                          'rgba(0, 1, 102, 0.024)'  // outer faint blue tint
                        ]}
                        style={StyleSheet.absoluteFillObject}
                        useAngle={false} // radial
                      />
              
                      <TouchableOpacity onPress={onBookmarkPress}>
                        <Image
                          source={
                            isBookmarked
                              ? require("../../assets/images/favourite_filled.png")
                              : require("../../assets/images/favourite.png")
                          }
                          style={styles.bookmarkIcon}
                        />
                      </TouchableOpacity>
                    </View>
            </View>
          </View>

           <View style={styles.tag}>
                 <BlurView 
                   blurType="light"
                  blurAmount={100}
                  style={StyleSheet.absoluteFillObject}
                />
                
                <Text allowFontScaling={false} numberOfLines={0} style={styles.tagText}>{tag}</Text>
              </View>
        </View>

        {/* Info */}
        <View style={[styles.infoRow]}>
          <Text allowFontScaling={false} style={styles.title}>{title}</Text>
          <View style={styles.priceRow}>
            <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
            <View style={styles.ratingRow}>
              <Image
                source={require('../../assets/images/staricon.png')}
                style={styles.starIcon}
              />
              <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  initialsBackground: {
    position: 'absolute',
    width: '220%',
    height: '220%',
    resizeMode: 'cover',
    top: '-60%',
    left: '-60%',
  },

  initialsContainer: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius:20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.85,
    height: (Platform.OS == 'ios'? screenHeight * 0.35: screenHeight * 0.35),
    marginHorizontal: 8,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 0.5,
    borderColor: '#ffffff79',
    overflow: 'hidden',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e', 
    
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#ccc',
  },

  infoRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingTop: 8,
  
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    width: '100%',
    fontFamily: 'Urbanist-SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // marginTop: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    // marginLeft: 4,
    fontFamily: 'Urbanist-SemiBold',
  },

  splitRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    borderRadius: 22,
    //padding: 10
  },

  leftPortion: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 20,
    //overflow: "hidden",
  },

  leftImage: {
    width: '100%',
    height: '100%',
    //backgroundColor:'#fff',
    //borderRadius: 20,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },

  initialsCircle: {
    width: 75,
    height: 75,
    borderRadius: 100,
    backgroundColor: '#8390D4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  initialsText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom:4
  },

  rightPortion: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //padding: 10,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },

  // rightText: {
  //   fontSize: 18,
  //   fontWeight: '600',
  //   color: '#fff',
  //   textAlign: 'center',
  //   fontFamily: 'Urbanist-SemiBold',
  //   position: 'absolute',
  //   left:12
   
  // },
  rightText: {
  position: 'absolute',
  left: 12,
  right: 12,         // give space on the right so it can expand
  fontSize: 18,
  fontWeight: '600',
  color: '#fff',
  textAlign: 'left',
  fontFamily: 'Urbanist-SemiBold',
  flexWrap: 'wrap',
},

  // tag: {
  //   position: 'absolute',
  //   bottom: 10,
  //   right: 10,  
  //   borderRadius: 12,
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   zIndex: 2,
  //   padding: 8,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.10) 100%)',
  //   boxShadow:'0 2px 8px 0 rgba(0, 0, 0, 0.17)',
  //   height: 29,
  // },


   tag: {
    position: 'absolute',
    bottom: 10,
    right: 24,    
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
    //backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:'0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    overflow:'hidden',
    //elevation:6

    minHeight:29,
    alignSelf: 'flex-end', // 👈 ensures the View wraps the text
    flexShrink: 1,    
    alignContent:'center',
    maxWidth: '56%',   // restrict width relative to parent
    //flexWrap: 'wrap', 

  },


  tagText: {
    color:'rgba(0, 0, 0, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    fontSize: 11,
    lineHeight:14,
    width:'100%',
    flexShrink: 1,
    textAlign: 'right',
    textAlignVertical: 'center', 
    includeFontPadding: false,    
  },

  bookmark: {
    position: 'absolute',
    top: (Platform.OS === 'ios'? 10: 10),
    right: (Platform.OS === 'ios'? 10: 10),
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: 16,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',

    // elevation: 1,

    // shadowColor: "#000",
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

  bookmarkIcon: {
    width: 24,
    height: 24,
  },

  imageContainer: {
    width: '100%',
    height: '78%',
    position: 'relative',
    paddingHorizontal: 14,
    paddingTop:14
  },
});
