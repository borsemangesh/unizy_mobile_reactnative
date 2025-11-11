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

type SeperateTutionCardProps = {
  tag: string;
  infoTitle: string; // will use to get initials
  inforTitlePrice: string;
  rating: string;
  productImage?: ImageSourcePropType; // optional now
  bookmark: boolean;
  showInitials:boolean;
  initialsName: string; 
  isfeature:boolean,
  applybookmark?: () => void; 
};


export default function SeperateTutionCard({
  tag,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  bookmark,
  showInitials,
  initialsName,
  isfeature,
  applybookmark,
}: SeperateTutionCardProps) {
  // helper to generate initials
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0][0]?.toUpperCase()
      : `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  return (
    <View style={styles.card}>
      {/* 🔹 IMAGE / INITIALS SECTION */}
      <View style={styles.imageContainer}>
        {showInitials ? (
          <>
            {/* Background image */}
            <Image
              source={require('../../assets/images/featurebg.png')}
              style={styles.image}
              resizeMode="stretch"
            />

            {/* Initials Circle on top */}
            <View style={styles.initialsCircle}>
              <Text allowFontScaling={false} style={styles.initialsText}>
                {(initialsName)}
              </Text>
            </View>
          </>
        ) : (
          /* Profile image */
          <Image
            source={productImage}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Tag (university, etc.) */}
        <View style={styles.tag}>
          <BlurView
            blurType="light"
            blurAmount={100}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 9 }]}
          />
          <Text allowFontScaling={false} style={styles.tagText}>
            {tag}
          </Text>
        </View>

        {/* Featured Tag */}
        {isfeature && (
          <View style={styles.tagTopLeft}>
            <BlurView
              blurType="light"
              blurAmount={100}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 9 }]}
            />
            <Text allowFontScaling={false} style={styles.tagText}>
              Featured
            </Text>
          </View>
        )}

        {/* Bookmark */}
        <View style={styles.bookmark1}>
          <BlurView
            blurType="light"
            blurAmount={100}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
          />
          <LinearGradient
            colors={['rgba(0, 1, 102, 0.20)', 'rgba(0, 1, 102, 0.024)']}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity onPress={applybookmark}>
            <Image
              source={
                bookmark
                  ? require('../../assets/images/favourite_filled.png')
                  : require('../../assets/images/favourite.png')
              }
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 TITLE / PRICE / RATING SECTION */}
      <View style={styles.infoRow}>
        <Text allowFontScaling={false} style={styles.title}>
          {infoTitle}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Text allowFontScaling={false} style={styles.price}>
            {inforTitlePrice}
          </Text>

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
            <Text allowFontScaling={false} style={styles.ratingText}>
              {rating}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
//    tagTopLeft: {
//   position: 'absolute',
//   //top: 5,
//  // left: 5,
//   top: Platform.OS === 'ios' ? 8 : 8,
//     left: Platform.OS === 'ios' ? 8 : 8,
//   backgroundColor: 'rgba(255,255,255,0.4)',
//   borderRadius: 4,
//   padding: 4,
//   marginVertical: 4,
//   marginHorizontal: 4,
//   overflow:'hidden',
//   boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
// },

  tagTopLeft: {
  position: 'absolute',
  // top: 5,
  // left: 5,
   top: Platform.OS === 'ios' ? 8 : 10,
    left: Platform.OS === 'ios' ? 8 : 10,
  //backgroundColor: 'rgba(255,255,255,0.4)',
  backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
  borderRadius: 4,
  paddingHorizontal: 6,
  paddingVertical:2,
  marginVertical: 4,
  marginHorizontal: 4,
  boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  overflow:'hidden'
},


    initialsCircle: {
    width: 80,
    height: 80,
    borderRadius: 100,
  backgroundColor: "#8390D4",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute'
  },
  initialsText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
   fontFamily: 'Urbanist-SemiBold',
  },
    card: {
    borderRadius: 16,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    //marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width:188,
    overflow: 'hidden',
    height:'auto',
    margin:6,
    paddingBottom:10,
    //boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
  },
  imageContainer: {
    // width: 186,
   // backgroundColor: 'rgba(154, 154, 255, 0.12)',
    width: '100%',       
    height: 180,            
    overflow: 'hidden',       
    justifyContent: 'center', 
    alignItems: 'center',
    //borderWidth: 0.4,
    borderColor: '#ffffff11',
    //boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    padding: 6,

      
  },
  image: {
    width: '100%',
    height: '100%',
    
    padding: (Platform.OS === 'ios' ? 0 : 12),
    borderRadius: 12,
    //borderColor:'000',
    // borderWidth:2,
    alignSelf: 'center',
    resizeMode: 'stretch',
    
    
  },

  image1: {
    width: 10,
    height: 10,
    resizeMode:'contain'
  },
  bookmark1: {

    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 12,
    right: Platform.OS === 'ios' ? 10 : 12,
    overflow:'hidden',
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
    //borderColor: '#ffffff2e',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
  },
  // bookmark: {
  //   position: 'absolute',
  //   top: 10,
  //   right: 10,
  //   borderRadius: 20,
  //   padding: 6,
  // },
  // tag: {
  //   position: 'absolute',
  //  // bottom: 5,
  //   //right: 5,
  //   bottom: Platform.OS === 'ios' ? 8 : 8,
  //   right: Platform.OS === 'ios' ? 8 : 8,
  //   //backgroundColor: '#fff',
  //   backgroundColor: 'rgba(255,255,255,0.4)',
  //   borderRadius: 4,
  //   padding: 4,
  //   marginVertical: 4,
  //   marginHorizontal: 4,
  //   boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  // },
  tag:{
  position: 'absolute',
    bottom: Platform.OS === 'ios' ? 8 : 10,
    right: Platform.OS === 'ios' ? 8 : 10,
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical:2,
    marginVertical: 4,
    marginHorizontal: 4,
    //boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
    overflow:'hidden',
    alignSelf: 'flex-end', // 👈 ensures the View wraps the text
    flexShrink: 1,

    maxWidth: '80%',   // restrict width relative to parent
    flexWrap: 'wrap',  // allow wrapping
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flexShrink: 1,
    width:'100%'
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 6,
    //paddingTop:6
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