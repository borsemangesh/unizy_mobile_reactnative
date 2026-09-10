import { Dimensions, PixelRatio } from 'react-native';

/**
 * Screen-% helpers so UI scales evenly on iPhone 13 / 15 / 16 / 17
 * (and Pro / Pro Max) without per-device branches.
 */
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** % of screen width */
export const wp = (percent: number): number =>
  PixelRatio.roundToNearestPixel((SCREEN_W * percent) / 100);

/** % of screen height */
export const hp = (percent: number): number =>
  PixelRatio.roundToNearestPixel((SCREEN_H * percent) / 100);

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;