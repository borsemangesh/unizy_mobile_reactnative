import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
  Platform,
} from 'react-native';

type CreatedBy = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  postal_code: string;
  password: string;
  student_email: string;
  university_name: string | null;
  profile: string;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  isactive: boolean;
  created_at: string;
  updated_at: string;
  role_id: number;
};

type MyOrderCardProps = {
  infoTitle: string;
  inforTitlePrice: string;
  productImage: ImageSourcePropType;
  navigation?: any;
  shareid: number;
  category_id: number;
  date: string;
  ispurchase: boolean;
  profileshowinview: boolean
  createdby: CreatedBy,
    isreviewadded: boolean
    onCancel: (filters: any) => void; 
    cardId: number;
    orederStatus: string;
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
  profileshowinview,
  createdby,
    isreviewadded,
    onCancel,
    cardId,
    orederStatus

}) => {


  const getInitials = (firstname?: string, lastname?: string) => {
    if (!firstname && !lastname) return '';
    return `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase();
  };

  const { t } = useTranslation();

  const renderProfileSection = () => {
    if (profileshowinview) {
      if (createdby?.profile) {
        return (
          <Image
            source={{ uri: createdby.profile }}
            style={styles.image}
            resizeMode="cover"
          />
        );
      } else {
        return (
          <View style={styles.initialsCircle}>
            <Text allowFontScaling={false} style={styles.initialsText}>
              {getInitials(createdby?.firstname, createdby?.lastname)}
            </Text>
          </View>
        );
      }
    } else {
      return (
        <Image source={productImage} style={styles.image} resizeMode="cover" />
      );
    }
  };

  const handleViewTransaction = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Dashboard',
          params: {
            AddScreenBackactiveTab: 'Search',
            isNavigate: false,
          },
        },
      ],
    });
  };

  const handleWriteReview = () => {
    navigation.navigate('UserAddReview', { category_id: category_id, feature_id: shareid });
    };

    const handleCancelOrder = () => {
        onCancel({ orderid: cardId });
        

      };
    const isCancelled = orederStatus === 'Cancelled';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.row}>
        {renderProfileSection()}
        <View style={styles.details}>
          <Text allowFontScaling={false} style={styles.title}>
            {infoTitle}
          </Text>

          <Text allowFontScaling={false} style={styles.price}>
            {inforTitlePrice}
          </Text>

          {isCancelled ? (
  <View style={styles.statusTag}>
    <Text allowFontScaling={false} style={[styles.statusText,]}>
      {t('cancelled')}
    </Text>
  </View>
) : ispurchase ? (
            <View style={styles.statusTag}>
              <Text allowFontScaling={false} style={styles.statusText}>
                {t('fulfilled_on')}: {date}
              </Text>
            </View>
          ) : (
            <View style={styles.statusTag}>
              <Text allowFontScaling={false} style={styles.statusText}>
                {t('awaiting_delivery')}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardconstinerdivider} />
      <View style={styles.buttonRow}>
        {/* ALWAYS visible */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.7}
          onPress={handleViewTransaction}
        >
          <Text allowFontScaling={false} style={styles.btnText}>
            {t('view_in_transactions')}
          </Text>
        </TouchableOpacity>

              {/* ✅ Case 1: Completed + No Review */}
              {!isCancelled && (
              <>
        {ispurchase && !isreviewadded && (
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={handleWriteReview}
          >
            <Text allowFontScaling={false} style={styles.btnTextSecondary}>
              {t('write_a_review')}
            </Text>
          </TouchableOpacity>
                      )}
                      </>
                )}

        {/* ✅ Case 2: Awaiting Delivery */}
        {!ispurchase && (
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={handleCancelOrder}
          >
            <Text allowFontScaling={false} style={styles.btnTextSecondary}>
              {t('cancel_order')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* {ispurchase && !isreviewadded ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.7}
            onPress={handleViewTransaction}>
            <Text allowFontScaling={false} style={[styles.btnText]}>
              {t('view_in_transactions')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={handleWriteReview}>
            <Text allowFontScaling={false} style={styles.btnTextSecondary}>
              {t('write_a_review')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.singleButton}
          activeOpacity={0.7}
          onPress={handleViewTransaction}>
          <Text allowFontScaling={false} style={[styles.btnText,]}>
            {t('view_in_transactions')}
          </Text>
        </TouchableOpacity>
      )} */}
    </TouchableOpacity>
  );
};

export default MyOrderCard;

const styles = StyleSheet.create({

  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '98%',
    height: (Platform.OS === 'ios' ? 2 : 1.5),
    borderStyle: 'dashed',
    borderBottomWidth: (Platform.OS === 'ios' ? 0.9 : 1),
    borderColor: (Platform.OS === 'ios' ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)' : '#4169B8'),
    marginVertical: 6,
    marginLeft: 2

  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    // marginHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingBottom: 6
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
    color: '#ABC7FF',
    fontFamily: 'Urbanist-Medium',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderColor: '#6592D4',
    borderStyle: 'dashed',
    width: '100%',
    opacity: 0,
  },

  dashedLine1: {
    borderBottomWidth: 1,
    borderColor: '#5b70abff',
    borderStyle: 'dashed',
    marginVertical: 6,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden'
  },
  initialsText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
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
    flex: 1,
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
    flex: 1,
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
    color: '#ABC7FF',
    fontWeight: 500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
    letterSpacing: 0.5,
    textAlign:'center'
  },
  btnTextSecondary: {
    color: '#002050',
    fontWeight: 500,
    fontSize: 13,
    fontFamily: 'Urbanist-Medium',
    letterSpacing: 0.5
  },
});