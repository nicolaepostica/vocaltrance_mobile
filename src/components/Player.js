import React from 'react';
import TrackPlayer from 'react-native-track-player';
import {usePlaybackState} from 'react-native-track-player/lib';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import TextTicker from 'react-native-text-ticker';

const playIcon = require('../resources/icons/play-circle.png');
const pauseIcon = require('../resources/icons/pause-circle.png');
const stopIcon = require('../resources/icons/stop-circle.png');
const bitrate_128 = require('../resources/icons/bitrate_128.png');
const bitrate_256 = require('../resources/icons/bitrate_256.png');
const bitrate_320 = require('../resources/icons/bitrate_320.png');
const GrayColor = '#455A64';

const qualityDict = {
  1: bitrate_128,
  2: bitrate_256,
  3: bitrate_320,
};

function ControlButton({icon, onPress, controlButton}) {
  return (
    <TouchableOpacity style={styles.controlButtonContainer} onPress={onPress}>
      <Image style={controlButton} source={icon} />
    </TouchableOpacity>
  );
}

export default function Player(props) {
  const playbackState = usePlaybackState();
  const {
    currentSong,
    onTogglePlayback,
    onChangeQuality,
    onStop,
    currentQuality,
  } = props;
  let playPauseIcon = playIcon;

  if (
    playbackState === TrackPlayer.STATE_PLAYING ||
    playbackState === TrackPlayer.STATE_BUFFERING
  ) {
    playPauseIcon = pauseIcon;
  }

  return (
    <View style={styles.card}>
      <View style={{width: '100%'}}>
        <TextTicker
          style={{fontSize: 20, color: 'white'}}
          loop
          bounce
          repeatSpacer={10}
          marqueeDelay={0}>
          {currentSong}
        </TextTicker>
      </View>
      <View style={styles.controls}>
        <ControlButton
          icon={qualityDict[currentQuality]}
          onPress={onChangeQuality}
          controlButton={{width: 60, height: 60}}
        />
        <ControlButton
          icon={playPauseIcon}
          onPress={onTogglePlayback}
          controlButton={{width: 100, height: 100}}
        />
        <ControlButton
          icon={stopIcon}
          onPress={onStop}
          controlButton={{width: 60, height: 60}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: GrayColor,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
  artist: {
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
  },
  controlButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
