// // import {
// //   Animated,
// //   Image,
// //   ImageBackground,
// //   Platform,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from 'react-native';
// // import ProductCard from '../../utils/ProductCard';

// // type PreviewThumbnailProps = {
// //   navigation: any;
// // };

// // const PreviewThumbnail = ({ navigation }: PreviewThumbnailProps) => {
// //   return (
// //     <ImageBackground
// //       source={require('../../../assets/images/bganimationscreen.png')}
// //       style={{ width: '100%', height: '100%' }}
// //       resizeMode="cover"
// //     >
// //       <View
// //         style={{
// //           paddingTop: Platform.OS === 'ios' ? 80 : 30,
// //           paddingLeft: 16,
// //           paddingRight: 16,
// //         }}
// //       >
// //         <TouchableOpacity
// //           style={{ zIndex: 1 }}
// //           onPress={() => {
// //             navigation.navigate('AddScreen');
// //           }}
// //         >
// //           <View style={styles.backIconRow}>
// //             <Image
// //               source={require('../../../assets/images/back.png')}
// //               style={styles.h24_w24}
// //             />
// //           </View>
// //         </TouchableOpacity>

// //         <Text style={styles.previewThumbnail}>Preview Thumbnail</Text>

// //         <View style={{ height: '100%' }}>
// //           <View style={styles.productCarddisplay}>
// //             <ProductCard
// //               tag="University of Warwick"
// //               infoTitle="Quadcopter (Drone)"
// //               inforTitlePrice="$10.00"
// //               rating="4.5"
// //               productImage={require('../../../assets/images/drone.png')}
// //             />
// //           </View>
// //           <View style={styles.importantNotice}>
// //             <View style={styles.h24_w24}>
// //               <Image
// //                 source={require('../../../assets/images/info_icon.png')}
// //                 style={styles.h24_w24}
// //               />
// //             </View>
// //             <View style={{ flexDirection: 'column', marginLeft: 8 }}>
// //               <Text style={styles.infoText}>Important:</Text>
// //               <Text style={styles.note}>
// //                 Price shown includes a 10% platform fee.
// //               </Text>
// //             </View>
// //           </View>
// //           <TouchableOpacity
// //             style={styles.nextButton}
// //             onPress={() => {
// //               navigation.replace('PreviewDetailed');
// //             }}
// //           >
// //             <Text style={styles.nextText}>Next</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     </ImageBackground>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   h24_w24: {
// //     width: 24,
// //     height: 24,
// //   },
// //   importantNotice: {
// //     flexDirection: 'row',
// //     height: 'auto',
// //     backgroundColor:
// //       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
// //     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
// //     borderRadius: 8,
// //     padding: 8,
// //   },
// //   productCarddisplay: {
// //     display: 'flex',
// //     height: '80%',
// //     alignContent: 'center',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   backIconRow: {
// //     padding: 12,
// //     borderRadius: 40,
// //     backgroundColor:
// //       'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
// //     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
// //     borderWidth: 0.4,
// //     borderColor: '#ffffff2c',
// //     height: 48,
// //     width: 48,
// //     position: 'absolute',
// //     top: -10,
// //     left: 0,
// //     right: 0,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   previewThumbnail: {
// //     color: '#FFF',
// //     textAlign: 'center',
// //     fontFamily: 'Urbanist-SemiBold',
// //     fontSize: 20,
// //     fontWeight: '600',
// //     letterSpacing: -0.4,
// //   },
// //   infoContainer: {
// //     flexDirection: 'row',
// //     marginTop: 8,
// //     paddingLeft: 6,
// //     paddingRight: 6,
// //   },
// //   infoText: {
// //     color: 'rgba(255, 255, 255, 0.64)',
// //     fontFamily: 'Urbanist-Medium',
// //     fontWeight: '600',
// //     fontStyle: 'normal',
// //     fontSize: 14,
// //   },
// //   note: {
// //     color: 'rgba(255, 255, 255, 0.64)',
// //     fontFamily: 'Urbanist-Medium',
// //     fontSize: 14,
// //   },
// //   nextButton: {
// //     display: 'flex',
// //     width: '100%',
// //     height: 48,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     gap: 4,
// //     borderRadius: 100,
// //     paddingTop: 6,
// //     paddingBottom: 12,
// //     backgroundColor: 'rgba(255, 255, 255, 0.56)',
// //     marginTop: 10,

// //     borderWidth: 0.5,
// //     borderColor: '#ffffff2c',
// //   },
// //   nextText: {
// //     color: '#002050',
// //     textAlign: 'center',
// //     fontFamily: 'Urbanist-Medium',
// //     fontSize: 17,
// //     fontWeight: 500,
// //     letterSpacing: 1,
// //     width: '100%',
// //   },
// // });

