import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

const starFull = require('../../assets/images/starfill.png');
const starHalf = require('../../assets/images/starhalf.png');
const starEmpty = require('../../assets/images/starempty.png');

type AddRatingProps = {
  rating?: number;          
  maxStars?: number;         
  starSize?: number;        
  style?: object;
  onChange?: (rating: number) => void; 
};

const AddRating: React.FC<AddRatingProps> = ({
  rating: initialRating = 0,
  maxStars = 5,
  starSize = 24,
  style,
  onChange,
}) => {
  const [rating, setRating] = useState(initialRating);

  const handlePress = (index: number) => {
    const newRating = rating === index + 1 ? 0 : index + 1;
    setRating(newRating);
    if (onChange) onChange(newRating);
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {Array.from({ length: maxStars }).map((_, index) => (
        <TouchableOpacity key={index} onPress={() => handlePress(index)} activeOpacity={0.7}>
          <Image
            source={index < rating ? starFull : starEmpty}
            style={{
              width: starSize,
              height: starSize,
              marginRight: index !== maxStars - 1 ? 6 : 0,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AddRating;
