// //IOS
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BlurView } from '@react-native-community/blur';
// import { useEffect, useState } from 'react';
// import {
//   Image,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { MAIN_URL } from '../APIConstant';

// interface FilterBottomSheetProps {
//   catagory_id: number;
//   visible: boolean;
//   onClose: () => void;
//   onApply: (filters: any) => void; // 👈 new callback
//   from: number;
//   to: number;
//   initialFilters?: any;
// }

// const SalesAllDetailsDropdown = ({
//   catagory_id,
//   visible,
//   onClose,
//   initialFilters,
// }: FilterBottomSheetProps) => {
//   const [filters, setFilters] = useState<any[]>([]);
//   const [selectedTab, setSelectedTab] = useState<string | null>(null);

//   const [dropdownSelections, setDropdownSelections] = useState<
//     Record<number, number[]>
//   >({});
//   const productImage = require('../../../assets/images/producticon.png');

//   const fetchFilters = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const body = { category_id: catagory_id };
//       const url = MAIN_URL.baseUrl + 'category/feature/filter';

//       const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       if (data.statusCode === 200) {
//         const dynamicFilters = data.data.filter(
//           (item: any) =>
//             item.field_type?.toLowerCase() === 'dropdown' ||
//             item.alias_name?.toLowerCase() === 'price',
//         );
//         console.log('Current Filter: ' + dynamicFilters);
//         setFilters(dynamicFilters);
//         if (!selectedTab && dynamicFilters.length) {
//           setSelectedTab(dynamicFilters[0].field_name);
//         }
//       }
//     } catch (err) {
//       console.log('Error fetching filters:', err);
//     }
//   };

//   useEffect(() => {
//     fetchFilters();
//   }, []);


//   const handleClose = () => {
   
//     onClose();
//   };

//   const getInitials = (firstName = '', lastName = '') => {
//     const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
//     const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
//     return f + l || '?';
//   };

//   const renderRightContent = () => {
//     const currentFilter = filters.find(f => f.field_name === selectedTab);
//     if (!currentFilter) return null;

//     return (
//       <ScrollView
//         style={{ flexGrow: 0, paddingTop: 10 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {currentFilter.options.map((opt: any) => (
//           <View style={{}}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 flex: 1,
//                 width: '100%',
//                 marginBottom: 12,
//                 alignItems: 'center',
//               }}
//             >
//               <View style={styles.initialsCircle}>
//                 <Text allowFontScaling={false} style={styles.initialsText}>
//                   {getInitials('Alan', 'Walker')}
//                 </Text>
//               </View>
//               <View style={{ gap: 4, flex: 0.5 }}>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 14,
//                   }}
//                 >
//                   Christopher Nolan
//                 </Text>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 12,
//                   }}
//                 >
//                   University of Warwick
//                 </Text>
//               </View>
//               <View style={{ gap: 4, alignItems: 'flex-end', flex: 0.5 }}>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 14,
//                   }}
//                 >
//                   $20
//                 </Text>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-regular',
//                     fontSize: 12,
//                   }}
//                 >
//                   01 - 01 -2025
//                 </Text>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     );
//   };

//   return (
//     <View
//       style={[
//         StyleSheet.absoluteFillObject,
//         { zIndex: 999, display: visible ? 'flex' : 'none',height: '200%' },
//       ]}
//     >
//       <BlurView
//         style={[StyleSheet.absoluteFillObject]}
//         blurType="dark"
//         blurAmount={Platform.OS === 'ios' ? 1 : 4}
//         reducedTransparencyFallbackColor="transparent"
//       />
//       <Modal
//         animationType="slide"
//         visible={visible}
//         transparent
//         onRequestClose={handleClose}
//       >
//         <View
//           style={{
//             flex: 1,
//             justifyContent: 'flex-end',
//           }}
//         >
//           <View style={styles.overlay}>
//             <TouchableWithoutFeedback onPress={handleClose}>
//               <View style={StyleSheet.absoluteFillObject} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modelcontainer]}>
//               <View style={{}}> 

//               <BlurView
//                 style={{backgroundColor: 'transparent',width: '210%',height: 900,position: 'absolute',top: 130,left: -300,right: 0,bottom: 0}}
//                 blurType="dark"
//                 blurAmount={Platform.OS === 'ios' ? 10 : 4}
//                 reducedTransparencyFallbackColor="transparent"
//               />                
//               </View>
              

//               <View style={styles.modeltitleContainer1}>
              
