import { Platform, StyleSheet } from "react-native";



const COMMONSTYLE = StyleSheet.create({
  MEDIUM: {
    fontFamily: 'Urbanist-Medium',
  },
  SEMIBOLD: {
    fontFamily: 'Urbanist-SemiBold',
  },

  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
  },

  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: '#ffffff11',
    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
});

export default COMMONSTYLE