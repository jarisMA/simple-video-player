const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/VideoDataStore')

const myStore = new DataStore({
  name: "Video Data"
})
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true // 可以使用nodejs的api
      },
      show: false
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => { // 渲染完成后才显示页面
      this.show()
    })
    // this.webContents.openDevTools()
  }
}

app.on('ready', () => {
  let addWindow, playerWindow
  const mainWindow = new AppWindow({}, './renderer/index.html')
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.send('getTracks', myStore.getTracks())
  })
  ipcMain.on('add-video-window', () => {
    addWindow = new AppWindow({
      width: 500,
      height: 400,
      parent: mainWindow
    }, './renderer/add.html')
  })
  ipcMain.on('open-video-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Video', extensions: ['mp4'] }
      ]
    }).then(({ filePaths }) => {
      if (filePaths) {
        event.sender.send('selected-file', filePaths)
      }
    })
  })
  ipcMain.on('add-tracks', (event, tracks) => {
    addWindow.close();
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    event.sender.send('getTracks', updatedTracks)
  })
  ipcMain.on('onplay-video', (event, track) => {
    playerWindow && playerWindow.send('play-video', track, myStore.getTracks())
    !playerWindow && (playerWindow = new AppWindow({
      width: 600,
      height: 400,
    }, './renderer/player.html'))
    playerWindow.once('show', () => {
      playerWindow.send('play-video', track, myStore.getTracks())
    })
    playerWindow.on('closed', () => {
      playerWindow = null
    })
  })
}) 