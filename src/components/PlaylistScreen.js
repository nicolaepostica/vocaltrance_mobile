import React, {useEffect, useState} from 'react';
import {
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TrackPlayer from 'react-native-track-player';
import {usePlaybackState} from 'react-native-track-player/lib/hooks';
import Player from './Player';
import playlistData from '../resources/data/stations-data';
import chanelList from '../resources/data/chanel-list';
import qualityList from '../resources/data/quality-list';

const youtubeIcon = require('../resources/icons/youtube-brands.png');
const closeIcon = require('../resources/icons/window-close-regular.png');

const YOUTUBE_URL = 'https://www.youtube.com/channel/UCVy0TfTcM04H5tFlirLVB-A';
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
  const [playIcon, setPlayIcon] = useState('play');
  const playbackState = usePlaybackState();

  const [modalYoutubeVisible, setModalYoutubeVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('youtubeModal').then((value) => {
      if (value) {
        setModalYoutubeVisible(JSON.parse(value));
      } else {
        setModalYoutubeVisible(JSON.parse(true));
        AsyncStorage.setItem('youtubeModal', JSON.stringify(true));
      }
    });
  }, [setModalYoutubeVisible]);

  useEffect(() => {
    TrackPlayer.setupPlayer().then();
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
    }).then();
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
      getSongUpdate(currentChanel).then();
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

  async function togglePlatformAction(action) {
    if (Platform.OS === 'ios') {
      await setTimeout(() => action, 2000);
    } else {
      action;
    }
  }

  async function togglePlayback() {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    console.log(currentTrack);
    if (currentTrack == null) {
      await setPlayIcon('pause');
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistData);
      await TrackPlayer.skip(`${currentChanel}${currentQuality}`);
      await togglePlatformAction(TrackPlayer.play());
      await getSongUpdate();
    } else {
      if (playbackState === TrackPlayer.STATE_PLAYING) {
        await setPlayIcon('play');
        await togglePlatformAction(TrackPlayer.pause());
      } else {
        await setPlayIcon('pause');
        await togglePlatformAction(TrackPlayer.play());
      }
    }
  }

  async function skipToTarget(trackId) {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    console.log(currentTrack);
    if (currentTrack == null) {
      await setPlayIcon('pause');
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistData);
      await TrackPlayer.skip(trackId);
      await togglePlatformAction(TrackPlayer.play());
    } else {
      await setPlayIcon('pause');
      await TrackPlayer.skip(trackId);
      await togglePlatformAction(TrackPlayer.play());
    }
    await getSongUpdate(trackId.substr(0, 3));
  }

  async function stopPlay() {
    try {
      await setPlayIcon('play');
      await togglePlatformAction(TrackPlayer.pause());
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
      <SafeAreaView style={styles.baseView}>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          showsVerticalScrollIndicator={false}>
          <View style={styles.baseView}>
            <View style={styles.viewTitle}>
              <Text style={styles.textTitle}>
                {modalQualityVisible ? 'QUALITY' : 'CHANNELS'}
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
                : chanelList.map((item) => (
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
              <View style={styles.youtubeContainer}>
                <TouchableOpacity
                  style={styles.youtube}
                  key="youtube"
                  onPress={() => Linking.openURL(YOUTUBE_URL)}>
                  <Image style={styles.youtubeButton} source={youtubeIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <Player
          onChangeQuality={() => {
            setModalQualityVisible(!modalQualityVisible);
          }}
          playIconState={playIcon}
          currentQuality={currentQuality}
          onTogglePlayback={togglePlayback}
          onStop={stopPlay}
          currentSong={currentSong}
        />
      </SafeAreaView>
      <Modal
        animationType="fade"
        visible={modalYoutubeVisible}
        transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalHeaderCloseButton}
              onPress={() => {
                setModalYoutubeVisible(false);
              }}>
              <Image
                style={styles.modalHeaderCloseButtonIcon}
                source={closeIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.modalYoutubeButton}>
            <TouchableOpacity
              key="youtube"
              onPress={() => {
                AsyncStorage.setItem('youtubeModal', JSON.stringify(false));
                setModalYoutubeVisible(false);
                Linking.openURL(YOUTUBE_URL).then();
              }}>
              <View style={styles.modalYoutubeButtonContent}>
                <Image style={styles.youtubeButton} source={youtubeIcon} />
                <Text style={styles.textYoutube}>SUBSCRIBE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GrayColor,
  },
  baseView: {
    flex: 1,
  },
  text: {
    fontSize: 24,
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
  youtubeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  youtube: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textYoutube: {
    fontSize: 64,
    textAlign: 'center',
    color: 'white',
  },
  youtubeButton: {
    width: 215,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'flex-end',
  },
  modalHeaderCloseButton: {
    marginTop: 15,
    marginRight: 15,
    padding: 5,
  },
  modalHeaderCloseButtonIcon: {
    width: 50,
    height: 43,
  },
  modalYoutubeButton: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#455A64',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalYoutubeButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#455A64',
    borderRadius: 10,
    margin: 20,
  },
});
