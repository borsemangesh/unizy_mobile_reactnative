import crashlytics from '@react-native-firebase/crashlytics';

export const setupCrashlytics = () => {
  // Capture JS Errors
  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    crashlytics().recordError(error);
    crashlytics().log(`JS Error - Fatal: ${isFatal}`);
    crashlytics().log(error?.message);

    crashlytics().sendUnsentReports();

    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });

  // Capture Unhandled Promise Rejections
  const tracking = (reason) => {
    crashlytics().recordError(reason instanceof Error ? reason : new Error(String(reason)));
    crashlytics().log('Unhandled Promise Rejection');
  };

  if (typeof process.on === 'function') {
    process.on('unhandledRejection', tracking);
  }

  crashlytics().log('Crashlytics initialized');
};
