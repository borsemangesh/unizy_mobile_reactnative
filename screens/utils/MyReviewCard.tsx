import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';

import { SquircleView } from 'react-native-figma-squircle';
 

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


type MyReviewCardProps = {
  tag?: string;
  infoTitle: string;
  inforTitlePrice: number;
  rating: string; // e.g., "3"
  reviewText?: string;
  productImage: ImageSourcePropType;
  topRightText?: string;
  isfeature?: boolean;
  navigation?: any;
  shareid: number;
  date:string
  profileshowinview:boolean 
  createdby:CreatedBy,
};

const MyReviewCard: React.FC<MyReviewCardProps> = ({
  infoTitle,
  inforTitlePrice,
  rating = '0',
  reviewText = '',
  productImage,
  navigation,
  shareid,
  date,
  profileshowinview,
  createdby,
}) => {
  const fullStar = require('../../assets/images/starfill.png'); 
  const emptyStar = require('../../assets/images/starempty.png'); 

    const getInitials = (firstname?: string, lastname?: string) => {
      if (!firstname && !lastname) return '';
      return `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase();
    };
  
     const renderProfileSection = () => {
      if (profileshowinview) {
        if (createdby?.profile) {
          return (
             <SquircleView
              style={styles.image}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 14,
                fillColor: 'rgba(255, 255, 255, 0.08)',
              }}>
            <Image
              source={{ uri: createdby.profile }}
              style={styles.image}
              resizeMode="cover"
            />
            </SquircleView>
          );
        } else {
          return (

             <SquircleView
              style={styles.initialsCircle}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 14,
                fillColor: '#8390D4',
              }}>
            <View style={styles.initialsCircle}>
             
              <Text allowFontScaling={false} style={styles.initialsText}>
                {getInitials(createdby?.firstname, createdby?.lastname)}
              </Text>
             
            </View>
             </SquircleView>
          );
        }
      } else {
        return (
          <Image source={productImage} style={styles.image} resizeMode="cover" />
        );
      }
    };
  
  return (

     <TouchableOpacity
      activeOpacity={0.8}
    >
    
    <SquircleView
      style={styles.card}
      squircleParams={{
        cornerSmoothing: 1,
        cornerRadius: 18,
        fillColor: 'rgba(255, 255, 255, 0.08)',
      }}
 
    >
   
     <View style={styles.row}>
      
      {renderProfileSection()}
      <View style={styles.details}>
        <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
        <Text allowFontScaling={false} style={styles.price}>£{inforTitlePrice}</Text>
        <Text allowFontScaling={false} style={styles.date}>{date}
        </Text>
      </View>
    </View>

   <View style={styles.dashedLine} />
  
  <View style={styles.dashedLine1} />

  <View style={styles.bottomContent}>
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Image
          key={i}
          source={i < Number(rating) ? fullStar : emptyStar}
          style={styles.star}
        />
      ))}
    </View>

    {reviewText ? (
      <Text allowFontScaling={false} style={styles.reviewText} numberOfLines={3}>
        {reviewText}
      </Text>
    ) : null}
  </View>
      </SquircleView>

    </TouchableOpacity>
  );
};

export default MyReviewCard;

const styles = StyleSheet.create({

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

bottomContent: {
 // marginTop:2,
},
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 12,
    marginVertical: 8,
    //borderWidth: 1,
    //borderColor: 'rgba(255,255,255,0.1)',
    overflow:'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom:6
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow:'hidden'
  },
    initialsCircle:{
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 14,
    //marginRight: 12,
    overflow:'hidden'
  },
  initialsText:{
   color: '#fff',
  fontSize: 30,
  fontWeight:600,
  textAlign: 'center',
  fontFamily: 'Urbanist-SemiBold',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FFFFFFE0',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  date: {
    fontSize: 12,
    color: '#FFFFFFE0',
    marginTop: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight:500,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop:6
   
  },
  star: {
    width: 16, // adjust to match your design
    height: 16,
    marginRight: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#FFFFFFE0',
    marginTop: 8,
    fontFamily: 'Urbanist-Regular',
    fontWeight:400,
    lineHeight: 18,
  },
});