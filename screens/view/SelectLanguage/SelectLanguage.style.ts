import { StyleSheet } from 'react-native';

export const selectlang_styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    paddingTop: 50,
    padding: 16,
  },  
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    flexShrink: 0,
    borderColor: '#ffffff3d',
    borderRadius: 16,
    // backgroundColor:
    //   'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.10) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.09)',
    padding: 16,



         borderWidth: 0.3,
      // borderColor: '#ffffff3d',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    // boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.09)',
    



    // Outer Shadow (bottom-right)
    // shadowColor: "#000",
    // shadowOffset: { width: 6, height: 6 },
    // shadowOpacity: 0.4,
    // shadowRadius: 8,
    // elevation: 10,
    // borderWidth: 1,
    // // borderColor: "rgba(255,255,255,0.1)",
    // opacity: 0.7,

  },
  
  title: {
    fontFamily: 'Urbanist-Semibold',
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    padding: 5, 
    margin: 10 ,
    height:24,
    width:24
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: -5,
    fontWeight:500,
    fontSize:17
  },

  listContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    maxHeight: '85%',
  },
  listContent: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  flatListStyle: {
    width: '100%',alignSelf: 'center', 
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ffffff23',
    borderBottomWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    flex: 2,
  },
  flag: {
    marginRight: 12,
    resizeMode: 'cover',
    borderRadius: 2,
  },
  languageText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    mixBlendMode: 'normal',
    width: '83%',
  },
  radioButton_round: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: 15,
    height: 15,
    flexShrink: 0,
    borderColor: '#ffffff4e',
    right: 0,
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25',
  },
  radioButton: {
    width: 8,
    height: 8,
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: '#ffffff4e',
    // boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  radioButtonSelected: {
    // borderColor: 'white',
    backgroundColor: 'white',
    
    borderRadius: 10,
      borderWidth: 1,
    borderColor: '#ffffff4e',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  
  },
});
