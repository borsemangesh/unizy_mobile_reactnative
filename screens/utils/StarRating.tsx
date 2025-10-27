import React from 'react';
import { View, Image, Text } from 'react-native';

type StarRatingProps = {
  rating: number; // e.g., 4.5
  maxStars?: number; // default 5
  starSize?: number; // default 16
  style?: object;
};

const starFull = require('../../assets/images/starfill.png');
const starHalf = require('../../assets/images/starhalf.png');
const starEmpty = require('../../assets/images/starempty.png');

const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 5, starSize = 16, style }) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Image key={i} source={starFull} style={{ width: starSize, height: starSize, marginRight: 2 }} />);
    } else if (i - rating <= 0.5) {
      stars.push(<Image key={i} source={starHalf} style={{ width: starSize, height: starSize, marginRight: 2 }} />);
    } else {
      stars.push(<Image key={i} source={starEmpty} style={{ width: starSize, height: starSize, marginRight: 2 }} />);
    }
  }
return (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
    {stars.map((star, index) => (
      <View key={index} style={{ marginRight: index !== stars.length - 1 ? 4 : 0 }}>
        {star}
      </View>
    ))}
  </View>
);
};

export default StarRating;