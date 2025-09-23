import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import ToggleButton from '../../utils/component/ToggleButton';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../utils/component/Header';

// assets
const bgImage = require('../../../assets/images/bganimationscreen.png');
const profileImg = require('../../../assets/images/user.jpg'); // your avatar image
const uploadIcon = require('../../../assets/images/upload.png'); // upload icon
const fileIcon = require('../../../assets/images/file.png'); // file icon
const deleteIcon = require('../../../assets/images/delete.png'); // delete/trash icon
type AddScreenContentProps = {
  navigation: any;
};

const AddScreen = ({ navigation }: AddScreenContentProps) => {
  const [featured, setFeatured] = useState(false);

  const uploadedImages = [
    { id: 1, name: 'Image101' },
    { id: 2, name: 'Image202' },
    { id: 3, name: 'Image303' },
  ];

  const BGAnimationScreen = require('../../../assets/images/bganimationscreen.png');

  return (
    <ImageBackground
      source={BGAnimationScreen}
      resizeMode="cover"
      style={{
        width: '100%',
        height: '100%',
        // alignItems: 'center',
        flex: 1,
      }}
    >
      <View style={{
        padding: 16,
      }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                console.log('Back button click');
                navigation.replace('Dashboard');
              }}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>List Product</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
        >
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={{ width: '20%' }}>
              <Image source={profileImg} style={styles.avatar} />
            </View>
            <View style={{ width: '80%' }}>
              <Text style={styles.userName}>Alan Walker</Text>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  display: 'flex',
                  alignItems: 'stretch',
                }}
              >
                <Text style={styles.userSub}>University of Warwick,</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.userSub}>Coventry</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/calendar_icon.png')}
                      style={{ height: 20, width: 20 }}
                    />
                    <Text style={styles.userSub}>10-01-2025</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.productdetails}>
            {/* <View style={{}}> */}
            <Text style={styles.productdetailstext}>Product Details</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Image source={uploadIcon} style={styles.uploadIcon} />
              <Text style={styles.uploadText}>Upload Images</Text>
            </TouchableOpacity>

            <View style={styles.imagelistcard}>
              {uploadedImages.map(file => (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '90%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        padding: 10,
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{ flexDirection: 'row', gap: -50, width: 30 }}
                      >
                        <Image
                          source={require('../../../assets/images/threedots.png')}
                          style={styles.threedots}
                        />
                        <Image
                          source={require('../../../assets/images/threedots.png')}
                          style={[styles.threedots, { paddingLeft: 10 }]}
                        />
                      </View>
                      <Image
                        source={fileIcon}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={[styles.fileName]}>{file.name}</Text>
                    </View>

                    <Image source={deleteIcon} style={styles.deleteIcon} />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.productTextView}>
              <Text style={styles.textstyle}>Product Name</Text>
              <TextInput
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                ]}
                placeholder="Product Name"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                value="Quadcopter (Drone)"
              />
            </View>

            <View style={styles.productTextView}>
              <Text style={styles.textstyle}>Product Description</Text>
              <TextInput
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                ]}
                placeholder="Enter Description"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                multiline
              />
            </View>

            <View style={styles.productTextView}>
              <Text style={styles.textstyle}>Product Price</Text>
              <TextInput
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                ]}
                placeholder="£ Enter Price"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                keyboardType="numeric"
              />
            </View>
            {/* Condition */}
            <View style={styles.productTextView}>
              <Text style={styles.textstyle}>Product Condition</Text>
              <TextInput
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                ]}
                placeholder="-Select Condition-"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
              />
            </View>

            {/* Category */}
            <View style={styles.productTextView}>
              <Text style={styles.textstyle}>
                Product Category (Select one or more)
              </Text>
              <TextInput
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                ]}
                placeholder="-Select Category-"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
              />
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryTag}>Category 1 ✕</Text>
              <Text style={styles.categoryTag}>Category 2 ✕</Text>
            </View>
          </View>

          {/* Featured Listing */}
          <View style={[styles.productdetails, { padding: 16 }]}>
            <View style={[styles.featuredRow]}>
              <Text style={styles.featuredLabel}>List as Featured Listing</Text>
              <ToggleButton />
              {/* <Switch
value={featured}
onValueChange={setFeatured}
trackColor={{ false: '#555', true: '#3b82f6' }}
/> */}
            </View>

            <Text style={styles.importantText}>
              Important: For Featured listings, $1 is deducted from your payout.
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => {
            navigation.navigate('PreviewThumbnail');
          }}
        >
          <Text style={styles.previewText}>Preview Details </Text>
        </TouchableOpacity>
      </View>





    </ImageBackground>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  headerContainer: {
    height: 80,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    justifyContent: 'center',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // top: 0,
    // bottom: 0,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',

  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    height: 70,
    paddingStart: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 30,
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
    top: -20,
    left: 0,
    right: 0,

    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: '#fff',
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  scrollContainer: {

    paddingBottom: 80,
    paddingTop: 90,

  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  productdetails: {
    // padding: 16,
    // borderRadius: 24,
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',

    // // gap: 10,
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dateText: {
    color: '#ccc',
    fontSize: 12,
  },
  uploadButton: {
    height: 40,
    gap: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.9,
    borderColor: '#ffffff33',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  imagelistcard: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.32)',
    borderRadius: 7,
    borderWidth: 0.4,
    borderColor: '#ffffff33',
    marginTop: 10,
  },

  productdetailstext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.36,
  },

  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  uploadText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontSize: 14,
  },

  filecard: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  fileIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 8,
  },
  fileName: {
    // color: '#fff',
    // flex: 1,
    // paddingStart: 5,

    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: -0.32,
    lineHeight: 24,
    paddingStart: 5,

    //     color: rgba(255, 255, 255, 0.88);

    // font-feature-settings: 'liga' off, 'clig' off;
    // font-family: Urbanist;
    // font-size: 15px;
    // font-style: normal;
    // font-weight: 500;
    // line-height: normal;
  },
  deleteBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  threedots: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  textstyle: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
    lineHeight: 16,
    fontSize: 14,
  },
  productTextView: {
    gap: 4,
    marginTop: 10,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginBottom: 12,
    marginTop: 9,
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    marginRight: 8,
    marginBottom: 8,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredLabel: {
    color: '#fff',
    fontSize: 14,
  },
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 16,
  },

  previewBtn: {
    display: 'flex',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',

    position: 'absolute',
    bottom: 10,
  },
  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
  },

  login_container: {
    display: 'flex',
    height: 40,
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    paddingLeft: 10,
  },
  personalEmailID_TextInput: {
    width: '100%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
  },
});
