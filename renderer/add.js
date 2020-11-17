const { ipcRenderer } = require('electron');
const { $ } = require('./help');
const path = require('path')
let videoFilesPath = [];

$('select-video-button').addEventListener('click', () => {
  ipcRenderer.send('open-video-file');
})
$('add-video-button').addEventListener('click', () => {
  console.log(videoFilesPath)
  videoFilesPath.length > 0 && ipcRenderer.send('add-tracks', videoFilesPath)
})

const renderListHTML = (paths) => {
  const videoList = $('videoList')
  const videoItemsHTML = paths.reduce((html, video) => {
    html += `<li class="list-group-item">${path.basename(video)}</li>`
    return html
  }, '')
  videoList.innerHTML = `<ul class="list-group">${videoItemsHTML}</ul>`
}
ipcRenderer.on('selected-file', (event, path) => {
  if (Array.isArray(path)) {
    videoFilesPath = videoFilesPath.concat(path)
    videoFilesPath.length > 0 && renderListHTML(videoFilesPath)
  }
});