// // export default PreviewThumbnail;
// import {
//   Animated,
//   Image,
//   ImageBackground,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import ProductCard from '../../utils/ProductCard';
// import { showToast } from '../../utils/toast';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect, useState } from 'react';

// type PreviewThumbnailProps = {
//   navigation: any;
// };

// const PreviewThumbnail = ({ navigation }: PreviewThumbnailProps) => {

//   const [storedForm, setStoredForm] = useState<any | null>(null);

// useEffect(() => {
//   const fetchStoredData = async () => {
//     try {
//       const storedData = await AsyncStorage.getItem('formData');
//       if (storedData) {
//         const parsedData = JSON.parse(storedData);
//         console.log('Stored Form Data:', parsedData);
//         setStoredForm(parsedData);
//       } else {
//         console.log('No form data found');
//       }
//     } catch (error) {
//       console.log('Error reading form data: ', error);
//     }
//   };

//   fetchStoredData();
// }, []);


 

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bganimationscreen.png')}
//       style={{ width: '100%', height: '100%' }}
//       resizeMode="cover"
//     >
//       <View
//         style={{
//           paddingTop: Platform.OS === 'ios' ? 80 : 30,
//           paddingLeft: 16,
//           paddingRight: 16,
//         }}
//       >
//         <TouchableOpacity
//           style={{ zIndex: 1 }}
//           onPress={() => {
//             navigation.navigate('AddScreen');
//           }}
//         >
//           <View style={styles.backIconRow}>
//             <Image
//               source={require('../../../assets/images/back.png')}
//               style={styles.h24_w24}
//             />
//           </View>
//         </TouchableOpacity>

//         <Text style={styles.previewThumbnail}>Preview Thumbnail</Text>

//         <View style={{ height: '100%' }}>
//           {/* <View style={styles.productCarddisplay}>
//             <ProductCard
//               tag="University of Warwick"
//               infoTitle="Quadcopter (Drone)"
//               inforTitlePrice="$10.00"
//               rating="4.5"
//               productImage={require('../../../assets/images/drone.png')}
//             />
//           </View> */}

//           <View style={styles.productCarddisplay}>
//           {storedForm ? (
//             <ProductCard
//               tag="University of Warwick" // static
//               infoTitle={storedForm[7] || 'No Title'} // key 7
//               inforTitlePrice={`$${storedForm[8] || '0'}`} // key 8
//               rating={storedForm[12] || '4.5'} // key 12
//               productImage={
//                 storedForm[6] && storedForm[6][0]?.uri
//                   ? { uri: storedForm[6][0].uri } // key 6 is array of images
//                   : require('../../../assets/images/drone.png')
//               }
//             />
//           ) : (
//             <Text style={{ color: '#fff', textAlign: 'center' }}>Loading...</Text>
//           )}
//         </View>
//           <View style={styles.importantNotice}>
//             <View style={styles.h24_w24}>
//               <Image
//                 source={require('../../../assets/images/info_icon.png')}
//                 style={styles.h24_w24}
//               />
//             </View>
//             <View style={{ flexDirection: 'column', marginLeft: 8 }}>
//               <Text style={styles.infoText}>Important:</Text>
//               <Text style={styles.note}>
//                 Price shown includes a 10% platform fee.
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             style={styles.nextButton}
//             onPress={() => {
//               navigation.navigate('PreviewDetailed');
//             }}
//             // onPress={async () => {
//             //   await printStoredFormData();
//             // }}
//                     >
//             <Text style={styles.nextText}>Next</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   h24_w24: {
//     width: 24,
//     height: 24,
//   },
//   importantNotice: {
//     flexDirection: 'row',
//     height: 'auto',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
//     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
//     borderRadius: 8,
//     padding: 8,
//   },
//   productCarddisplay: {
//     display: 'flex',
//     height: '80%',
//     alignContent: 'center',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIconRow: {
//     padding: 12,
//     borderRadius: 40,
//     backgroundColor:
//       'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
//     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
//     borderWidth: 0.4,
//     borderColor: '#ffffff2c',
//     height: 48,
//     width: 48,
//     position: 'absolute',
//     top: -10,
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   previewThumbnail: {
//     color: '#FFF',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 20,
//     fontWeight: '600',
//     letterSpacing: -0.4,
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     marginTop: 8,
//     paddingLeft: 6,
//     paddingRight: 6,
//   },
//   infoText: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-Medium',
//     fontWeight: '600',
//     fontStyle: 'normal',
//     fontSize: 14,
//   },
//   note: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 14,
//   },
//   nextButton: {
//     display: 'flex',
//     width: '100%',
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 4,
//     borderRadius: 100,
//     paddingTop: 6,
//     paddingBottom: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.56)',
//     marginTop: 10,

//     borderWidth: 0.5,
//     borderColor: '#ffffff2c',
//   },
//   nextText: {
//     color: '#002050',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: 500,
//     letterSpacing: 1,
//     width: '100%',
//   },
// });

// export default PreviewThumbnail;

import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductCard from '../../utils/ProductCard';

import { showToast } from '../../utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import NewProductCard from '../../utils/NewProductCard';

type PreviewThumbnailProps = {
  navigation: any;
};

const PreviewThumbnail = ({ navigation }: PreviewThumbnailProps) => {

  const [storedForm, setStoredForm] = useState<any | null>(null);

useEffect(() => {
  const fetchStoredData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('formData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Stored Form Data:', parsedData);
        setStoredForm(parsedData);
      } else {
        console.log('No form data found');
      }
    } catch (error) {
      console.log('Error reading form data: ', error);
    }
  };

  fetchStoredData();
}, []);


