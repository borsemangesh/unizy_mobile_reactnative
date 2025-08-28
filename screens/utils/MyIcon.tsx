// components/GoogleIcon.tsx

import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type GoogleIconProps = {
  name: string;          // e.g., "rocket-launch"
  size?: number;         // default: 30
  color?: string;        // default: "#900"
  style?: object; 
  onPress?: () => void;       // additional styles
};

const GoogleIcon: React.FC<GoogleIconProps> = ({
  name,
  size = 30,
  color = '#900',
  style = {},
  onPress= () => {},
}) => {
  return <MaterialIcons name={name} size={size} color={color}  style={style} onPress={onPress} />;
};

export default GoogleIcon;