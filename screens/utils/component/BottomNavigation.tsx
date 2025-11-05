import React from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur'; // Make sure you install @react-native-community/blur

interface Tab {
  key: string;
  icon: any; // You can replace 'any' with a more specific type like 'ImageSourcePropType' if you want
  activeIcon: any; // Same as above
}

interface BottomNavigationProps {
  bottomNaviationSlideupAnimation: Animated.Value; // The animated value for the slide-up animation
  bubbleX: Animated.Value; // The animated value for the bubble position
  tabs: Tab[]; // An array of tab objects
  activeTab: string; // The current active tab
  setActiveTab: (tab: string) => void; // Function to set the active tab
  tabWidth: number; // Width of each tab
  setIsNav: (isNav: boolean) => void; // Function to set the visibility of the nav bar
  navigation: any; // You can replace this with the proper type from React Navigation
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  bottomNaviationSlideupAnimation,
  bubbleX,
  tabs = [], // Default empty array if tabs is not passed
  activeTab,
  setActiveTab,
  tabWidth = 80, // Default width if not passed
  setIsNav,
  navigation,
}) => {
  return (
    <>
      <Animated.View
        style={[
          styles.bottomTabContainer,
          { position: 'absolute', bottom: 0 },
          { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 25, backgroundColor: 'transparent' },
          ]}
        >
          <BlurView
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: 25, backgroundColor: 'transparent' },
            ]}
            blurType="light"
            blurAmount={1.3}
            reducedTransparencyFallbackColor="rgba(15, 21 ,131,0.8)"
            overlayColor="rgba(15, 21 ,131,0.8)"
          >
            <View
              style={{
                opacity: 0.4,
                backgroundColor: 'rgba(0, 3, 65, 0.98)',
                width: '100%',
                height: '100%',
              }}
            ></View>
          </BlurView>
        </View>

        <View style={{ height: 48 }}>
          <Animated.View
            style={[
              styles.bubble,
              {
                width: tabWidth - 6,
                transform: [{ translateX: bubbleX }],
              },
            ]}
          />
        </View>

        {tabs.map(({ key, icon, activeIcon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabItem, { width: tabWidth }]}
            onPress={() => {
              setIsNav(false);
              navigation.setParams({ isNavigate: false });
              setActiveTab(key);
            }}
          >
            <View style={styles.iconWrapper}>
              <Image
                source={activeTab === key ? activeIcon : icon}
                style={styles.tabIcon}
              />
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  bottomTabContainer: {
    //   height: 80,
    //   justifyContent: 'flex-end',
    //   flexDirection: 'row',
    //   position: 'absolute'
    flexDirection: 'row',
    alignItems: 'center',
    height: '6.5%',
    // width: '95%',
    //marginBottom: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 30,
    borderRadius: 50,
    alignSelf: 'center',
    // position: 'relative',
    padding: 4,
    borderWidth: 0.4,
    //padding: 12,
    margin: 4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor: 'rgba(0, 23, 128, 0.49)',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    zIndex: 100,
    // position: 'absolute',
    // bottom: 0,
  },
  bubble: {
    //height: 48,

    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',

    left: 3,
    right: 3,
    borderWidth: 0.5,
    borderColor: '#ffffff2e',

    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,

    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
  },
  tabItem: {
    //   justifyContent: 'center',
    //   alignItems: 'center',
  },
  iconWrapper: {
    height: 50, //
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 28,
    height: 28,
    //tintColor: '#fff',
    resizeMode: 'contain',
  },
});
export default BottomNavigation;


