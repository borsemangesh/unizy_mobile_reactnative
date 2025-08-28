import { StyleSheet } from 'react-native';

export const selectlang_styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    padding: 16
  },
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    alignSelf: 'stretch',
    borderRadius: 16,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)'
    
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    flexShrink: 0,
    borderColor: '#ffffff3d',
    borderRadius: 16,
    backgroundColor: 'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.10) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    padding: 16,
  },
  title: {
    fontFamily: 'Urbanist',
    color: '#FFF',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight : 24,
    letterSpacing : 0.5,
  },
  searchBar: {

  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    opacity: 0.5,
    marginHorizontal: 12,
  },

  listContainer: {
    display: 'flex',
    paddingLeft: 0,
    paddingRight: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    height: 'auto',
  },
  languageItem: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    padding: 15,
    alignItems: 'center',
  
    justifyContent: 'space-between',
    fontWeight: '500',
    borderBottomColor: '#ffffff23',
    borderBottomWidth: 1,
  },
  languageInfo: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
    width: '90%',
    textAlign: 'left',
    gap: 5,

  },
  flag: {
    width: 28,
    height: 18,
    marginRight: 12,
    resizeMode: 'cover',
    borderRadius: 2,
  },
  languageText: {
    color: 'white',
    width: '100%',
    fontSize: 16,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff4e',
    boxShadow: '0 0px 5px rgba(253, 253, 253, 0.58)',
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    backgroundColor: 'white',
  },
});
