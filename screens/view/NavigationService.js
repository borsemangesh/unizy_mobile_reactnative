import { createNavigationContainerRef } from '@react-navigation/native';
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
    // Retry with exponential backoff
    let attempts = 0;
    const maxAttempts = 10; // Increased for background navigation
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
        console.log('💾 Storing navigation in AsyncStorage for Dashboard to pick up...');
        // Store in AsyncStorage as fallback - Dashboard will check for this
        AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
          screen: name,
          params: params,
          timestamp: Date.now(),
        })).then(() => {
          console.log('✅ Navigation stored in AsyncStorage successfully');
        }).catch((error) => {
          console.error('❌ Failed to store navigation in AsyncStorage:', error);
        });
      }
    }, 300);
  }
}

// ✅ NEW: Function to reset navigation stack (replaces entire stack)
export function resetNavigation(name, params) {
  if (navigationRef.isReady()) {
    try {
      // Get current route to determine if we need Dashboard in stack
      const state = navigationRef.getRootState();
      const currentRoute = state?.routes[state?.index]?.name;
      
      // If already on Dashboard, just navigate
      if (currentRoute === 'Dashboard') {
        navigationRef.navigate(name, params);
      } else {
        // Reset stack: Dashboard -> Chat Screen
        navigationRef.reset({
          index: 1,
          routes: [
            { name: 'Dashboard', params: { AddScreenBackactiveTab: 'Home', isNavigate: true } },
            { name, params },
          ],
        });
      }
    } catch (error) {
      console.error(`❌ Navigation reset error to ${name}:`, error);
      // Fallback to regular navigate
      try {
        navigationRef.navigate(name, params);
      } catch (e) {
        console.error(`❌ Navigation fallback also failed:`, e);
      }
    }
  } else {
    console.warn('Navigation not ready for reset, storing in AsyncStorage...');
    AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
      screen: name,
      params: params,
      timestamp: Date.now(),
      useReset: true,
    }));
  }
}