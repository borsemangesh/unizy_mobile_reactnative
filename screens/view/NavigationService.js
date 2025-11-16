import { createNavigationContainerRef } from '@react-navigation/native';

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
    const maxAttempts = 5;
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
      }
    }, 200);
  }
}