type FormEntry = {
  value: any;
  alias_name: string | null;
};

const getValueByAlias = (
  formData: Record<string, FormEntry> | null,
  alias: string
): any => {
  if (!formData) return null;

  const entry = Object.values(formData).find(
    (item) => item.alias_name === alias
  ) as FormEntry | undefined;

  return entry ? entry.value : null;
};

const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
const priceValue = getValueByAlias(storedForm, 'price') || '0';
const imageArray = storedForm?.[6]?.value || [];


  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 80 : 30,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <TouchableOpacity
          style={{ zIndex: 1 }}
          onPress={() => {
            navigation.navigate('AddScreen',{
              productId:1,
              name: "name",
            });
          }}
        >
          <View style={styles.backIconRow}>
            <Image
              source={require('../../../assets/images/back.png')}
              style={styles.h24_w24}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.previewThumbnail}>Preview Thumbnail</Text>

        <View style={{ height: '100%' }}>
         
         
        
     <View style={styles.productCarddisplay}>
        {storedForm ? (
          <>
            {storedForm[13]?.value === 'true' ? ( // ✅ access .value
              // If true → render ProductCard
              <ProductCard
                tag="University of Warwick"
                infoTitle={titleValue} // keep as before (from alias)
                inforTitlePrice={`£${priceValue}`} // from alias
                rating={storedForm[12]?.value || '4.5'} // ✅ access .value
                productImage={
                  imageArray.length > 0
                    ? { uri: imageArray[0].uri }
                    : require('../../../assets/images/drone.png')
                }
              />
            ) : (
              // If false → render NewProductCard
              <NewProductCard
                tag="University of Warwick"
                infoTitle={titleValue} // from alias
                inforTitlePrice={`£${priceValue}`} // from alias
                rating={storedForm[12]?.value || '4.5'} // ✅ access .value
                productImage={
                  imageArray.length > 0
                    ? { uri: imageArray[0].uri }
                    : require('../../../assets/images/drone.png')
                }
              />
            )}
          </>
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>Loading...</Text>
        )}
      </View>





          {/* <View style={styles.importantNotice}>
            <View style={styles.h24_w24}>
              <Image
                source={require('../../../assets/images/info_icon.png')}
                style={styles.h24_w24}
              />
            </View>
            <View style={{ flexDirection: 'column', marginLeft: 8 }}>
              <Text style={styles.infoText}>Important:</Text>
              <Text style={styles.note}>
                Price shown includes a 10% platform fee.
              </Text>
            </View>
          </View> */}


           <View
                  style={styles.textbg}
                >
                  <Image
                    source={require('../../../assets/images/info_icon.png')} 
                    style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
                  />
          
                  {/* Texts */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.importantText1}>Important:</Text>
                    <Text style={styles.importantText}>
                      Price shown includes a 10% platform fee.
                    </Text>
                  </View>
                </View>


          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              navigation.navigate('PreviewDetailed');
            }}
            >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

 textbg:{
 flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor:
            'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
          boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
          padding: 6,
          borderWidth:0.5,
            borderEndEndRadius: 12,
            borderStartEndRadius: 12,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderBottomStartRadius: 12,
            borderBlockStartColor: '#ffffff31',
            borderBlockColor: '#ffffff31',
            borderTopColor: '#ffffff31',
            borderBottomColor: '#ffffff31',
            borderLeftColor: '#ffffff31',
            borderRightColor: '#ffffff31',
            marginBottom:2
            
  },
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  importantText1: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
  },

  h24_w24: {
    width: 24,
    height: 24,
  },
  importantNotice: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  productCarddisplay: {
    display: 'flex',
    height: '78%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingLeft: 6,
    paddingRight: 6,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontWeight: '600',
    fontStyle: 'normal',
    fontSize: 14,
  },
  note: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
  },
  nextButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    marginTop:10,
  },
  nextText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
});

export default PreviewThumbnail;
