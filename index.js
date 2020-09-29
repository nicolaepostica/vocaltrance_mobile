/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import LandingScreen from './src/components/PlaylistScreen';

AppRegistry.registerComponent(appName, () => LandingScreen);
TrackPlayer.registerPlaybackService(() => require('./src/service'));
