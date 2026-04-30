import { ImageBackground } from "react-native";
import { ReactNode } from "react";

import BACK_ICON from '../../../assets/images/backimg.png';


interface BackgroundWrapperProps {
  children: ReactNode;
}
const BackgroundWrapper = ({ children }: BackgroundWrapperProps) => {
  return (
    <ImageBackground
      source={BACK_ICON}
      style={{ flex: 1,width: '100%',
    height: '100%', }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

export default BackgroundWrapper;