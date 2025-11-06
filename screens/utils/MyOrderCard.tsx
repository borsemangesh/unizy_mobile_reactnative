// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ImageSourcePropType,
//   TouchableOpacity,
// } from 'react-native';

// type MyOrderCardProps = {
//   tag?: string;
//   infoTitle: string;
//   inforTitlePrice: string;
//   reviewText?: string;
//   productImage: ImageSourcePropType;
//   navigation?: any;
//   shareid: number;
//   date:string,
//   ispurchase:boolean
// };

// const MyOrderCard: React.FC<MyOrderCardProps> = ({
//   infoTitle,
//   inforTitlePrice,
//   reviewText = '',
//   productImage,
//   navigation,
//   shareid,
//   date,
//   ispurchase
// }) => {
  

//   return (
//     <TouchableOpacity
//       style={styles.card}
//      // onPress={() => navigation.navigate('ListingDetails', { shareid })}
//       activeOpacity={0.8}
//     >
//      <View style={styles.row}>
//       <Image source={productImage} style={styles.image} resizeMode="cover" />
//       <View style={styles.details}>
//         <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
//         <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
//         <Text allowFontScaling={false} style={styles.date}>{date}
//         </Text>
//       </View>
//     </View>

//   <View style={styles.dashedLine} />

//   <View style={styles.bottomContent}>


  
//   </View>
 
//     </TouchableOpacity>
//   );
// };

// export default MyOrderCard;

// const styles = StyleSheet.create({

//   dashedLine: {
//   borderBottomWidth: 1,
//   borderColor: '#e6e3e3ff',
//   borderStyle: 'dashed',
//   marginTop:12,
//   marginBottom:12,
  
//   },

//   topRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
// },

// reviewerName: {
//   fontSize: 14,
//   color: '#FFFFFFE0',
//   fontWeight: '600',
//   fontFamily: 'Urbanist-SemiBold',
//   flex: 1,
//   marginRight: 8,
// },
// bottomContent: {
//  // marginTop:2,
// },
//   card: {
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderRadius: 16,
//     padding: 12,
//     marginVertical: 8,
//     borderWidth: 1,
//     marginHorizontal:8,
//     borderColor: 'rgba(255,255,255,0.1)',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   image: {
//     width: 70,
//     height: 70,
//     borderRadius: 14,
//   },
//   details: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   title: {
//     fontSize: 14,
//     color: '#FFFFFFE0',
//     fontWeight: '600',
//     fontFamily: 'Urbanist-SemiBold',
//     marginBottom: 4,
//   },
//   price: {
//     fontSize: 14,
//     color: '#FFFFFFE0',
//     fontWeight: '600',
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   date: {
//     fontSize: 12,
//     color: '#FFFFFFE0',
//     marginTop: 6,
//     fontFamily: 'Urbanist-Medium',
//     fontWeight:500,
//   },
//   starsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
   
//   },
//   star: {
//     width: 16, // adjust to match your design
//     height: 16,
//     marginRight: 4,
//   },
//   reviewText: {
//     fontSize: 14,
//     color: '#FFFFFFE0',
//     marginTop: 8,
//     fontFamily: 'Urbanist-Regular',
//     fontWeight:400,
//     lineHeight: 18,
//   },
// });

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

type MyOrderCardProps = {
  infoTitle: string;
  inforTitlePrice: string;
  productImage: ImageSourcePropType;
  navigation?: any;
  shareid: number;
  date: string;
  ispurchase: boolean; // true => fulfilled, false => awaiting delivery
};

const MyOrderCard: React.FC<MyOrderCardProps> = ({
  infoTitle,
  inforTitlePrice,
  productImage,
  navigation,
  shareid,
  date,
  ispurchase,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Top Row: Image + Title + Price + Status */}
      <View style={styles.row}>
        <Image source={productImage} style={styles.image} resizeMode="cover" />

        <View style={styles.details}>
          <Text allowFontScaling={false} style={styles.title}>
            {infoTitle}
          </Text>

          <Text allowFontScaling={false} style={styles.price}>
            {inforTitlePrice}
          </Text>

          {ispurchase ? (
            <View style={styles.statusTag}>
              <Text allowFontScaling={false} style={styles.statusText}>
                Fulfilled on: {date}
              </Text>
            </View>
          ) : (
            <View style={styles.statusTag}>
              <Text allowFontScaling={false} style={styles.statusText}>
                Awaiting Delivery
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Dotted Line */}
      <View style={styles.dashedLine} />

      {/* Buttons Section */}
      {ispurchase ? (
        // Fulfilled card => Two buttons
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text allowFontScaling={false} style={styles.btnText}>
              View in Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text allowFontScaling={false} style={styles.btnTextSecondary}>
              Write a Review
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Awaiting card => One button
        <TouchableOpacity style={styles.singleButton}>
          <Text allowFontScaling={false} style={styles.btnText}>
            View in Transactions
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default MyOrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 75,
    height: 80,
    borderRadius: 14,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  statusTag: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    color:'#9CD6FF',
    fontFamily: 'Urbanist-Medium',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderColor: '#e6e3e3ff',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  // Buttons section
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
 


  singleButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
     backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  primaryButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    alignItems: 'center',
    flex:1,
    height: 48,
    justifyContent: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  secondaryButton: {
    flex:1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  btnText: {
    color:'#9CD6FF',
    fontWeight:500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
  },
  btnTextSecondary: {
    color: '#002050',
    fontWeight:500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
  },
});

