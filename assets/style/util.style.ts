import { StyleSheet } from 'react-native';

export const utileStyle = StyleSheet.create({
  common_font: {
    fontSize: 16,
  },

  TextView_container: {
    display: 'flex',
    flexDirection: 'row',   
    padding: 12,
    alignItems: 'stretch',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF3d',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,

    borderRadius: 40,
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',


//     display: flex;
// padding: 12px;
// align-items: center;
// gap: 8px;
// align-self: stretch;

//     border-radius: 40px;
// background: radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%);
// box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.25);
  },
});
