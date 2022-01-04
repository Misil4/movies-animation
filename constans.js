import { Dimensions } from "react-native";
const { width, height } = Dimensions.get('window');
export const TOP = height;
export const SPACING = 10
export const ITEM_SIZE = width * 0.74
export const SPACER_ITEM_SIZE = (width - ITEM_SIZE)/2
export const BACKDROP_HEIGHT = height * 0.65
export const WIDTH = width