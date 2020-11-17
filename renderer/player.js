const { ipcRenderer } = require('electron')
const { $ } = require('./help');
const Player = require('xgplayer')
let nextTracks = [], currentTrack, video, nextIndex = 1, defaultPlaybackRate = 1.5

ipcRenderer.on('play-video', (event, track, allTracks) => {
  currentTrack = track
  let currentIndex = 0
  nextIndex = 1
  allTracks.some(({ id }, index) => {
    if (id === currentTrack.id) {
      currentIndex = index
      return true
    }
  })
  nextTracks = allTracks.splice(currentIndex + 1)
  video && video.destroy && video.destroy(true)
  video = new Player({
    id: 'video',
    url: currentTrack.path,
    fluid: true,
    cssFullscreen: true,
    autoplay: true,
    playbackRate: [0.5, 0.75, 1, 1.5, 2, 2.5, 3],
    defaultPlaybackRate: defaultPlaybackRate,
    playNext: {
      urlList: nextTracks.map(item => item.path),
    }
  });
  document.getElementsByTagName('title')[0].text = currentTrack.filename
  video.on('playNextBtnClick', () => {
    nextIndex++;
  })
  video.on('ended', () => {
    video.src = nextTracks[nextIndex].path
    document.getElementsByTagName('title')[0].text = nextTracks[nextIndex].filename
    nextIndex++
  })
  video.on('playbackrateChange', ({ to }) => {
    defaultPlaybackRate = to
  })
})