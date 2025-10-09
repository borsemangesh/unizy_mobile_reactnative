import { BlurView } from "@react-native-community/blur";
import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform, Dimensions, Touchable, TouchableOpacity } from "react-native";

type ProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating: string;
  productImage: ImageSourcePropType;
  isBookmarked: boolean; 
  onBookmarkPress?: () => void; 
  onpress?:()=>void,
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ProductCard({
  tag,
  infoTitle,
  inforTitlePrice,
  rating,
  productImage,
  onBookmarkPress ,
  isBookmarked,
  onpress,

}: ProductCardProps) {
  return (
    <TouchableOpacity  onPress={onpress} >
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={productImage} style={styles.image} resizeMode="cover" />

        {/* Tag */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>

        {/* Bookmark */}
        
        <View style={[styles.bookmark,{opacity: 0.9}]}>
                <BlurView 
                  blurType="light"
                  blurAmount={100}
                  style={StyleSheet.absoluteFillObject}
                />
          <TouchableOpacity onPress={onBookmarkPress}>
           <Image
              source={
                isBookmarked
                  ? require("../../assets/images/favourite_filled.png") // bookmarked
                  : require("../../assets/images/favourite.png") // not bookmarked
              }
              style={styles.bookmarkIcon}
            />
          </TouchableOpacity>
        </View>
        
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Text style={styles.title}>{infoTitle}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{inforTitlePrice}</Text>
          <View style={styles.ratingRow}>
            <Image
              source={require("../../assets/images/staricon.png")}
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.85,
    height: (Platform.OS == 'ios'? screenHeight * 0.35: screenHeight * 0.4),
  
    marginHorizontal: 8,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: "#ffffff79",
    overflow: "hidden",
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

  },
  imageContainer: {
    width: "100%",
    height: "80%", // image takes 65% of card height
    position: "relative",
    padding: 13,
  },
  image: {
    
    width: "100%",
    height: "100%",
    borderRadius: 25,
    backgroundColor: "#ccc",
    
  },

  tag: {
   
    position: 'absolute',
    bottom: 20,
    right: 20,  
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:'0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    height: 29,
  },

  tagText: {
  color:'rgba(0, 0, 0, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    fontSize: 11,
    fontStyle: 'normal',
    lineHeight:16,
  },
  bookmark: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 20,
    right: Platform.OS === "ios" ? 20 : 20,
      width: 44,
  height: 44, 
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
     borderRadius: 16,
  backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',

    // elevation: 1,


  shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: "#ffffff79",
    overflow: "hidden",
    borderBlockStartColor: 'rgba(255, 255, 255, 0.25)',
    borderBlockColor: 'rgba(255, 255, 255, 0.25)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(255, 255, 255, 0.25)',
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
  },
  infoRow: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    // backgroundColor:'black'
    // marginTop: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    width: "100%",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // marginTop: 4,
  },
  price: {
   fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
});
