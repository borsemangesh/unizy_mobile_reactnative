import { Platform, StyleSheet } from "react-native";

const COMMONSTYLE = StyleSheet.create({
  FONTFAMILY_MEDIUM: {
    fontFamily: 'Urbanist-Medium',
  },
  FONTFAMILY_SEMIBOLD: {
    fontFamily: 'Urbanist-SemiBold',
  },
  FONTFAMILY_REGULAR: {
    fontFamily: 'Urbanist-Regular',
  },
  FONTWEIGHT_400: {
    fontWeight: '400',
  },
  FONTWEIGHT_500: {
    fontWeight: 500,
  },
  FONTWEIGHT_600: {
    fontWeight: 600,
  },
  COLOR_FFF: {
    color: '#fff',
  },

  FONT_12: {
    fontSize: 12,
  },
  FONT_14: {
    fontSize: 14,
  },
  FONT_16: {
    fontSize: 16,
  },
  FONT_17: {
    fontSize: 17,
  },
  FONT_18: {
    fontSize: 18,
  },
  FONT_20: {
    fontSize: 20,
  },
  FONT_24: {
    fontSize: 24,
  },

  // AddScreen

  headerContent: {
    position: 'absolute',
    // top: Platform.OS === 'ios' ? 60 : 40,
  
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
              
  },
  //  headerContent: {
  //   // position: 'absolute',
  //   // // top: Platform.OS === 'ios' ? 60 : 40,
  
  //   width: '100%',
  //   flexDirection: 'row',
  //   // alignItems: 'center',
  //   // paddingHorizontal: 16,
  //   zIndex: 11,
  //   alignSelf: 'center',
  //   pointerEvents: 'box-none',
  //   justifyContent: 'space-between',
  //       // flexDirection: 'column',
  //       alignItems: 'center',
  //       // gap: hp(1.9),
  //       paddingHorizontal: '4.5%',
              
  // },


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

  loginButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  modelBlur: {
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default COMMONSTYLE