import { BlurView } from '@react-native-community/blur';
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Platform,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type NewProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  bookmark:boolean,
  isfeature:boolean,
  applybookmark?: () => void; 
};

export default function SearchListProductCard({
  tag,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  bookmark,
  isfeature,
  applybookmark
}: NewProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={productImage} style={styles.image} />


        {/* <View style={styles.tag}>
          <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
        </View> */}

 

<View style={styles.tag}>

   <BlurView 
      blurType="light"
      blurAmount={100}
    style={[StyleSheet.absoluteFillObject,{borderRadius: 9}]}
      />
      {/* <LinearGradient
            colors={[
              'rgba(255,255,255,0.18)', 
              'rgba(255,255,255,0)' 
            ]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.17, y: 0.06 }}
            end={{ x: 1, y: 1 }}
          /> */}
          {/* <LinearGradient
            colors={[
              'rgba(0, 1, 102, 0.20)',   
              'rgba(0, 1, 102, 0.024)'  
            ]}
            style={StyleSheet.absoluteFillObject}
            useAngle={false} // radial
          /> */}
  
       
        <Text allowFontScaling={false} style={styles.tagText}>
          {tag}
        </Text>
      </View>

       {isfeature && (

      
        <View style={styles.tagTopLeft}>
           <BlurView 
            blurType="light"
            blurAmount={100}
          style={[StyleSheet.absoluteFillObject,{borderRadius: 9}]}
            />
          <Text allowFontScaling={false} style={styles.tagText}>Featured</Text>
        </View>
      )}
      
       {/* <View style={[styles.bookmark1,{opacity: 0.9}]}>
             <BlurView 
                  blurType="light"
                  blurAmount={100}
                  style={StyleSheet.absoluteFillObject}
                />
          <TouchableOpacity onPress={applybookmark}>
          <Image
              source={
                bookmark
                  ? require("../../assets/images/favourite_filled.png") // bookmarked
                  : require("../../assets/images/favourite.png") // not bookmarked
              }
               style={{ width: 16, height: 16 }}
            />
            </TouchableOpacity>
        </View> */}

         <View style={[styles.bookmark]}>
                        <BlurView 
                          blurType="light"
                          blurAmount={100}
                          style={[StyleSheet.absoluteFillObject,{borderRadius: 9}]}
                        />
                        <LinearGradient
                                                colors={[
                                                  'rgba(0, 1, 102, 0.20)',   // center strong blue tint
                                                  'rgba(0, 1, 102, 0.024)'  // outer faint blue tint
                                                ]}
                                                style={StyleSheet.absoluteFillObject}
                                                useAngle={false} // radial
                                              />
                  <TouchableOpacity onPress={applybookmark}>
                   <Image
                      source={
                        bookmark
                          ? require("../../assets/images/favourite_filled.png") // bookmarked
                          : require("../../assets/images/favourite.png") // not bookmarked
                      }
                      style={styles.bookmarkIcon}
                    />
                  </TouchableOpacity>
                </View>
      </View>

      <View style={styles.infoRow}>
        <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>

        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
            paddingTop:6

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
    borderRadius: 16,
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '95%',
    overflow: 'hidden',
    height: 'auto',
    //marginHorizontal: 6,
    paddingBottom: 10,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderEndEndRadius: 15,
    borderStartEndRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomStartRadius: 15,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    minHeight:226
  },
  imageContainer: {
    // width: 186,
    width: '100%',
    height:200,
    position: 'relative',
    padding: (Platform.OS === 'ios' ? 0 : 6),
    //paddingTop: (Platform.OS === 'ios' ? 0 : 6),
  },
  image: {
    width: '100%',
    height: '100%',
    padding: (Platform.OS === 'ios'? 5: 12),
    //paddingTop:(Platform.OS === 'ios'? 5: 12),
    borderRadius: 12,
    alignSelf: 'center',
    resizeMode: 'cover',
  },

  image1: {
    width: 10,
    height: 10,
    resizeMode:'contain'
  },
  bookmark: {
    overflow:'hidden',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 12,
    right: Platform.OS === 'ios' ? 10 : 12,
     borderRadius: 12,
     backgroundColor:
       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(101, 101, 101, 0.13) 0%, rgba(117, 117, 117, 0.1) 100%)',
    width: 36,
    height: 36,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    boxShadow: '0 2px 5px 0 rgba(109, 109, 109, 0.2)',
    borderWidth: 0.5,
    borderColor: '#ffffff2e',
    
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
  },
  bookmarkIcon: {
    width: 20,
    height: 20,
  },
  // bookmark: {
  //   position: 'absolute',
  //   top: 10,
  //   right: 10,
  //   borderRadius: 20,
  //   padding: 6,
  // },
  tag: {
    position: 'absolute',
    //bottom: 5,
    //right: 5,

    bottom: Platform.OS === 'ios' ? 8 : 10,
    right: Platform.OS === 'ios' ? 8 : 10,
    //backgroundColor: 'transparent',
    //backgroundColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',

    borderRadius: 4,
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 4,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
    overflow:'hidden'
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
  },
  tagTopLeft: {
  position: 'absolute',
  // top: 5,
  // left: 5,
   top: Platform.OS === 'ios' ? 8 : 10,
    left: Platform.OS === 'ios' ? 8 : 10,
  //backgroundColor: 'rgba(255,255,255,0.4)',
  backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
  borderRadius: 4,
  //padding: 4,
   paddingHorizontal: 6,
  paddingVertical:2,
  marginVertical: 4,
  marginHorizontal: 4,
  boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  overflow:'hidden'
},
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    width: '90%',
  },
  title1: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Urbanist-Regular',
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    // marginLeft: 4,
  },
  ratingAbsolute: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
