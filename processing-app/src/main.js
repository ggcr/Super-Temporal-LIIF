const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const decompress = require("decompress");

function getFilenameAndExtension(pathfilename){
  return [path.parse(pathfilename).dir, path.parse(pathfilename).name, path.parse(pathfilename).ext];
}


// This TArr is the fArr used as input in the interpolation but with the output names added
function buildTArr(fArr, temporal) {
  var TArr = [];
  var lastIdx = fArr.length - 1;

  fArr.map((val,idx) => {
    var valRel = val.relPath.replace(/(\s+)/g, '\\$1');
    var [dir, file, ext] = getFilenameAndExtension(valRel);
    if(idx === lastIdx) {
      temporal = 1;
    } 
    for (let index = 0; index < temporal; ++index) {
      var fileExt = 'INTER_' + file + '_temp_' + index + ext;
      TArr.push({
        absPath: fileExt,
        relPath: dir + '/' + fileExt
      })
    }
  })

  return TArr;
}

function guidGenerator() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function commandExec(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          resolve(false);
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(true);
    });
  });
}

function executeCommandOnFiles(command, bandsFilter, masksFilter, croppedFilter, f, ext) {
  if(masksFilter && ext === ".jp2" && f.absPath.startsWith("MSK")) {
    if((croppedFilter && f.absPath.includes("CROPPED")) || (!croppedFilter && !f.absPath.includes("CROPPED"))) {
      commandExec(command);
    }
  } else if(bandsFilter && ext === ".jp2" && !f.absPath.startsWith("MSK")) {
    if((croppedFilter && f.absPath.includes("CROPPED")) || (!croppedFilter && !f.absPath.includes("CROPPED"))) {
      commandExec(command);
    }
  } else if(!masksFilter && !bandsFilter && croppedFilter && ext === ".jp2" && f.absPath.includes("CROPPED")) {
    commandExec(command);
  } else if(!masksFilter && !bandsFilter && !croppedFilter) {
    commandExec(command);
  }
}

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // take up the whole space
  mainWindow.maximize()
  mainWindow.show()

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();

  return mainWindow
};

async function parseCoordinates(path) {
  const promise = await new Promise((resolve, reject) => {
    var fs = require('fs');
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    var xml = fs.readFileSync(path);

    parser.parseString(xml, (error, result) => {
      if (error) resolve(false);
      else {
        try {
          let coords = result[Object.keys(result)[0]]['n1:Geometric_Info'][0]['Product_Footprint'][0]['Product_Footprint'][0]['Global_Footprint'][0]['EXT_POS_LIST'][0]
          coords = coords.split(' ')
          coords.pop()
          let coordinateArray = [];
          while(coords.length) coordinateArray.push(coords.splice(0,2));
          resolve(coordinateArray)
        } catch (error) {
          console.error("No coordinates found in metadata file", path)
          resolve(false);
        }
      }
    });
  });
  return promise;
}

const getFiles = function(dir, coords, thumbnail) {
  var results = [];
  console.log("working");
  var list = []
  try {
    list = fs.readdirSync(dir);
  } catch (err) {
    // If we are reading a single file...
    if(err.code === "ENOTDIR") {
      console.log(dir)
      var [dir_aux, file, ext] = getFilenameAndExtension(dir)
      list.push(file + ext);
      dir = dir_aux;
    }
  }
  console.log("list: ", list);
  list.forEach(function(file) {
    var stat = fs.statSync(dir + '/' + file);
    if (stat && stat.isDirectory()) {
      // new dir
      results = results.concat(getFiles(dir + '/' + file, coords, thumbnail)[0]);
    } else if(file[0] !== '.') {
      // file
      if(file.startsWith("MTD")) {
        coords.push(dir.concat('/', file))
      } else if(file.split('.').pop() === "jpg" && file.startsWith("S")) {
        thumbnail.push(dir.concat('/', file))
      }
      results.push({absPath: file, relPath: dir + '/' + file});
    }
  });
  return [results, coords, thumbnail]
}

