import { BlurView } from '@react-native-community/blur';
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
// import { BlurView } from "@react-native-community/blur";
// import LinearGradient from "react-native-linear-gradient";

// const ProductIcon = require('../../../assets/images/ProductIcon.png');
const producticon = require('../../assets/images/producticon.png');

export default function ProductCard() {
  return (
    // <LinearGradient
    //   colors={["#1E3C72", "#2A5298"]}
    //   start={{ x: 0, y: 0 }}
    //   end={{ x: 1, y: 1 }}
    //   style={styles.card}
    // >
    <View style={{ 
        paddingTop: 10,
        paddingLeft: 12,
        
    }}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: "https://picsum.photos/600/400" }}
          style={styles.image}
        />

        {/* Bookmark (Glass) */}
       {/* <BlurView style={styles.bookmark} blurType="light" blurAmount={10}> 
         
        </BlurView>  */}
        {/* <BlurView style={styles.bookmark} blurType="light" blurAmount={10}> */}
             <Image source={producticon} style={{ width: 24, height: 24 }} />
        {/* </BlurView> */}

        {/* Label (Glass) */}
        {/* <BlurView style={styles.tag} blurType="light" blurAmount={10}> */}
          <Text style={styles.tagText}>University of Warwick</Text>
        {/* </BlurView> */}
      </View>

      {/* Info Section */}
      <View style={styles.infoRow}>
        <View>
          <Text style={styles.title}>Quadcopter (Drone)</Text>
          <Text style={styles.price}>$10.00</Text>
        </View>

        {/* Rating */}
        <View style={styles.rating}>
          {/* <Ionicons name="star" size={16} color="#fff" /> */}
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>
      </View>
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    margin: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bookmark: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 20,
    padding: 6,
    overflow: "hidden",
  },
  tag: {
    position: "absolute",
    bottom: 10,
    left: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 4,
  },
});