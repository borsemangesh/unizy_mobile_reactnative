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
  category_id: number;
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
  category_id,
}) => {


const handleViewTransaction = () => {
   //navigation.navigate('TransactionDetail', { shareid });
   navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Search',isNavigate: false})
  };

  const handleWriteReview = () => {
      navigation.navigate('AddReview', {category_id:category_id,feature_id:shareid});
  };

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

       <View style={styles.dashedLine1} />

      {/* Buttons Section */}
       {ispurchase ? (
        // Fulfilled card => Two buttons
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.7}
            onPress={handleViewTransaction}>
            <Text allowFontScaling={false} style={styles.btnText}>
              View in Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={handleWriteReview}>
            <Text allowFontScaling={false} style={styles.btnTextSecondary}>
              Write a Review
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Awaiting card => One button
        <TouchableOpacity
          style={styles.singleButton}
          activeOpacity={0.7}
          onPress={handleViewTransaction}>
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
    //marginVertical: 4,
    marginHorizontal: 8,
    //borderWidth: 1,
    //borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
   // alignItems: 'flex-start',
   alignItems: 'stretch',
   paddingBottom:6
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between', 
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
    color:'#ABC7FF',
    fontFamily: 'Urbanist-Medium',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderColor: '#6592D4',
    borderStyle: 'dashed',
    //paddingVertical: 10,
    //marginVertical:6,
    width: '100%',
    opacity: 0, 
    
  },

  dashedLine1: {
    borderBottomWidth: 1,
    borderColor: '#5b70abff',
    borderStyle: 'dashed',
    //paddingVertical: 10,
    marginVertical:6,
    width: '100%',
    
  },
  // Buttons section
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
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
    color:'#ABC7FF',
    fontWeight:500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
    letterSpacing:0.5
  },
  btnTextSecondary: {
    color: '#002050',
    fontWeight:500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
    letterSpacing:0.5
  },
});