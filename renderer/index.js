const { ipcRenderer } = require('electron');
const { $ } = require('./help');

let allTracks
let currentTrack

$('add-video-button').addEventListener('click', () => {
  ipcRenderer.send('add-video-window');
})

const renderListHTML = (tracks) => {
  const tracksList = $('tracksList')
  const tracksItemsHTML = tracks.reduce((html, track) => {
    html += `<li class="row list-group-item d-flex justify-content-between align-items-center">
              <div class="col-10">
                <i class="fa fa-video mr-2 text-secondary"></i>
                <b>${track.filename}</b>
              </div>        
              <div class="col-2">
                <i class="fa fa-play mr-3" data-id="${track.id}"></i>
                <i class="fa fa-trash" data-id="${track.id}"></i>
              </div>    
            </li>`
    return html
  }, '')
  const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何视频</div>'
  tracksList.innerHTML = tracks.length > 0 ? `<ul class="list-group">${tracksItemsHTML}</ul>` : emptyTrackHTML
}

ipcRenderer.on('getTracks', (event, tracks) => {
  allTracks = tracks
  renderListHTML(tracks)
})

$('tracksList').addEventListener('click', (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target
  const id = dataset && dataset.id
  if (id && classList.contains('fa-play')) {
    currentTrack = allTracks.find(track => track.id === id)
    ipcRenderer.send('onplay-video', currentTrack);
  } else if (id && classList.contains('fa-trash')) {
    ipcRenderer.send('delete-track', id)
  }
})

