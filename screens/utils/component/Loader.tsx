import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LOADER_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 100%;
      height: 100vh;
      background: transparent;
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

const Loader = () => {
  return (
    <View style={styles.loaderContainer}>
      <WebView
       originWhitelist={['*']}
        source={{ html: LOADER_HTML }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  webview: {
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
  },
});

export default Loader;