import { StyleSheet } from 'react-native';

export const Styles = StyleSheet.create({
  flex_2: {
    flex: 2,
  },
  flex_1: {
    flex: 1,
    paddingTop: 20,
  },
  ScreenLayout: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linearGradient: {
    // flexDirection: 'column',
    height: '14%',
    paddingBottom: 20,
    // flexShrink: 0,
    borderColor: '#ffffff3d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
      boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    padding: 16,
    width: '90%',
    gap: 3,
    
    },
    other: {
padding: 20
     
    },
  card_container: {
    flexDirection: 'row',
    borderRadius: 50,
    borderBlockColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#0606062c',
    padding: 10,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  hellowText: {
    fontSize: 50,
    color: 'white',
    width: '100%',
    fontFamily: 'NotoSans-Regular',
    textAlign: 'center',
    alignItems: 'center',
    alignContent: 'center',
    textTransform: 'lowercase'
  },
  unizyText: {
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    fontStyle: 'normal',  
    display: 'flex',
    paddingTop: 50,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  selectlangvageCard: {
    borderRadius: 20,
    backgroundColor: 'blue',
    width: '100%',
    padding: 20,
    marginEnd: 10,
    marginStart: 10,
    margin: 10,
    shadowColor: '#c74242ff',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    borderColor: 'rgba(255,255,255,0.15)',
    shadowOpacity: 0.2,
    overflow: 'hidden',
  },
  choselangeuageText: {
    color: '#ffffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  langIcon_nextIcon: {
    width: 10,
    height: 10,
    padding: 10,
    margin: 2,
    borderBlockColor: '#000000',
    paddingRight: 10,
  },
  termsandConditionText: {
    color: '#ffffffff',
    fontWeight: '600',
    fontSize: 9,
    marginTop: 12,
  },
  selectlanguageText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    paddingLeft: 10,
    fontSize: 17,
    lineHeight: 19.2,
  },

  SelectLanguageContainer: {
    flexDirection: 'row',
    padding: 12,
    
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF3d',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
});
