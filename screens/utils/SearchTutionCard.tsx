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
  infoTitle: string; // will use to get initials
  inforTitlePrice: string;
  rating: string;
  productImage?: ImageSourcePropType; // optional now
  bookmark: boolean;
  showInitials:boolean;
  initialsName: string; 
  applybookmark?: () => void; 
};

export default function SearchTutionCard({
  tag,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  bookmark,
  showInitials,
  initialsName,
  applybookmark
}: NewProductCardProps) {
  

    const getInitials = (name?: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(word => word[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };
  

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {showInitials ? (
         
          <Image
            source={require('../../assets/images/featurebg.png')}
            style={[{width: '220%',height:'220%',resizeMode: 'cover'}]}
            // style={{resizeMode: 'contain'}}
            resizeMode="cover"
          />
        ) : null}

        {productImage ? (
          <Image source={productImage} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.initialsCircle]}>
            <Text style={styles.initialsText}>{getInitials(initialsName)}</Text>
          </View>
        )}

        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>

       
        <View style={styles.bookmark1}>
           <TouchableOpacity onPress={applybookmark}>
          <Image
            source={
              bookmark
                ? require('../../assets/images/favourite_filled.png')
                : require('../../assets/images/favourite.png')
            }
            style={{ width: 16, height: 16 }}
          />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.title}>{infoTitle}</Text>

        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles.price}>{inforTitlePrice}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image source={require('../../assets/images/staricon.png')} style={styles.image1} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

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
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '95%',
    overflow: 'hidden',
    height: 'auto',
    margin: 6,
    paddingBottom: 10,
    borderWidth: 0.4,
    //borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
    padding: (Platform.OS === 'ios' ? 0 : 6),

    boxSizing: 'border-box',
  },
  imageContainer: {
    // width: 186,
    backgroundColor: 'rgba(154, 154, 255, 0.12)',
    width: '100%',       
    height: 180,            
    overflow: 'hidden',       
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 0.4,
    //borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    borderEndEndRadius: 15,
    borderStartEndRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomStartRadius: 15,
      
  },
  image: {
    width: '100%',
    height: '100%',
    padding: 12,
    borderRadius: 12,
    //borderColor:'000',
    // borderWidth:2,
    alignSelf: 'center',
    resizeMode: 'stretch'
  },

  image1: {
    width: 10,
    height: 10,
  },
  bookmark1: {
    borderRadius: 20,

    position: 'absolute',
    top: Platform.OS === 'ios' ? 25 : 10,
    right: Platform.OS === 'ios' ? 25 : 10,
    // borderRadius: 10,
     backgroundColor:
       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(101, 101, 101, 0.72) 0%, rgba(117, 117, 117, 0.1) 100%)',
    width: 26,
    height: 26,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    boxShadow: '0 2px 5px 0 rgba(109, 109, 109, 0.2)',
    borderWidth: 0.5,
    //borderColor: '#ffffff2e',
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
  },
  bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    padding: 6,
  },
  tag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    //backgroundColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 4,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingTop:6
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
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'Urbanist-Bold',
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginLeft: 4,
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
