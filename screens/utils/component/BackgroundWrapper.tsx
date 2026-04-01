import { ImageBackground } from "react-native";
import { IMAGE_URLS } from "../Style";
import { ReactNode } from "react";

interface BackgroundWrapperProps {
  children: ReactNode;
}
const BackgroundWrapper = ({ children }: BackgroundWrapperProps) => {
  return (
    <ImageBackground
      source={IMAGE_URLS.BACK_ICON}
      style={{ flex: 1,width: '100%',
    height: '100%', }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

export default BackgroundWrapper;