//                 <View
//                   style={{
//                     width: 50,
//                     height: 4,
//                     borderRadius: 2,
//                     alignSelf: 'center',
//                     backgroundColor: '#000228',
//                     marginTop: 8,
//                   }}
//                 />

//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     gap: 12,
//                     marginTop: 20,
//                   }}
//                 >
//                   <View style={styles.imgcontainer}>
//                     <Image
//                       source={productImage}
//                       style={styles.image}
//                       resizeMode="cover"
//                     />
//                   </View>
//                   <Text style={styles.salesTitle}>Full House Cleaning</Text>
//                 </View>

//                 <View />

//                 <View style={styles.cardconstinerdivider} />
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontFamily: 'Urbanist-SemiBold',
//                       fontSize: 12,
//                       fontWeight: '600',
//                       color: '#FFFFFF',
//                     }}
//                   >
//                     Total Orders: 04
//                   </Text>
//                   <Text
//                     style={{
//                       fontFamily: 'Urbanist-SemiBold',
//                       fontSize: 12,
//                       fontWeight: '600',
//                       color: '#FFFFFF',
//                     }}
//                   >
//                     Total Earnings: $80
//                   </Text>
//                 </View>
//               </View>

//               <View
//                 style={{
//                   flex: 1,
//                   flexDirection: 'row',
//                 }}
//               >
//                 <ScrollView
//                   style={{
//                     flex: 1,
//                     paddingHorizontal: 16,
//                   }}
//                   contentContainerStyle={{ paddingBottom: 70 }}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   <Text allowFontScaling={false} style={styles.filterHeadTitle}>
//                     Sold To
//                   </Text>
//                   {renderRightContent()}
//                 </ScrollView>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   cardconstinerdivider: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     borderStyle: 'dashed',
//     borderBottomWidth: 1,
//     backgroundColor:
//       Platform.OS === 'ios' ? 'rgba(67, 170, 234, 0.09)' : 'none',
//     height: 2,
//     marginTop: 10,
//     marginBottom: 10,
//     borderColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
//   },
//   initialsCircle: {
//     backgroundColor: 'rgba(63, 110, 251, 0.43)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   initialsText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 600,
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   salesTitle: {
//     fontWeight: '600',
//     fontSize: 17,
//     color: '#fff',
//     marginBottom: 5,
//     letterSpacing: 1,
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   image: {
//     width: 24,
//     height: 24,
//     resizeMode: 'contain',
//   },

//   imgcontainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 10,
//     // padding: 8,
//     paddingTop: 9,
//     paddingBottom: 8,
//     paddingLeft: 12,
//     paddingRight: 12,

//     alignItems: 'center',
//     borderWidth: 0.4,
//     borderColor: '#ffffff11',
//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(42, 126, 223, 0.67) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     boxSizing: 'border-box',
//   },

//   modeltitleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     padding: 26,
//     backgroundColor: 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   modeltitleContainer1: {
//     width: '100%',
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//     backgroundColor:
//       Platform.OS === 'ios'
//         ? 'redail-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(216, 229, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
//         : 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },

//   modelcontainer: {
//     height: '80%',
//     marginTop: 'auto',
//     // backgroundColor:
//     //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 29, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     width: '100%',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     alignItems: 'center',
//     // opacity: 0.91,
//     overflow: 'hidden',
//   },

//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   filterHeadTitle: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 14,
//     fontWeight: '600',
//     fontStyle: 'normal',
//     letterSpacing: 0.32,
//     lineHeight: 19.6,
//     marginTop: 12,
//   },
// });
// export default SalesAllDetailsDropdown;




// //IOS
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BlurView } from '@react-native-community/blur';
// import { useEffect, useState } from 'react';
// import {
//   Image,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { MAIN_URL } from '../APIConstant';

// interface FilterBottomSheetProps {
//   catagory_id: number;
//   visible: boolean;
//   onClose: () => void;
//   onApply: (filters: any) => void; // 👈 new callback
//   from: number;
//   to: number;
//   initialFilters?: any;
// }

// const SalesAllDetailsDropdown = ({
//   catagory_id,
//   visible,
//   onClose,
//   initialFilters,
// }: FilterBottomSheetProps) => {
//   const [filters, setFilters] = useState<any[]>([]);
//   const [selectedTab, setSelectedTab] = useState<string | null>(null);

//   const [dropdownSelections, setDropdownSelections] = useState<
//     Record<number, number[]>
//   >({});
//   const productImage = require('../../../assets/images/producticon.png');

//   const fetchFilters = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const body = { category_id: catagory_id };
//       const url = MAIN_URL.baseUrl + 'category/feature/filter';

//       const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       if (data.statusCode === 200) {
//         const dynamicFilters = data.data.filter(
//           (item: any) =>
//             item.field_type?.toLowerCase() === 'dropdown' ||
//             item.alias_name?.toLowerCase() === 'price',
//         );
//         console.log('Current Filter: ' + dynamicFilters);
//         setFilters(dynamicFilters);
//         if (!selectedTab && dynamicFilters.length) {
//           setSelectedTab(dynamicFilters[0].field_name);
//         }
//       }
//     } catch (err) {
//       console.log('Error fetching filters:', err);
//     }
//   };

//   useEffect(() => {
//     fetchFilters();
//   }, []);


//   const handleClose = () => {
   
//     onClose();
//   };

//   const getInitials = (firstName = '', lastName = '') => {
//     const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
//     const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
//     return f + l || '?';
//   };

//   const renderRightContent = () => {
//     const currentFilter = filters.find(f => f.field_name === selectedTab);
//     if (!currentFilter) return null;

//     return (
//       <ScrollView
//         style={{ flexGrow: 0, paddingTop: 10 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {currentFilter.options.map((opt: any) => (
//           <View style={{}}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 flex: 1,
//                 width: '100%',
//                 marginBottom: 12,
//                 alignItems: 'center',
//               }}
//             >
//               <View style={styles.initialsCircle}>
//                 <Text allowFontScaling={false} style={styles.initialsText}>
//                   {getInitials('Alan', 'Walker')}
//                 </Text>
//               </View>
//               <View style={{ gap: 4, flex: 0.5 }}>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 14,
//                   }}
//                 >
//                   Christopher Nolan
//                 </Text>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 12,
//                   }}
//                 >
//                   University of Warwick
//                 </Text>
//               </View>
//               <View style={{ gap: 4, alignItems: 'flex-end', flex: 0.5 }}>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                     fontSize: 14,
//                   }}
//                 >
//                   $20
//                 </Text>
//                 <Text
//                   style={{
//                     color: 'rgb(255, 255, 255)',
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-regular',
//                     fontSize: 12,
//                   }}
//                 >
//                   01 - 01 -2025
//                 </Text>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     );
//   };

//   return (
//     <View
//       style={[
//         StyleSheet.absoluteFillObject,
//         { zIndex: 999, display: visible ? 'flex' : 'none',height: '200%' },
//       ]}
//     >
//       <BlurView
//         style={[StyleSheet.absoluteFillObject]}
//         blurType="dark"
//         blurAmount={Platform.OS === 'ios' ? 1 : 4}
//         reducedTransparencyFallbackColor="transparent"
//       />
//       <Modal
//         animationType="slide"
//         visible={visible}
//         transparent
//         onRequestClose={handleClose}
//       >
//         <View
//           style={{
//             flex: 1,
//             justifyContent: 'flex-end',
//           }}
//         >
//           <View style={styles.overlay}>
//             <TouchableWithoutFeedback onPress={handleClose}>
//               <View style={StyleSheet.absoluteFillObject} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modelcontainer]}>
//               <View style={{}}> 

//               <BlurView
//                 style={{backgroundColor: 'transparent',width: '210%',height: 900,position: 'absolute',top: 130,left: -300,right: 0,bottom: 0}}
//                 blurType="dark"
//                 blurAmount={Platform.OS === 'ios' ? 10 : 4}
//                 reducedTransparencyFallbackColor="transparent"
//               />                
//               </View>
              

//               <View style={styles.modeltitleContainer1}>
              
//                 <View
//                   style={{
//                     width: 50,
//                     height: 4,
//                     borderRadius: 2,
//                     alignSelf: 'center',
//                     backgroundColor: '#000228',
//                     marginTop: 8,
//                   }}
//                 />

//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     gap: 12,
//                     marginTop: 20,
//                   }}
//                 >
//                   <View style={styles.imgcontainer}>
//                     <Image
//                       source={productImage}
//                       style={styles.image}
//                       resizeMode="cover"
//                     />
//                   </View>
//                   <Text style={styles.salesTitle}>Full House Cleaning</Text>
//                 </View>

//                 <View />

//                 <View style={styles.cardconstinerdivider} />
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontFamily: 'Urbanist-SemiBold',
//                       fontSize: 12,
//                       fontWeight: '600',
//                       color: '#FFFFFF',
//                     }}
//                   >
//                     Total Orders: 04
//                   </Text>
//                   <Text
//                     style={{
//                       fontFamily: 'Urbanist-SemiBold',
//                       fontSize: 12,
//                       fontWeight: '600',
//                       color: '#FFFFFF',
//                     }}
//                   >
//                     Total Earnings: $80
//                   </Text>
//                 </View>
//               </View>

//               <View
//                 style={{
//                   flex: 1,
//                   flexDirection: 'row',
//                 }}
//               >
//                 <ScrollView
//                   style={{
//                     flex: 1,
//                     paddingHorizontal: 16,
//                   }}
//                   contentContainerStyle={{ paddingBottom: 70 }}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   <Text allowFontScaling={false} style={styles.filterHeadTitle}>
//                     Sold To
//                   </Text>
//                   {renderRightContent()}
//                 </ScrollView>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   cardconstinerdivider: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     borderStyle: 'dashed',
//     borderBottomWidth: 1,
//     backgroundColor:
//       Platform.OS === 'ios' ? 'rgba(67, 170, 234, 0.09)' : 'none',
//     height: 2,
//     marginTop: 10,
//     marginBottom: 10,
//     borderColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
//   },
//   initialsCircle: {
//     backgroundColor: 'rgba(63, 110, 251, 0.43)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     marginRight: 12,
//   },
//   initialsText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 600,
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   salesTitle: {
//     fontWeight: '600',
//     fontSize: 17,
//     color: '#fff',
//     marginBottom: 5,
//     letterSpacing: 1,
//     fontFamily: 'Urbanist-SemiBold',
//   },
//   image: {
//     width: 24,
//     height: 24,
//     resizeMode: 'contain',
//   },

//   imgcontainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 10,
//     // padding: 8,
//     paddingTop: 9,
//     paddingBottom: 8,
//     paddingLeft: 12,
//     paddingRight: 12,

//     alignItems: 'center',
//     borderWidth: 0.4,
//     borderColor: '#ffffff11',
//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(42, 126, 223, 0.67) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     boxSizing: 'border-box',
//   },

//   modeltitleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     padding: 26,
//     backgroundColor: 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   modeltitleContainer1: {
//     width: '100%',
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//     backgroundColor:
//       Platform.OS === 'ios'
//         ? 'redail-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(216, 229, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
//         : 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },

//   modelcontainer: {
//     height: '80%',
//     marginTop: 'auto',
//     // backgroundColor:
//     //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 29, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     width: '100%',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     alignItems: 'center',
//     // opacity: 0.91,
//     overflow: 'hidden',
//   },

//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   filterHeadTitle: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 14,
//     fontWeight: '600',
//     fontStyle: 'normal',
//     letterSpacing: 0.32,
//     lineHeight: 19.6,
//     marginTop: 12,
//   },
// });
// export default SalesAllDetailsDropdown;




import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MAIN_URL } from '../APIConstant';

interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  SalesImageUrl: string;
  salesDataResponse: any[];
  dropDowntitle: string; 
}

