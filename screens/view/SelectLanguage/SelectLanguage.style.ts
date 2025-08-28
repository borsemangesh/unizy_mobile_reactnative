import { StyleSheet } from 'react-native';

export const selectlang_styles = StyleSheet.create({
  flex_1: {
    flex: 1,    
    paddingTop: 20,
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    boxShadow: '1px 0px 1px 1px rgba(250, 250, 250, 0.44)',
    marginBottom: 15,
  },
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderColor: '#ffffff3d',
    margin: 20,
    borderWidth: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%)',
    boxShadow: '1px 2px 10px 5px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {},
  divider: {
    height: 1,
    backgroundColor: 'white',
    opacity: 0.5,
    marginHorizontal: 12,
  },

  listContainer: {
    paddingBottom: 20,
    borderColor: '#ffffff65',
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
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
