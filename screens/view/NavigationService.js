import { createNavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    try {
      navigationRef.navigate(name, params);
    } catch (error) {
      console.error(`❌ Navigation error to ${name}:`, error);
    }
  } else {
    console.warn('Navigation not ready yet, queuing navigation...');
    let attempts = 0;
    const maxAttempts = 10; 
    const retryInterval = setInterval(() => {
      attempts++;
      if (navigationRef.isReady()) {
        clearInterval(retryInterval);
        try {
          navigationRef.navigate(name, params);
        } catch (error) {
          console.error(`❌ Navigation error to ${name}:`, error);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(retryInterval);
        console.error(`❌ Navigation to ${name} failed after ${maxAttempts} attempts`);

        AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
          screen: name,
          params: params,
          timestamp: Date.now(),
        })).then(() => {
 
        }).catch((error) => {
          // console.error('❌ Failed to store navigation in AsyncStorage:', error);
        });
      }
    }, 300);
  }
}

export function resetNavigation(name, params) {
  if (navigationRef.isReady()) {
    try {
      const state = navigationRef.getRootState();
      const currentRoute = state?.routes[state?.index]?.name;
      if (currentRoute === 'Dashboard') {
        navigationRef.navigate(name, params);
      } else {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Dashboard', params: { AddScreenBackactiveTab: 'Home', isNavigate: true } },
              { name, params },
            ],
          })
        );
      }
    } catch (error) {
      // console.error(`❌ Navigation reset error to ${name}:`, error);
      try {
        navigationRef.navigate(name, params);
      } catch (e) {
        // console.error(`❌ Navigation fallback also failed:`, e);
      }
    }
  } else {
    AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
      screen: name,
      params: params,
      timestamp: Date.now(),
      useReset: true,
    }));
  }
}

export function push(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}