const SalesAllDetailsDropdown = ({
  catagory_id,
  visible,
  onClose,
  SalesImageUrl,
  salesDataResponse,
  dropDowntitle

}: FilterBottomSheetProps) => {
  
  const [salesData, setSalesData] = useState<any[]>([]);// Holds the sales data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  



  const fetchSalesHistory = async (catagory_id: number) => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }
  
      // Construct the URL
      const url = `${MAIN_URL.baseUrl}transaction/sales-history?feature_id=${catagory_id}`;
      console.log('SalesHistory URL:', url);
  
      // Make the API call
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
  
      // Handle response status codes
      if (response.status === 200) {
        setSalesData(json.data.features.buyers);
        console.log("SalesHistory ResponseByers JSON:", json.data);
        console.log("SalesHistory ResponseByers:", json.data.features.buyers);

      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Parse the JSON response
      
      console.log("SalesHistory Response:", json);
  
      if (json.statusCode === 401 || json.statusCode === 403) {
        // handleForceLogout();
        return;
      }
  
      // Update the sales data to only contain the 'buyers' array
       // <-- Corrected part
  
    } catch (err) {
      console.log('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
      console.log('Component mounted, fetching sales history',salesDataResponse);
      
      fetchSalesHistory(catagory_id);
        // setSalesData(salesDataResponse);
    
  }, [salesDataResponse]);

  const handleClose = () => {
    onClose();
  };

  const handleForceLogout = async () => {
    console.log('User inactive or unauthorized — logging out');
    await AsyncStorage.clear();
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const totalEarnings = salesData.reduce((acc, buyer) => acc + parseFloat(buyer.amount || 0), 0).toFixed(2);

  const renderRightContent = () => {
    // Check if the sales data is still loading
    if (loading) {
      return (
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>Loading...</Text>
      );
    }

    // If there's no sales data, show a message
    if (salesData.length === 0) {
      return (
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>No sales data available</Text>
      );
    }

    // Render the sales data
    return (

      <ScrollView style={{ flexGrow: 0, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        {Array.isArray(salesData) && salesData.length > 0 ? (
  salesData.map((buyer, index) => (
    <View key={index} style={{ marginBottom: 5 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          width: '100%',
          marginBottom: 12,
          alignItems: 'center',
        }}
      >



            {buyer?.profile ? (
                  <Image
                    source={{ uri: buyer.profile }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text allowFontScaling={false} style={styles.initialsText}>
            {getInitials(buyer.firstname, buyer.lastname)}
          </Text>
                  </View>
          )}


        {/* <View style={styles.initialsCircle}>
          <Text allowFontScaling={false} style={styles.initialsText}>
            {getInitials(buyer.firstname, buyer.lastname)}
          </Text>
        </View> */}
        <View style={{ gap: 4, flex: 0.5 }}>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 14,
            }}
          >
            {buyer.firstname} {buyer.lastname}
          </Text>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 12,
            }}
          >
            {buyer.university_name}
          </Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end', flex: 0.5 }}>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 14,
            }}
          >
            £ {parseFloat(buyer.amount).toFixed(2)} {/* Ensure the amount is a number */}
          </Text>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-regular',
              fontSize: 12,
            }}
          >
            {new Date(buyer.purchase_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      
    </View>




  ))
) : (
  <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
    No sales data available
  </Text>
)}




    </ScrollView>
    );
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 999, display: visible ? 'flex' : 'none', height: '200%' },
      ]}
    >
      <BlurView
        style={[StyleSheet.absoluteFillObject]}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 1 : 4}
        reducedTransparencyFallbackColor="transparent"
      />
      <Modal animationType="slide" visible={visible} transparent onRequestClose={handleClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>
            <View style={[styles.modelcontainer]}>
              <View>
                <BlurView
                  style={{
                    backgroundColor: 'transparent',
                    width: '210%',
                    height: 900,
                    position: 'absolute',
                    top: 130,
                    left: -300,
                    right: 0,
                    bottom: 0,
                  }}
                  blurType="dark"
                  blurAmount={Platform.OS === 'ios' ? 10 : 4}
                  reducedTransparencyFallbackColor="transparent"
                />
              </View>

              <View style={styles.modeltitleContainer1}>
                <View
                  style={{
                    width: 50,
                    height: 4,
                    borderRadius: 2,
                    alignSelf: 'center',
                    backgroundColor: '#000228',
                    marginTop: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <View style={styles.imgcontainer}>
                    <Image source={{ uri: SalesImageUrl }}style={styles.image} resizeMode="cover" />
                  </View>
                  <Text style={styles.salesTitle}>{dropDowntitle}</Text>
                </View>

                <View style={styles.cardconstinerdivider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    Total Orders: {salesData.length}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    {/* Total Earnings: ${salesData.reduce((acc, buyer) => acc + parseFloat(buyer.amount), 0).toFixed(2)} */}
                    Total Earnings: £ {totalEarnings}

                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, flexDirection: 'row' }}>
                <ScrollView
                  style={{ flex: 1, paddingHorizontal: 16 }}
                  contentContainerStyle={{ paddingBottom: 70 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text allowFontScaling={false} style={styles.filterHeadTitle}>
                    Sold To
                  </Text>
                  {renderRightContent()}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(67, 170, 234, 0.09)' : 'none',
    height: 2,
    marginTop: 10,
    marginBottom: 10,
    borderColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  initialsCircle: {
    backgroundColor: 'rgba(63, 110, 251, 0.43)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  salesTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 1,
    fontFamily: 'Urbanist-SemiBold',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  imgcontainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    paddingTop: 9,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(42, 126, 223, 0.67) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxSizing: 'border-box',
  },
  modeltitleContainer1: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(216, 229, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
        : 'rgba(0, 0, 0, 0.07)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    height: '80%',
    marginTop: 'auto',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterHeadTitle: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0.32,
    lineHeight: 19.6,
    marginTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
});

export default SalesAllDetailsDropdown;