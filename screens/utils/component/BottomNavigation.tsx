import React from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur'; 

interface Tab {
  key: string;
  icon: any; 
  activeIcon: any;
}

interface BottomNavigationProps {
  bottomNaviationSlideupAnimation: Animated.Value; 
  bubbleX: Animated.Value; 
  tabs: Tab[];
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  tabWidth: number; 
  setIsNav: (isNav: boolean) => void; 
  navigation: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  bottomNaviationSlideupAnimation,
  bubbleX,
  tabs = [],
  activeTab,
  setActiveTab,
  tabWidth = 80, 
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
    flexDirection: 'row',
    alignItems: 'center',
    height: '6.5%',
    marginBottom: Platform.OS === 'ios' ? 30 : 30,
    borderRadius: 50,
    alignSelf: 'center',
    padding: 4,
    borderWidth: 0.4,
    margin: 4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor: 'rgba(0, 23, 128, 0.49)',
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
  },
  bubble: {
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
  },
  iconWrapper: {
    height: 50, 
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
export default BottomNavigation;