app.whenReady().then(() => {
  let mainWindow = createWindow()

  ipcMain.on('read-file', (event, filepath) => {
    // if filepath.length > 1 we add the parent dir
    var files = [];
    var coords = [];
    var thumbnail = [];

    // parse all the files and find thumbnails
    [files, coords, thumbnail] = getFiles(filepath, coords, thumbnail)

    // parse all the metadata files
    var promises = [];
    for(const metadata_file of coords) {
      promises.push(new Promise((resolve) => {
        parseCoordinates(metadata_file).then(res => {
          resolve(res)
        })
      }))
    }

    Promise.all(promises)
      .then(result => {
          event.sender.send(filepath, {files: files, coords: result.filter(Boolean), thumbnail: thumbnail})
    })

  })

  ipcMain.on('reset', () => {
    mainWindow.webContents.reloadIgnoringCache()
  });

  ipcMain.on('clip', (e, xmin, ymin, xmax, ymax, fArr) => {
    var ret = [];
    var promises = [];
    for (const f of fArr) {
      promises.push(new Promise((resolve) => {
        let [dir, file, ext] = getFilenameAndExtension(f.relPath.replace(/(\s+)/g, '\\$1'))
        var absPath = file + '_CROPPED' + '.png';
        var relPath = dir +  '/' + file + '_CROPPED' + '.png';
        var command = 'gdalwarp -te ' + xmin + ' ' + ymin + ' ' + xmax + ' ' + ymax + ' -te_srs "EPSG:4326" -t_srs "EPSG:4326" -of PNG ' + f.relPath.replace(/(\s+)/g, '\\$1') + ' ' + dir +  '/' + file + '_CROPPED' + '.png';

        commandExec(command).then(res => {
          if(res) {
            ret.push({absPath: absPath, relPath: relPath});
          }
          resolve(res)
        });
      }))
    }

    Promise.all(promises).then(result => {
      e.sender.send('clip', ret)
    })

  })

  ipcMain.on('open-dialog', (event) => {

    dialog.showOpenDialog({
      title:"Select the Shapefile in .ZIP format.",
      filters: [
        {name: '.ZIP', extensions: ['zip']},
      ],
      properties: ['openFile'],
    }).then(filenames => {
      var shpPath;
      decompress(filenames.filePaths.at(0), "dist")
      .then((files) => {
        for(const f of files) {
          var [dir, name, ext] = getFilenameAndExtension(f.path)
          if(!dir.startsWith('__MACOSX')) {
            fs.writeFileSync('/tmp/' + name + ext, f.data);
            if(ext === '.shp') {
              shpPath = '/tmp/' + name + ext;
            }
          }
        }
      })
      .then(() => {
        event.sender.send('open-dialog', {files: filenames, shp: shpPath})
      })
      .catch((error) => {
        console.log(error);
      });

    });
  });

  ipcMain.on('clipShp', (e, shpPath, fArr) => {
    var ret = [];
    var promises = [];
    for (const f of fArr) {
      promises.push(new Promise((resolve) => {
        let [dir, file, ext] = getFilenameAndExtension(f.relPath.replace(/(\s+)/g, '\\$1'))
        let [dirShp, fileShp, extShp] = getFilenameAndExtension(shpPath.replace(/(\s+)/g, '\\$1'))
        var absPath = file + '_SHP_CROPPED_' + fileShp + '.png';
        var relPath = dir +  '/' + file + '_SHP_CROPPED_' + fileShp + '.png';
        var command = 'gdalwarp -cutline ' + shpPath + ' ' + '-crop_to_cutline -t_srs "EPSG:4326" -of PNG ' + f.relPath.replace(/(\s+)/g, '\\$1') + ' ' + dir +  '/' + file + '_SHP_CROPPED_' + fileShp + '.png';

        console.log(command)
        commandExec(command).then(res => {
          console.log(res)
          if(res) {
            ret.push({absPath: absPath, relPath: relPath});
          }
          resolve(res)
        });
      }))
    }

    Promise.all(promises).then(result => {
      console.log(ret)
      e.sender.send('clipShp', ret)
    })
  })

  ipcMain.on('open-dem-dialog', (event) => {

    dialog.showOpenDialog({
      title:"Select the DEM GeoTiff file.",
      filters: [
        {name: '.tif', extensions: ['tif']},
      ],
      properties: ['openFile'],
    }).then(filename => {
      console.log(filename)
      if(filename['canceled'] !== true && filename['filePaths']) {
        var file = filename['filePaths'][0];
        var parentFolder = require('path').resolve(__dirname, '..')
        var gdalScript = require('path').resolve(parentFolder, 'utils/getCornerCoords.py')
        var command = 'python ' + gdalScript + ' ' + file
        exec(command, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          var split_stdout = stdout.split('\n')
          var coordsDem = [];
          for(const s of split_stdout) {
            if(s.startsWith('Corner:'))
              coordsDem.push(s.match(/\[(.*?)\]/)[1].split(',').map(Number))
          }
          var [dir, name, ext] = getFilenameAndExtension(file);
          event.sender.send('open-dem-dialog', {filename: {absPath: name + ext, relPath: file}, coordsDem: coordsDem})
        });
      }
    });
  });

  ipcMain.on('inter', (e, inter_method, spatial, temporal, spectral, fArr) => {
      var ret = [];
      var promises = [];
      
      // this is why we can't have JS
      spatial = parseInt(spatial);
      temporal = parseInt(temporal);
      spectral = parseInt(spectral);

      console.log(fArr)
      var TArr = buildTArr(fArr, temporal + 1);

      console.log(TArr)
      console.log(spatial, temporal, spectral);

        promises.push(new Promise((resolve) => {
          var parentFolder = require('path').resolve(__dirname, '..')
          var interpn = require('path').resolve(parentFolder, 'utils/interpn.py')
          var command = 'python ' + interpn + ' ' + fArr.length;
          for(const element of fArr) {
            command += ' ' + element.relPath.replace(/(\s+)/g, '\\$1')
          }
          command += ' ' + spatial + ' ' + temporal + ' ' + spectral;
          console.log(command);
          console.log()
          commandExec(command).then(res => {
            ret.push(...TArr);
            resolve(res)
          });
        }));


      Promise.all(promises).then(result => {
        e.sender.send('inter', ret)
      })
  })

  ipcMain.on('getCorner', (event, f) => {
    var parentFolder = require('path').resolve(__dirname, '..')
    var gdalScript = require('path').resolve(parentFolder, 'utils/getCornerCoords.py')
    var command = 'python ' + gdalScript + ' ' + f.relPath
    exec(command, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(stdout)
      var split_stdout = stdout.split('\n')
      var coords = [];
      for(const s of split_stdout) {
        if(s.startsWith('Corner:'))
          coords.push(s.match(/\[(.*?)\]/)[1].split(',').map(Number))
      }
      event.sender.send('getCorner', coords)
    });
  });

  ipcMain.on('esrgan', (e, scale, fArr) => {
    var ret = [];
    var promises = [];
    for (const f of fArr) {
      promises.push(new Promise((resolve) => {
        let [dir, file, ext] = getFilenameAndExtension(f.relPath.replace(/(\s+)/g, '\\$1'))
        var parentFolder = require('path').resolve(__dirname, '..')
        var gdalScript = require('path').resolve(parentFolder, 'utils/ESRGAN.py')

        var absPath = (f.absPath.includes("INTER")) ? file.replace("INTER", "ESRGAN_") + scale + ext : file.replace("CROPPED", "ESRGAN_") + scale + ext;
        var relPath = (f.absPath.includes("INTER")) ? dir + '/' + file.replace("INTER", "ESRGAN_") + scale + ext : dir + '/' + file.replace("CROPPED", "ESRGAN_") + scale + ext;
        var command = 'python ' + gdalScript + ' '  + f.relPath.replace(/(\s+)/g, '\\$1') + ' ' + relPath;
        console.log(command)
        commandExec(command).then(res => {
          if(res) {
            ret.push({absPath: absPath, relPath: relPath});
          }
          resolve(res)
        });
      }))
    }

    Promise.all(promises).then(result => {
      e.sender.send('esrgan', ret)
    })
  })

  ipcMain.on('inter-gif', (e, fArr) => {
    var ret = [];
    var promises = [];
    // generate a new folder path in /src/<guid> for storing all the images
    var folderPath = __dirname + '/' + guidGenerator() + '/';
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, 0744);

    for (const f of fArr) {
      let [_, file, ext] = getFilenameAndExtension(f.relPath.replace(/(\s+)/g, '\\$1'))
      // File destination.txt will be created or overwritten by default.
      let newPathImg = folderPath + file + ext;
      fs.copyFile(f.relPath, newPathImg, (err) => {
        if (err) throw err;
        console.log(f.absPath + ' was copied to ' + newPathImg);
      }); 
    }
    
    var command = "ffmpeg -framerate 5 -pattern_type glob -i '" + folderPath + "INTER_*.png' -c:v libx264 -pix_fmt yuv420p " + folderPath + "out.mp4"
    console.log(command);
    promises.push(new Promise((resolve) => {
      commandExec(command).then(res => {
        if(res) {
          console.log("command completed")
          command = "ffmpeg -i " + folderPath + "out.mp4 -pix_fmt rgb24 " + folderPath + "out.gif"
          console.log(command);
          ret.push({relPath: folderPath + "out.mp4", absPath: "out.mp4"});
          commandExec(command).then(res2 => {
            if(res2) {
              console.log("command completed")
              ret.push({relPath: folderPath + "out.gif", absPath: "out.gif"});
            } else { resolve(false) };
            resolve(res2);
          });
        } else { resolve(false) };
      });
    }))

    Promise.all(promises).then(result => {
      e.sender.send('inter-gif', ret)
    })
  })

  ipcMain.on('save-disk', (e, fArr, deleteDir) => {
    var promises = [];
    dialog.showOpenDialog({
      title:"Select a location to store the files",
      title:"Select a location to store the files",
      filters: [],
      properties: ['openDirectory', 'createDirectory']
    }).then(res => {
      console.log("res is : ", res);
      if(!res.canceled) {
        console.log(res.filePaths); 
        var storePath = res.filePaths;
        for (const f of fArr) {
          promises.push(new Promise((resolve) => {
            let [dir, file, ext] = getFilenameAndExtension(f.relPath.replace(/(\s+)/g, '\\$1'))
            console.log(f)
            let newPathImg = storePath + '/' + file + ext;
            fs.copyFile(f.relPath, newPathImg, (err) => {
              if (err) throw err;
              else resolve(true)
              console.log(f.absPath + ' was copied to ' + newPathImg);
            })
          }));
        }
        Promise.all(promises).then(result => {
          if(deleteDir && fArr.length > 0) {
            let [dir, file, ext] = getFilenameAndExtension(fArr[0].relPath.replace(/(\s+)/g, '\\$1'))
            console.log("removing parent folder", dir);
            fs.rmSync(dir, { recursive: true, force: true });
          }
        })
      }
    })
  
  })

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
