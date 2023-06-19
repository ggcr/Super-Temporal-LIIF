// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// reset local storage
window.localStorage.removeItem('file-arr')
window.localStorage.removeItem('out-arr')
window.localStorage.removeItem('rect-id')

contextBridge.exposeInMainWorld('api', {
  setFileArr: (data) => {
    let prev = JSON.parse(window.localStorage.getItem('file-arr'))
    if(prev !== null) data = data.concat(prev)
    window.localStorage.setItem('file-arr', JSON.stringify(data))
  },
  setFileOutArr: (data) => {
    let prev = JSON.parse(window.localStorage.getItem('out-arr'))
    if(prev !== null) data = data.concat(prev)
    window.localStorage.setItem('out-arr', JSON.stringify(data))
  },
  getFileOutArr: () => {
    return JSON.parse(window.localStorage.getItem('out-arr'))
  },
  getFileArr: () => {
    return JSON.parse(window.localStorage.getItem('file-arr'))
  },
  resetFileArr: () => {
    window.localStorage.removeItem('file-arr');
    window.localStorage.removeItem('out-arr');
  },
  setRectId: (data) => {
    window.localStorage.setItem('rect-id', JSON.stringify(data))
  },
  getRectId: () => {
    return JSON.parse(window.localStorage.getItem('rect-id'))
  },
  getFilePath: () => {
    return JSON.parse(window.localStorage.getItem('file-path'))
  },
  resetFileArr: () => {
    window.localStorage.removeItem('file-path');
    window.localStorage.removeItem('file-arr');
    window.localStorage.removeItem('out-arr');
    window.localStorage.removeItem('rect-id');
  },
  reset: () => {
    ipcRenderer.send('reset')
  },
  clip: (xmin, ymin, xmax, ymax, fArr) => {
    ipcRenderer.send('clip', xmin, ymin, xmax, ymax, fArr)
    return new Promise((resolve) =>
      ipcRenderer.once('clip', (event, data) => resolve({ event, data }))
    )
  },
  clipShp: (shpPath, fArr) => {
    ipcRenderer.send('clipShp', shpPath, fArr)

    return new Promise((resolve) =>
      ipcRenderer.once('clipShp', (event, data) => resolve({ event, data }))
    )
  },
  readFile: (filepath) => {
    window.localStorage.setItem('file-path', JSON.stringify(filepath));
    ipcRenderer.send('read-file', filepath);

    return new Promise((resolve) =>
      ipcRenderer.once(filepath, (event, data) => resolve({ event, data }))
    )
  },
  openDialog: () => {
    ipcRenderer.send('open-dialog')

    return new Promise((resolve) =>
      ipcRenderer.once('open-dialog', (event, data) => resolve({ event, data }))
    )
  },
  openDemDialog: () => {
    ipcRenderer.send('open-dem-dialog')

    return new Promise((resolve) =>
      ipcRenderer.once('open-dem-dialog', (event, data) => resolve({ event, data }))
    )
  },
  interpolation: (inter_method, spatial, temporal, spectral, fArr) => {
    ipcRenderer.send('inter', inter_method, spatial, temporal, spectral, fArr)

    return new Promise((resolve) =>
      ipcRenderer.once('inter', (event, data) => resolve({ event, data }))
    )
  },
  getCorner: (f) => {
    ipcRenderer.send('getCorner', f)

    return new Promise((resolve) =>
      ipcRenderer.once('getCorner', (event, data) => resolve({ event, data }))
    )
  },
  esrgan: (scale, fArr) => {
    ipcRenderer.send('esrgan', scale, fArr)

    return new Promise((resolve) =>
      ipcRenderer.once('esrgan', (event, data) => resolve({ event, data }))
    )
  },
  interpolation_gif: (fArr) => {
    ipcRenderer.send('inter-gif', fArr)

    return new Promise((resolve) =>
      ipcRenderer.once('inter-gif', (event, data) => resolve({ event, data }))
    )
  },
  saveToDisk: (data, deleteDir = false) => {
    ipcRenderer.send('save-disk', data, deleteDir)
  },

})
