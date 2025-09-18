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
} from 'react-native';

// assets
const bgImage = require('../../../assets/images/bganimationscreen.png');
const profileImg = require('../../../assets/images/user.jpg'); // your avatar image
const uploadIcon = require('../../../assets/images/upload.png'); // upload icon
const fileIcon = require('../../../assets/images/file.png'); // file icon
const deleteIcon = require('../../../assets/images/delete.png'); // delete/trash icon

const AddScreen: React.FC = () => {
  const [featured, setFeatured] = useState(false);

  const uploadedImages = [
    { id: 1, name: 'Image101' },
    { id: 2, name: 'Image202' },
    { id: 3, name: 'Image303' },
  ];

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn}>
              <Text style={styles.backArrow}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.unizyText}>List Product</Text>
            <View style={{ width: 30 }} /> 
          </View>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* User Info */}
          <View style={styles.userRow}>
            <Image source={profileImg} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Alan Walker</Text>
              <Text style={styles.userSub}>University of Warwick, Coventry</Text>
            </View>
            <Text style={styles.dateText}>10-01-2025</Text>
          </View>

          <View>
          <TouchableOpacity style={styles.uploadButton}>
            <Image source={uploadIcon} style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Upload Images</Text>
          </TouchableOpacity>

          <View style ={styles.filecard} >
          {uploadedImages.map((file) => (
            <View key={file.id} style={styles.fileRow}>
              <Image source={fileIcon} style={styles.fileIcon} />
              <Text style={styles.fileName}>{file.name}</Text>
              <TouchableOpacity style={styles.deleteBtn}>
                <Image source={deleteIcon} style={styles.deleteIcon} />
              </TouchableOpacity>
            </View>
          ))}
          </View>

          <View style={styles.login_container}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="Product Name"
            placeholderTextColor="#ccc"
            value="Quadcopter (Drone)"
          />
          </View>

    <View style={styles.login_container}>
          <TextInput
            style={[styles.personalEmailID_TextInput, { height: 80 }]}
            placeholder="Enter Description"
            placeholderTextColor="#ccc"
            multiline
          />
      </View>
          
          <View style={styles.login_container}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="£ Enter Price"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
          />
          </View>

          {/* Condition */}
          <View style={styles.login_container}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="-Select Condition-"
            placeholderTextColor="#ccc"
          />
          </View>

          {/* Category */}
          <View style={styles.login_container}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="-Select Category-"
            placeholderTextColor="#ccc"
          />
          </View>

          {/* Selected Categories */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTag}>Category 1 ✕</Text>
            <Text style={styles.categoryTag}>Category 2 ✕</Text>
          </View>
          </View>

          {/* Featured Listing */}
          <View style={styles.featuredRow}>
            <Text style={styles.featuredLabel}>List as Featured Listing</Text>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: '#555', true: '#3b82f6' }}
            />
          </View>

          <Text style={styles.importantText}>
            Important: For Featured listings, $1 is deducted from your payout.
          </Text>

          {/* Preview Button */}
          {/* <TouchableOpacity style={styles.previewBtn}>
            <Text style={styles.previewText}>Preview Details</Text>
          </TouchableOpacity> */}

           <TouchableOpacity style={styles.previewBtn}>
            <Text style={styles.previewText}>Preview Details </Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  background: { 
    flex: 1,
    width: '100%',
    height: '100%' },
  fullScreenContainer: {
     flex: 1 
    },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  backArrow: { 
    fontSize: 26, 
    color: '#fff' 
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding:16,
    borderRadius:26,
     backgroundColor: 'rgba(255, 255, 255, 0.06)',

  },
  avatar: { 
    width: 50,
    height: 50,
    borderRadius: 25, 
    marginRight: 12 
    },
  userName: { 
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold'
   },
  userSub: { 
    color: '#ccc',
     fontSize: 12
     },
  dateText: { 
    color: '#ccc',
     fontSize: 12 
    },
  uploadButton: {
    height: 40,
    gap: 10,
    marginTop:10,
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
  },
  uploadIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 8, 
    resizeMode:'contain'
   },
  uploadText: { 
    color: '#fff',
     fontSize: 14 },

    filecard:{
      marginTop:20,
      borderRadius:12,
     backgroundColor: 'rgba(255, 255, 255, 0.06)'
     },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    
  },
  fileIcon: {
      width: 28, 
    height: 28,
    resizeMode:'contain',
      marginRight: 8 
    },
  fileName: {
     color: '#fff',
      flex: 1 },
  deleteBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { 
    width: 28, 
    height: 28,
    resizeMode:'contain'
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
    marginBottom: 12,
    marginTop:12,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredLabel: {
     color: '#fff', 
     fontSize: 14 
    },
  importantText: { 
    color: '#ccc',
     fontSize: 12,
      marginBottom: 16 
    },
 

    previewBtn: {
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
    marginTop: 10,
    
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },

  login_container: {
    display: 'flex',
    width: '100%',
    height: 40,
    gap: 10,
    marginTop:10,
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
  },
  personalEmailID_TextInput: {
    width: '93%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color:'#fff'
    
  },
});
