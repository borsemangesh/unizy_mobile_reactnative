import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const LOADER_HTML = `
<!DOCTYPE html>
<html lang="en" style="background: transparent;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      background: transparent;
    }

    body {
      width: 100%;
      height: 100vh;
      background: transparent !important;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .loader-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loader {
      width: 35px;
      aspect-ratio: 1;
      border-radius: 50%;
      background: 
          radial-gradient(farthest-side,#fff 94%,#0000) top/4px 4px no-repeat,
    conic-gradient(#0000 1%,#fff);
  -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 4px),#000 0);
  animation: l13 1s infinite linear;
    }
@keyframes l13{ 
  100%{transform: rotate(1turn)}
}
  </style>
</head>
<body>
  <div class="loader-wrapper" id="loaderWrapper">
    <div class="loader"></div>
  </div>

</body>
</html>
`;

type LoaderProps = {
  containerStyle?: StyleProp<ViewStyle>;
};

const Loader = ({ containerStyle }: LoaderProps) => {
  return (
    <View style={[styles.loaderContainer, containerStyle]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: LOADER_HTML }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        startInLoadingState={false}
        {...(Platform.OS === 'ios' && { 
          opaque: false,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  webview: {
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
    opacity: 1,
  },
});

export default Loader;