import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Image,
  Platform,
  Dimensions,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
  TextInput,
  Keyboard,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import SalesAllDetailsDropdown from '../../utils/component/SalesAllDetailsDropdown';
import SalesAllDetailsDropdown_IOS from '../../utils/component/SalesAllDetailsDropdown_IOS';
import Loader from '../../utils/component/Loader';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import { BlurView } from '@react-native-community/blur';
import { Constant } from '../../utils/Constant';
import { showToast } from '../../utils/component/NewCustomToastManager';

import TOTALEARNING_ICON from '../../../assets/images/totalearnings.png';
import CHAT_ICON from '../../../assets/images/message_chat.png';
import NOPRODUCT from '../../../assets/images/noproduct.png';
import ITEMBACKGROUND from '../../../assets/images/placeholder_history.png';

// ─── Constants ───────────────────────────────────────────────────────────────
const TAB_PURCHASES = 'Purchases';
const TAB_SALES = 'Sales';
const TAB_CHARGES = 'Charges';
const TABS = [{ key: TAB_PURCHASES }, { key: TAB_SALES }, { key: TAB_CHARGES }];
const TAB_KEYS = [TAB_PURCHASES, TAB_SALES, TAB_CHARGES];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type TransactionPropos = {
  navigation: any;
  route: any;
};

interface TransactionItem {
  total_earning: number;
  total_orders: number;
  title: string;
  price: string;
  status: string;
  code?: string;
  seller?: string;
  university?: string;
  viewUrl?: string;
  order_otp: number;
  featureId: number;
  category_logo: string;
  feature_idNew: number;
  otpverified: boolean;
  is_cancelled: boolean;
  originalprice: string;
  orderid: any;
  amount: string;
  charge_type: string;
  purchased_quantity?: number;
  category_id: number;
  hours?: number;
  order_id?: number;
  firstname: string;
  lastname: string;
  profile: string;
  isblocked: boolean;
  blocked_you: boolean;
  chat_with_seller: boolean;
  created_by: created_by;
}

interface created_by {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
}

interface TransactionSection {
  date: string;
  total_sales: number;
  data: TransactionItem[];
}

// ─── Helpers (defined outside component to avoid re-creation) ─────────────────
const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

const getFormattedDate = (dateString: string, t?: any): string => {
  const parts = dateString.split(' ');
  if (parts.length !== 3) return dateString;
  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr);
  if (isNaN(day)) return dateString;

  const lang = i18n.language;
  let suffix = '';
  if (lang === 'en') {
    suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
        ? 'rd'
        : 'th';
  }

  const monthShort = monthStr.substring(0, 3).toLowerCase();
  const monthIndex = months.indexOf(monthShort);
  const translatedMonth =
    t && monthIndex !== -1 ? t(months[monthIndex]) : monthStr;
  return `${day}${suffix} ${translatedMonth} ${yearStr}`;
};

const formatSalesSection = (section: any) => ({
  date: section.date,
  total_sales: section.total_sales,
  data: section.transactions.map((item: any) => ({
    title: item.title,
    price: `£${item.amount}`,
    status: item.status,
    code: '',
    seller: item.sold_to,
    amount: item.amount,
    university: item.university_name,
    category_logo: item.category_logo,
    feature_idNew: item.id,
    featureId: item.id,
    total_sales: item.total_sales,
    total_orders: item.total_orders,
    total_earning: item.total_earning,
  })),
});

const formatPurchaseSection = (section: any) => ({
  date: section.date,
  data: section.transactions.map((item: any) => ({
    featureId: item.feature_id,
    title: item.title,
    price: `£${item.amount}`,
    status: item.order_status,
    code: item.status,
    seller: item.purchased_from,
    university: item.university_name,
    order_otp: item.order_otp,
    category_logo: item.category_logo,
    purchased_quantity: item.purchased_quantity ?? 0,
    category_id: item.category_id,
    hours: item.hours ?? 0,
    order_id: item.order_id,
    firstname: item.firstname,
    lastname: item.lastname,
    // profile: item.profile,
    isblocked: item.isblocked,
    blocked_you: item.blocked_you,
    chat_with_seller: item.chat_with_seller,
    created_by: item.created_by,
    profile: item.created_by.profile,
  })),
});

