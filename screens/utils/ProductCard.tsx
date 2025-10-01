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
  onpress
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
        
        <View style={styles.bookmark}>
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
    width: screenWidth * 0.75,
    height: screenHeight * 0.4,
  
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
    padding:10,
  },
  image: {
    
    width: "100%",
    height: "100%",
    borderRadius: 25,
    backgroundColor: "#ccc",
    
  },
  tag: {
    position: "absolute",

    bottom: Platform.OS === "ios" ? 20 : 20,
    right: Platform.OS === "ios" ? 20 : 20,

    backgroundColor: "rgba(152, 152, 152, 0.21)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  bookmark: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 20,
    right: Platform.OS === "ios" ? 20 : 20,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    zIndex: 2,
    elevation: 5,
  },
  bookmarkIcon: {
    width: 20,
    height: 20,
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
    fontWeight: "500",
    color: "#fff",
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
