// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ImageSourcePropType,
//   TouchableOpacity,
// } from 'react-native';

// type NotificationCardProps = {
//   tag?: string;
//   infoTitle: string;
//   reviewText?: { text: string; bold: boolean }[];
//   productImage: ImageSourcePropType;
//   isfeature?: boolean;
//   navigation: any;
//   typeid: number;
//   typename:string;
// };

// const NotificationCard: React.FC<NotificationCardProps> = ({
//   infoTitle,
//   reviewText = [],
//   productImage,
//   navigation,
//   typeid,
//   typename
// }) => {
//   const fullStar = require('../../assets/images/starfill.png'); // your full star
//   const emptyStar = require('../../assets/images/starempty.png'); // your empty star

//   return (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate(
//           'SearchDetails',
//           { id: typeid, name: typename },
//           { animation: 'none' },
//         )
//       }
//       activeOpacity={0.8}
//     >
//       <View style={styles.row}>
//         <View style={styles.imgcontainer}>
//           <Image
//             source={productImage}
//             style={styles.image}
//             resizeMode="cover"
//           />
//         </View>
//         <Text allowFontScaling={false} style={styles.title}>
//           {infoTitle}
//         </Text>
//       </View>

//       {/* <View style={styles.bottomContent}>
//       <Text allowFontScaling={false} style={styles.reviewText} numberOfLines={3}>
//         {reviewText}
//       </Text>
//   </View> */}

//       <View style={styles.bottomContent}>
//         <Text>
//           {reviewText.map((part, index) => (
//             <Text
//               key={index}
//               style={part.bold ? styles.reviewText_bold : styles.reviewText}
//             >
//               {part.text}
//             </Text>
//           ))}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default NotificationCard;

// const styles = StyleSheet.create({

// imgcontainer:{
//     width: 40,
//     height: 40,
//     borderRadius: 12, 
//     padding:8,
//     alignItems:'center',
   
//     borderWidth: 0.4,
//     borderColor: '#ffffff11',
//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     boxSizing: 'border-box'
//     },

// bottomContent: {
//  marginTop:10,
// //  marginVertical:10
// },
//   card: {
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderRadius: 24,
//     padding: 16,
//     marginVertical: 8,
    

//     // borderWidth: 1,
//     // borderColor: 'rgba(255,255,255,0.1)',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   image: {
//     width: 20,
//     height: 20,
//     resizeMode:'contain',
//     marginTop:2  
    
//   },
  
//   title: {
//     fontSize: 17,
//     color: '#FFFFFFE0',
//     fontWeight: '600',
//     fontFamily: 'Urbanist-SemiBold',
//     marginBottom: 4,
//     alignSelf:'center',
//     marginLeft:8,
    
//   },
 
  
//   reviewText: {
//     fontSize: 14,
//     color: '#FFFFFFCC',
//     marginTop: 8,
//     fontFamily: 'Urbanist-Medium',
//     fontWeight:500,
//     lineHeight: 20,
//   },

//     reviewText_bold: {
//     fontSize: 14,
//     color: '#FFFFFFE0',
//     marginTop: 8,
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight:600,
//     lineHeight: 20,
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

type NotificationCardProps = {
  tag?: string;
  infoTitle: string;
  reviewText?: { text: string; bold: boolean }[];
  productImage: ImageSourcePropType;
  isfeature?: boolean;
  navigation: any;
  typeid: number;
  typename: string;
  templateName?: string;
  categoryid:number
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  infoTitle,
  reviewText = [],
  productImage,
  navigation,
  typeid,
  typename,
  categoryid,
  templateName = '',
}) => {
  const fullStar = require('../../assets/images/starfill.png'); // your full star
  const emptyStar = require('../../assets/images/starempty.png'); // your empty star

  // Determine navigation route and params based on template name
  const handleNavigation = () => {
    if (templateName === 'ItemSold') {
      // Navigate to ListingDetails
      navigation.navigate('ListingDetails', {
        shareid: typeid,
        catagory_id: categoryid,
        catagory_name: typename,
      });
    } else if (templateName === 'FeatureListed') {
      // Navigate to SearchDetails
      navigation.navigate('ListingDetails', {
       shareid: typeid,
        catagory_id: categoryid,
        catagory_name: typename,
      });
    } 

    else if (templateName==='NewReviewedAdd'){
       navigation.replace('ReviewDetails', {
        catagory_id: categoryid,
        id: typeid,
       purchase:false
       });
    }

    else if (templateName==='YourOrderCompleted'){
       navigation.replace('MyOrders');
    }
    else if (templateName === 'OrderCompletedRecivedPaymentSoon') {
     navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Search',isNavigate: false})
    } 
     else if (templateName === 'PayoutSuccess') {
      navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Search',isNavigate: false,issales:true})
    } 
    else {
      // Default navigation (fallback to SearchDetails)
      navigation.navigate('SearchDetails', {
        id: typeid,
        name: typename,
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleNavigation}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={styles.imgcontainer}>
          <Image
            source={productImage}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <Text allowFontScaling={false} style={styles.title}>
          {infoTitle}
        </Text>
      </View>

      {/* <View style={styles.bottomContent}>
      <Text allowFontScaling={false} style={styles.reviewText} numberOfLines={3}>
        {reviewText}
      </Text>
  </View> */}

      <View style={styles.bottomContent}>
        <Text>
          {reviewText.map((part, index) => (
            <Text
              key={index}
              style={part.bold ? styles.reviewText_bold : styles.reviewText}
            >
              {part.text}
            </Text>
          ))}
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
 marginTop:10,
//  marginVertical:10
},
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
    marginVertical: 8,
    
    

    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 20,
    height: 20,
    resizeMode:'contain',
    marginTop:2  
    
  },
  
  title: {
    fontSize: 17,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 4,
    alignSelf:'center',
    marginLeft:8,
    
  },
 
  
  reviewText: {
    fontSize: 14,
    color: '#FFFFFFCC',
    marginTop: 8,
    fontFamily: 'Urbanist-Medium',
    fontWeight:500,
    lineHeight: 20,
  },

    reviewText_bold: {
    fontSize: 14,
    color: '#FFFFFFE0',
    marginTop: 8,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight:600,
    lineHeight: 20,
  },
});