const formatChargesSection = (section: any) => ({
  date: section.date,
  data: section.transactions.map((item: any) => ({
    title: item.title,
    price: `£${item.listing_fee}`,
    status: item.payment_status,
    code: '',
    featureId: item.feature_id,
    viewUrl: item.view_listing_url,
    order_otp: 0,
    category_logo: item.category_logo,
    feature_idNew: item.feature_id,
    charge_type: item.charge_type,
  })),
});

// ─── Sub-components (memoized) ────────────────────────────────────────────────
const SectionHeader = React.memo(
  ({ date, isSales, t }: { date: string; isSales: boolean; t: any }) => (
    <Text
      allowFontScaling={false}
      style={isSales ? styles.dateText1 : styles.dateText}
    >
      {getFormattedDate(date, t)}
    </Text>
  ),
);

interface PurchaseCardProps {
  item: TransactionItem;
  onCancelPress: (id: number) => void;
  onChatPress: (item: TransactionItem) => void;
  t: any;
}
const PurchaseCard = React.memo(
  ({ item, onCancelPress, onChatPress, t }: PurchaseCardProps) => {
    const isFulfilledOrCancelled =
      item.status === 'Fulfilled' || item.status === 'Cancelled';
    const isAwaiting = item.status === 'Awaiting Delivery';
    const showQty =
      item?.category_id === 3 ||
      item?.category_id === 2 ||
      item?.category_id === 5;
    
    const showUnits = item?.category_id === 5 || item?.category_id === 2;

    const qtyLabel =
      item?.category_id === 3
        ? `${item?.purchased_quantity ?? 1} ${
            (item?.purchased_quantity ?? 1) > 1 ? t('units') : t('unit')
          }`
        : item?.category_id === 2
        ? `${item?.hours ?? 1} ${
            (item?.hours ?? 1) > 1 ? t('hours') : t('hour')
          }`
        : `${item?.hours ?? 1} ${
            (item?.hours ?? 1) > 1 ? t('sessions') : t('session')
          }`;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View>
              <Image
                source={ITEMBACKGROUND}
                style={styles.imgcontainer}
                resizeMode="cover"
              />
              <Image
                source={{ uri: item.category_logo }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.title}>
                <Text
                  numberOfLines={2}
                  allowFontScaling={false}
                  style={[styles.itemTitle, { width: '60%' }]}
                >
                  {item.title}
                </Text>
                {isAwaiting && (
                  <Pressable onPress={() => onCancelPress(item?.order_id ?? 0)}>
                    <View style={styles.cancelButton}>
                      <Text
                        allowFontScaling={false}
                        style={styles.cancelButtonText}
                      >
                        {t('cancel_order')}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
              <View style={styles.priceContainer}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.price,
                    { marginTop: showQty || isAwaiting ? -6 : 0 },
                  ]}
                >
                  {item.price}
                </Text>
                {showQty && (
                  <>
                    {!showUnits && (
                      <View style={styles.statusBox}>
                        <Text
                          allowFontScaling={false}
                          style={styles.purchasedText}
                        >
                          {qtyLabel}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusBox}>
            <Text allowFontScaling={false} style={styles.statusText}>
              {item.status}
            </Text>
          </View>
          <View
            style={[
              styles.codeBox,
              {
                height: 28,
                backgroundColor: isFulfilledOrCancelled
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(255, 255, 255, 0.06)',
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.codeText,
                {
                  color: isFulfilledOrCancelled
                    ? 'rgba(255,255,255,0.15)'
                    : '#9CD6FF',
                },
              ]}
            >
              {item.order_otp}
            </Text>
          </View>
        </View>

        <View style={styles.cardconstinerdivider} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1.8 }}>
            <Text style={styles.sellerText}>
              {t('purchased_from')}
              {'  '}
              <Text style={styles.sellerTextName}>
                {item.firstname} {item.lastname} ({item.university})
              </Text>
            </Text>
          </View>
          {!isFulfilledOrCancelled && (
            <TouchableOpacity
              style={styles.chatcard}
              activeOpacity={0.8}
              onPress={() => onChatPress(item)}
            >
              <Image source={CHAT_ICON} style={{ height: 16, width: 16 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

interface SalesCardProps {
  item: TransactionItem;
  onAllDetails: (item: TransactionItem) => void;
  t: any;
}
const SalesCard = React.memo(({ item, onAllDetails, t }: SalesCardProps) => (
  <View style={styles.salesCard}>
    <View style={styles.salescardHeadercontainer}>
      <View style={styles.salescardrow}>
        <View>
          <Image
            source={ITEMBACKGROUND}
            style={styles.imgcontainer}
            resizeMode="cover"
          />
          <Image
            source={{ uri: item.category_logo }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={{ width: 160 }}>
          <Text numberOfLines={2} style={styles.salesTitle}>
            {item.title.length > 24
              ? `${item.title.substring(0, 24)}...`
              : item.title}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onAllDetails(item)}>
        <Text allowFontScaling={false} style={styles.allDetails}>
          {t('all_details')}
        </Text>
      </TouchableOpacity>
    </View>
    <View style={styles.cardconstinerdivider} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text allowFontScaling={false} style={styles.earningLabel}>
        {t('total_order')}: {item.total_orders}
      </Text>
      <Text allowFontScaling={false} style={styles.earningLabel}>
        {t('total_earnings')}: £{Number(item.total_earning).toFixed(2)}
      </Text>
    </View>
  </View>
));

interface ChargesCardProps {
  item: TransactionItem;
  onViewListing: (featureId: number) => void;
  t: any;
}
const ChargesCard = React.memo(
  ({ item, onViewListing, t }: ChargesCardProps) => {
    const chargeLabel =
      item.charge_type === 'both'
        ? `${t('featured_listing_fee')} + ${t('accommodation_fee')}`
        : item.charge_type === 'feature_listing'
        ? t('featured_listing_fee')
        : item.charge_type === 'fixed_commission'
        ? t('accommodation_fee')
        : '';

    return (
      <View style={styles.chargesCard}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View>
              <Image
                source={ITEMBACKGROUND}
                style={styles.imgcontainer}
                resizeMode="cover"
              />
              <Image
                source={{ uri: item.category_logo }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={{ width: 160 }}>
              <Text
                numberOfLines={2}
                allowFontScaling={false}
                style={styles.chargesTitle}
              >
                {item.title}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => onViewListing(item.featureId)}>
            <Text allowFontScaling={false} style={styles.viewListingLink}>
              {t('view_listing')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardconstinerdivider} />
        <Text style={styles.viewListing}>
          {chargeLabel}: {item.price}
        </Text>
      </View>
    );
  },
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TransactionHistoryScreen({
  navigation,
  onSalesTabChange,
}: any) {
  const navigation1: NavigationProp<any> = useNavigation();
  const [selectedTab, setSelectedTab] = useState<string>(TAB_PURCHASES);
  const [transactions, setTransactions] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);

  const { route } = navigation;
  const { issales } = route?.params || {};
  const tabWidth = (SCREEN_WIDTH * 0.9) / TABS.length;

  const { t } = useTranslation();
  const bubbleX = useRef(new Animated.Value(0)).current;
  const [overallEarning, setOverallEarning] = useState(0);
  const [showPopup1, setShowPopup1] = useState(false);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [SalesImageUrl, setSalesImageUrl] = useState('');
  const [catagoryid, setCatagoryid] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [salesTitle, setSalesTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderId, setOrderId] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<any>(null);

  const getTabLabel = useCallback(
    (key: string) => {
      switch (key) {
        case TAB_PURCHASES:
          return t('purchases');
        case TAB_SALES:
          return t('sales');
        case TAB_CHARGES:
          return t('charges');
        default:
          return key;
      }
    },
    [t],
  );

  useEffect(() => {
    if (issales) setSelectedTab(TAB_SALES);
  }, [issales]);

  useEffect(() => {
    if (onSalesTabChange) onSalesTabChange(selectedTab === TAB_SALES);
  }, [selectedTab, onSalesTabChange]);

  useEffect(() => {
    const index = TAB_KEYS.indexOf(selectedTab);
    Animated.spring(bubbleX, {
      toValue: index * tabWidth,
      friction: 6,
      tension: 20,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, tabWidth]);

  const handleForceLogout = useCallback(async () => {
    await AsyncStorage.clear();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [token, language_code] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedLanguage'),
      ]);

      if (!token) return;

      const urlMap: Record<string, string> = {
        [TAB_PURCHASES]: `${MAIN_URL.baseUrl}transaction/purchase`,
        [TAB_SALES]: `${MAIN_URL.baseUrl}transaction/sales`,
        [TAB_CHARGES]: `${MAIN_URL.baseUrl}transaction/charges`,
      };
      const url = urlMap[selectedTab];

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          languagecode: language_code || 'en',
        },
      });
      console.log('TransactionURL: ', url);

      if (response.status === 401 || response.status === 403) {
        handleForceLogout();
        return;
      }
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      if (json.statusCode === 401 || json.statusCode === 403) {
        handleForceLogout();
        return;
      }

      let formatted: TransactionSection[] = [];

      if (selectedTab === TAB_PURCHASES && Array.isArray(json.data)) {
        formatted = json.data.map(formatPurchaseSection);
      } else if (selectedTab === TAB_SALES && json.data?.sales_history) {
        setOverallEarning(json.data.total_earning);
        formatted = json.data.sales_history.map(formatSalesSection);
      } else if (selectedTab === TAB_CHARGES && json.data?.charges_history) {
        formatted = json.data.charges_history.map(formatChargesSection);
      }

      setTransactions(formatted);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedTab, handleForceLogout]);

  useEffect(() => {
    setTransactions([]); // ✅ Clear old data
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (showPopup1) {
      const timer = setTimeout(() => inputs.current[0]?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [showPopup1]);

  const handleCancelOrder = useCallback(
    async (id: number) => {
      setShowDeleteModal(false);
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(
          `${MAIN_URL.baseUrl}transaction/post-order-cancel`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderid: id }),
          },
        );
        const json = await response.json();

        if (response.status === 200) fetchTransactions();
        if (json.statusCode === 401 || json.statusCode === 403)
          handleForceLogout();
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions, handleForceLogout],
  );

  const fetchSalesHistory = useCallback(async (catagory_id: number) => {
    try {
      const [token, language_code] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedLanguage'),
      ]);
      if (!token) return;

      const response = await fetch(
        `${MAIN_URL.baseUrl}transaction/sales-history?feature_id=${catagory_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            languagecode: language_code || 'en',
          },
        },
      );

      if (response.status === 401 || response.status === 403) return;
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();
      if (json.statusCode === 401 || json.statusCode === 403) return;

      setSalesData(json);
      setFilterVisible(true);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const otpverify = useCallback(async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const [token, language_code] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedLanguage'),
      ]);
      if (!token) {
        setLoading(false);
        return;
      }

      const otpValue = otp.join('');
      const res = await fetch(
        `${MAIN_URL.baseUrl}transaction/verify-post-order-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            languagecode: language_code || 'en',
          },
          body: JSON.stringify({ otp: otpValue, orderid: selectedOrderId }),
        },
      );

      const data = await res.json();
      setShowPopup1(false);

      if (data?.statusCode === 200) {
        setLoading(false);
        showToast(t(data.message), 'success');
      } else {
        setLoading(false);
        setOtp(['', '', '', '', '', '']);
        showToast(t(data?.message), 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  }, [otp, selectedOrderId, t]);

  const handleChange = useCallback((text: string, index: number) => {
    setOtp(prev => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }, []);

  // ─── Stable callbacks for sub-components ──────────────────────────────────
  const handleCancelPress = useCallback((id: number) => {
    setOrderId(id);
    setShowDeleteModal(true);
  }, []);

  const handleChatPress = useCallback(
    (item: TransactionItem) => {
      if (
        item?.chat_with_seller &&
        item.status !== 'Fulfilled' &&
        item.status !== 'Cancelled'
      ) {
        navigation.navigate('MessagesIndividualScreen', {
          animation: 'none',
          sellerData: {
            featureId: item.featureId,
            firstname: item.firstname,
            lastname: item.lastname,
            profile: item.created_by.profile,
            universityName: item.university,
            id: item.created_by.id,
            isblocked: item.isblocked,
            blocked_you: item.blocked_you,
          },
          source: 'sellerPage',
        });
      }
    },
    [navigation],
  );

  const handleAllDetails = useCallback(
    (item: TransactionItem) => {
      setSalesImageUrl(item.category_logo);
      setCatagoryid(item.featureId);
      fetchSalesHistory(item.featureId);
      setSalesTitle(item.title);
    },
    [fetchSalesHistory],
  );

  const handleViewListing = useCallback(
    (featureId: number) => {
      navigation1.navigate('ViewListingDetails', { shareid: featureId });
    },
    [navigation1],
  );

  // ─── SectionList handlers (stable refs) ───────────────────────────────────
  const keyExtractor = useCallback(
    (item: TransactionItem, index: number) =>
      `${selectedTab}-${item.title}-${index}`,
    [selectedTab],
  );

  const renderSectionHeader = useCallback(
    ({ section: { date } }: { section: TransactionSection }) => (
      <SectionHeader date={date} isSales={selectedTab === TAB_SALES} t={t} />
    ),
    [selectedTab, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: TransactionItem }) => {
      if (selectedTab === TAB_PURCHASES) {
        return (
          <PurchaseCard
            item={item}
            onCancelPress={handleCancelPress}
            onChatPress={handleChatPress}
            t={t}
          />
        );
      }
      if (selectedTab === TAB_SALES) {
        return <SalesCard item={item} onAllDetails={handleAllDetails} t={t} />;
      }
      return (
        <ChargesCard item={item} onViewListing={handleViewListing} t={t} />
      );
    },
    [
      selectedTab,
      handleCancelPress,
      handleChatPress,
      handleAllDetails,
      handleViewListing,
      t,
    ],
  );

  const ListHeaderComponent =
    selectedTab === TAB_SALES && transactions.length > 0 ? (
      <View style={styles.chargesCard}>
        <View style={styles.salescard}>
          <View>
            <Image
              source={ITEMBACKGROUND}
              style={styles.imgcontainer}
              resizeMode="cover"
            />
            <Image
              source={TOTALEARNING_ICON}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.overallEarningContainer}>
            <Text style={styles.Overall_Earnings_value}>
              {t('overall_earnings')}
            </Text>
            <Text style={styles.Overall_Earnings_title}>
              {`£${Number(overallEarning).toFixed(2)}`}
            </Text>
          </View>
        </View>
      </View>
    ) : null;

  // const ListEmptyComponent = loading && transactions.length === 0 ? (
  //   <View style={styles.loaderWrapper}>
  //     <Loader containerStyle={styles.loaderContainer} />
  //   </View>
  // ) : (
  const ListEmptyComponent = !loading ? (
    <View style={styles.emptyWrapper}>
      <View
        style={[
          styles.emptyContainer,
          {
            height:
              Platform.OS === 'ios'
                ? SCREEN_HEIGHT * 0.7
                : SCREEN_HEIGHT * 0.72,
          },
        ]}
      >
        <Image
          source={NOPRODUCT}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text allowFontScaling={false} style={styles.emptyText}>
          {t('no_transactions_found')}
        </Text>
      </View>
    </View>
  ) : null;
  // <View style={styles.emptyWrapper}>
  //   <View
  //     style={[
  //       styles.emptyContainer,
  //       {
  //         height:
  //           Platform.OS === 'ios'
  //             ? SCREEN_HEIGHT * 0.7
  //             : SCREEN_HEIGHT * 0.72,
  //       },
  //     ]}
  //   >
  //     <Image
  //       source={NOPRODUCT}
  //       style={styles.emptyImage}
  //       resizeMode="contain"
  //     />
  //     <Text allowFontScaling={false} style={styles.emptyText}>
  //       {t('no_transactions_found')}
  //     </Text>
  //   </View>
  // </View>
  // );

  const listMarginBottom =
    selectedTab === TAB_SALES
      ? Platform.OS === 'ios'
        ? SCREEN_HEIGHT * 0.2
        : SCREEN_HEIGHT * 0.34
      : Platform.OS === 'ios'
      ? SCREEN_HEIGHT * 0.1
      : SCREEN_HEIGHT * 0.34;

  return (
    <View style={styles.fullScreen}>
      {/* Tab Bar */}
      <View style={styles.bottomTabContainer}>
        <View style={styles.height_38}>
          <Animated.View
            style={[
              styles.bubble,
              { width: tabWidth - 3, transform: [{ translateX: bubbleX }] },
            ]}
          />
        </View>
        {TABS.map(({ key }, index) => (
          <React.Fragment key={key}>
            <Pressable
              style={[
                styles.tabItem,
                { width: tabWidth, alignItems: 'center' },
              ]}
              onPress={() => {
                if (key === selectedTab) {
                  fetchTransactions(); // 🔥 manual refresh
                } else {
                  setLoading(true);
                  setTransactions([]);
                  setSelectedTab(key);
                }
              }}
            >
              <View style={styles.iconWrapper}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.tabLable,
                    { color: key === selectedTab ? '#FFFFFF' : '#89C7FF' },
                  ]}
                >
                  {getTabLabel(key)}
                </Text>
              </View>
            </Pressable>

            {key === TAB_PURCHASES &&
              index !== TABS.length - 1 &&
              selectedTab !== TAB_PURCHASES &&
              selectedTab !== TAB_SALES && (
                <View style={[styles.leftVerticalLine, { left: '34%' }]} />
              )}
            {key === TAB_SALES &&
              index !== TABS.length - 1 &&
              selectedTab !== TAB_SALES &&
              selectedTab !== TAB_CHARGES && (
                <View style={[styles.leftVerticalLine, { right: '34%' }]} />
              )}
          </React.Fragment>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderWrapper}>
          <Loader containerStyle={styles.loaderContainer} />
        </View>
      ) : (
        <SectionList
          sections={transactions}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          style={{ width: '100%', marginBottom: listMarginBottom }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      {/* Cancel Order Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.overlay}>
            <BlurView
              style={[StyleSheet.absoluteFill,styles.modelBlur]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
            {/* <BlurView
              style={styles.blureView_style}
              blurType="light"
              blurAmount={2}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            > */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />
            <View style={styles.popupContainer}>
              <Image
                source={require('../../../assets/images/alerticon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.mainheader1}>
                {t('confirm_action')}
              </Text>
              <Text
                allowFontScaling={false}
                style={[styles.mainheader, { marginTop: 10 }]}
              >
                {t('cancel_order_message_action')}
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => handleCancelOrder(orderId)}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('yes_cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginButton1}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text allowFontScaling={false} style={styles.loginText1}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            </View>
            {/* </BlurView> */}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* OTP Modal */}
      <Modal
        visible={showPopup1}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup1(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPopup1(false)}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
                ]}
              />
              {loading && (
                <View style={styles.fullLoader}>
                  <Loader />
                </View>
              )}
              <View style={styles.popupContainer}>
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('Enter_Delivery_OTP')}
                </Text>
                <Text allowFontScaling={false} style={styles.subheader}>
                  {t('please_enter_6digit_otp')}
                </Text>
                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3, 4, 5].map((_, index) => (
                    <TextInput
                      selectionColor="#F5F5F5"
                      cursorColor="#F5F5F5"
                      value={otp[index]}
                      key={index}
                      ref={ref => {
                        inputs.current[index] = ref;
                      }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      onChangeText={text =>
                        handleChange(text.replace(/[^0-9]/g, ''), index)
                      }
                      returnKeyType="next"
                      textAlign="center"
                      secureTextEntry
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace') {
                          if (otp[index] !== '') {
                            setOtp(prev => {
                              const n = [...prev];
                              n[index] = '';
                              return n;
                            });
                            return;
                          }
                          if (index > 0) {
                            inputs.current[index - 1]?.focus();
                            setOtp(prev => {
                              const n = [...prev];
                              n[index - 1] = '';
                              return n;
                            });
                          }
                        }
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={otpverify}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('verify')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.loginButton1}
                  onPress={() => setShowPopup1(false)}
                >
                  <Text allowFontScaling={false} style={styles.loginText1}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Sales Details Dropdown */}
      {Platform.OS === 'android' ? (
        <SalesAllDetailsDropdown
          catagory_id={catagoryid}
          visible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          SalesImageUrl={SalesImageUrl}
          salesDataResponse={salesData}
          dropDowntitle={salesTitle}
        />
      ) : (
        <SalesAllDetailsDropdown_IOS
          catagory_id={catagoryid}
          visible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          SalesImageUrl={SalesImageUrl}
          salesDataResponse={salesData}
          dropDowntitle={salesTitle}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  salescardrow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  salescardHeadercontainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallEarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'space-between',
    padding: 1,
  },
  salescard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  // blureView_style: {
  //   flex: 1,
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   width: '100%',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(0, 0, 0, 0.30)',
  // },
  purchasedText: {
    color: '#9CD6FF',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    justifyContent: 'space-between',
  },
  title: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  height_38: { height: 38 },
  fullScreen: {
    flex: 1,
    marginTop: 11,
    paddingHorizontal: 16,
    height: '100%',
    width: '100%',
  },
  tabLable: {
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
    lineHeight: 18,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  leftVerticalLine: {
    position: 'absolute',
    height: '60%',
    width: 1,
    backgroundColor: 'rgba(158, 229, 255, 0.3)',
    marginHorizontal: 4,
  },
  chatcard: {
    borderRadius: 10,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 30,
    width: 20,
    flex: 0.2,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderColor: '#ffffff25',
    borderWidth: 1,
    padding: 6,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Urbanist-SemiBold',
  },
  otpBox: {
    width: Platform.OS === 'ios' ? 42 : 48,
    height: Platform.OS === 'ios' ? 42 : 48,
    borderRadius: 12,
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#ffffff2c',
    elevation: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    alignSelf: 'center',
    gap: 6,
    marginTop: 16,
  },
  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  fullLoader: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: { width: 64, height: 64, borderRadius: 60 },
  mainheader1: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  popupContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  loginButton1: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    width: '100%',
  },
  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    width: '100%',
  },
  loginButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modelBlur: {
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? 547 : 300,
    paddingVertical: Platform.OS === 'ios' ? 0 : 40,
  },
  loaderContainer: { width: 100, height: 100 },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingVertical: 40,
  },
  emptyImage: { width: 64, height: 64, marginBottom: 0 },
  emptyText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
  },
  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? 2 : 1.5,
    borderStyle: 'dashed',
    borderBottomWidth: Platform.OS === 'ios' ? 0.9 : 1,
    borderColor:
      Platform.OS === 'ios' ? 'rgba(186, 218, 255, 0.43)' : '#4169B8',
  },
  imgcontainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    position: 'absolute',
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  dateText1: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  price: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    gap: 12,
    borderRadius: 4,
    justifyContent: 'center',
    height: 20,
    alignItems: 'flex-end',
  },
  statusText: {
    color: '#9CDDFF',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 15.6,
  },
  codeBox: {
    height: 24,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  codeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerText: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerTextName: {
    color: '#9CD6FF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  salesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 8,
    borderRadius: 18,
    gap: 12,
  },
  salesTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 2,
  },
  allDetails: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  chargesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 12,
    borderRadius: 18,
    gap: 12,
  },
  chargesTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  Overall_Earnings_value: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  Overall_Earnings_title: {
    fontWeight: '600',
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  viewListing: {
    color: 'rgba(149, 239, 255, 0.87)',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
  },
  viewListingLink: {
    color: '#ffffffff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  earningLabel: {
    color: '#B2EBFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
  },
  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    marginBottom: Platform.OS === 'ios' ? 15 : 15,
    borderRadius: 50,
    alignSelf: 'center',
    borderWidth: 0.4,
    borderColor: 'transparent',
    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23), -0.90px -0.80px 1px 0px rgba(255, 255, 255, 0.19)inset, 0.90px 0.80px 0.90px 0px rgba(255, 255, 255, 0.19)inset',
    backgroundColor: 'rgba(40, 55, 149, 0.12)',
    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    boxSizing: 'border-box',
    zIndex: 100,
    marginTop: -10,
  },
  bubble: {
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff2e',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    marginLeft: 2,
  },
  tabItem: {},
  iconWrapper: {
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
