import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TrackPlayer from 'react-native-track-player';
import {usePlaybackState} from 'react-native-track-player/lib/hooks';
import Player from './Player';
import playlistData from '../resources/data/stations-data';
import chanelList from '../resources/data/chanel-list';
import qualityList from '../resources/data/quality-list';

const BASE_URL = 'https://vocaltrance.fm/api/v1/';
const DEFAULT_SONG = 'Vocal Trance FM - Beat Trance Radio in Moldova';
const keyDict = {
  111: 'vocaltrance',
  222: 'deep',
  333: 'positive',
  444: 'uplifting',
  555: 'chillout',
};

const GrayColor = '#455A64';
const RedColor = '#FF5252';

export default function LandingScreen() {
  const [modalQualityVisible, setModalQualityVisible] = useState(false);
  const [currentChanel, setCurrentChanel] = useState('111');
  const [currentQuality, setCurrentQuality] = useState('2');
  const [currentSong, setCurrentSong] = useState(
    'Vocal Trance FM - Beat Trance Radio in Moldova',
  );
  const playbackState = usePlaybackState();

  useEffect(() => {
    TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP,
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP,
      ],
    });
    AsyncStorage.getItem('currentQuality').then((value) => {
      if (value) {
        setCurrentQuality(value);
      }
    });
    AsyncStorage.getItem('currentChanel').then((value) => {
      if (value) {
        setCurrentChanel(value);
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getSongUpdate(currentChanel);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentChanel]);

  async function getSongUpdate(trackId) {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack == null) {
      setCurrentSong(DEFAULT_SONG);
    } else {
      fetch(`${BASE_URL}get_${keyDict[trackId]}_track`)
        .then((response) => {
          return response.json();
        })
        .then(([{track_title}]) => {
          setCurrentSong(track_title);
        });
    }
  }

  async function togglePlayback() {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack == null) {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistData);
      await TrackPlayer.play();
      await getSongUpdate();
    } else {
      if (playbackState === TrackPlayer.STATE_PLAYING) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    }
  }

  async function skipToTarget(trackId) {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack == null) {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistData);
      await TrackPlayer.skip(trackId);
      await TrackPlayer.play();
    } else {
      await TrackPlayer.skip(trackId);
      await TrackPlayer.play();
    }
    await getSongUpdate(trackId.substr(0, 3));
  }

  async function stopPlay() {
    try {
      await TrackPlayer.stop();
    } catch (_) {}
  }

  function setSelectedStyle(id, current, color) {
    if (id === current) {
      return {
        backgroundColor: color,
        borderRadius: 5,
        shadowRadius: 2,
        shadowOpacity: 0.1,
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 1},
        elevation: 3,
        paddingTop: 5,
        paddingBottom: 5,
      };
    } else {
      return {
        paddingTop: 5,
        paddingBottom: 5,
      };
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={GrayColor} barStyle="light-content" />
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          showsVerticalScrollIndicator={false}>
          <View style={{flex: 1}}>
            <View style={styles.viewTitle}>
              <Text style={styles.textTitle}>
                {modalQualityVisible ? 'QUALITY' : 'STATIONS'}
              </Text>
            </View>
            <View style={styles.contentView}>
              {modalQualityVisible
                ? qualityList.map((item) => (
                    <TouchableOpacity
                      style={setSelectedStyle(
                        item.id,
                        currentQuality,
                        RedColor,
                      )}
                      key={item.id}
                      onPress={() => {
                        setModalQualityVisible(!modalQualityVisible);
                        setCurrentQuality(item.id);
                        AsyncStorage.setItem('currentQuality', item.id);
                        skipToTarget(
                          `${currentChanel}${item.id}`,
                        ).then(() => {});
                      }}>
                      <Text style={styles.text}>{item.title}</Text>
                    </TouchableOpacity>
                  ))
                : chanelList.map((item, index) => (
                    <TouchableOpacity
                      style={setSelectedStyle(item.id, currentChanel, RedColor)}
                      key={item.id}
                      onPress={() => {
                        setCurrentChanel(item.id);
                        AsyncStorage.setItem('currentChanel', item.id);
                        skipToTarget(
                          `${item.id}${currentQuality}`,
                        ).then(() => {});
                      }}>
                      <Text style={styles.text}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>
        </ScrollView>
        <Player
          onChangeQuality={() => {
            setModalQualityVisible(!modalQualityVisible);
          }}
          currentQuality={currentQuality}
          onTogglePlayback={togglePlayback}
          onStop={() => {
            stopPlay();
            setCurrentChanel('111');
          }}
          currentSong={currentSong}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GrayColor,
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  textTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  viewTitle: {
    alignItems: 'center',
    paddingTop: 20,
  },
  contentView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  flexGrow: {
    flexGrow: 1,
    flexDirection: 'column',
  },
});
