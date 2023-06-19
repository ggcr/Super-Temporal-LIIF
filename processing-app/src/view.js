// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {layers: [osm, Esri_WorldImagery]}).setView([47.23, 2.914], 5);

var baseMaps = {
    "Esri_WorldImagery": Esri_WorldImagery,
    "OpenStreetMap": osm,
    // other provders: https://leaflet-extras.github.io/leaflet-providers/preview/
};

var layerControl = L.control.layers(baseMaps).addTo(map);

document.getElementById("file-content").addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    for(const file of event.dataTransfer.files) {
        window.api
        .readFile(file.path)
        .then(({ event, data }) => {
            // save
            if(data) {
                window.api.setFileArr(data.files);
                displayFilesFromLocalS()
                var markersGroup = [];
                for(var i = 0; i < data.thumbnail.length; i++) {
                    markersGroup.push(displayThumbnail(data.coords[i], data.thumbnail[i]))
                }
                var group = new L.featureGroup(markersGroup)
                map.fitBounds(group.getBounds(), {padding: [150,150]});
                document.getElementById("controls").style.visibility  = "visible";
            }
        });
    }
});

document.getElementById("out-content").addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    for(const file of event.dataTransfer.files) {
        window.api
        .readFile(file.path)
        .then(({ event, data }) => {
            // save
            if(data) {
                // window.api.setFileArr(data.files);
                console.log(data.files);
                window.api.setFileOutArr(data.files);
                console.log(window.api.getFileOutArr());
                displayFilesFromLocalS()
            }
        });
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {

});

document.addEventListener('dragleave', (event) => {

});


const reset = () => {
    window.api.resetFileArr()
    window.api.reset()
}

function filterByCheckboxDOM(fArr, domArr) {
    var res = [];
    fArr.forEach((val, idx) => {
        try {
            if(domArr.childNodes[idx].childNodes[1].checked === true) {
                res.push(val)
            }
        } catch(e) { }
    })
    return res
}

function filterInputFArr(fArr, masks, bands, dem) {
    var res = fArr.filter((res) => {
        return res.absPath.includes("CROPPED") !== true && res.absPath.includes("INTER") !== true;
    });

    if(bands) {
    res = res.filter((res) =>{
        return res.absPath.split('.').pop() === "jp2";
    });
    }

    if(masks) {
        var masksFilter = res.filter((res) => {
            return res.absPath.includes('MSK') == true;
        });
        res = (!bands) ? masksFilter : res.concat(masksFilter);
    } else {
        res = res.filter((res) => {
            return res.absPath.includes('MSK') == false;
        });
    }

    if(dem) {
        var demFilter = res.filter((res) => {
            return res.absPath.includes('DEM') == true || res.absPath.includes('DSM') == true;
        });

        res = (!bands && !masks) ? demFilter : res.concat(demFilter);
    }

    return res;
}

function containsObject(obj, list) {
    var i;
    if(list && list.length > 0) {
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
    }

    return false;
}

function filterOutputArr(OArr, crop, inter) {
    var croppedArr = [];
    var interArr = [];
    var ret = [];

    if(crop) {
        croppedArr = OArr.filter((res) =>{
            return res.absPath.includes('CROPPED') == true && res.absPath.includes('.aux') == false;
        });
    }
    if(inter) {
        interArr = OArr.filter((res) =>{
            return res.absPath.includes('INTER') == true && res.absPath.includes('.aux') == false;;
        });
    }

    if(!crop && !inter) {
        ret = OArr
    } else {
        ret = croppedArr.concat(interArr)
    }

    return ret;
}

const styleSvg = () => {
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const iconPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
    );

    iconSvg.setAttribute('fill', 'currentColor');
    iconSvg.setAttribute('viewBox', '0 0 20 20');
    // padding:0px 10px;
    iconSvg.style = "width:20px; color:black; float:right; cursor:pointer; padding:0px 10px;";

    iconPath.setAttribute(
        'd',
        'M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z'
    );
    iconPath.setAttribute('fill-rule', 'evenodd');
    iconPath.setAttribute('clip-rule', 'evenodd');

    iconSvg.appendChild(iconPath);
    return iconSvg;
}

function getFilenameAndExtension(pathfilename){
    return [path.parse(pathfilename).dir, path.parse(pathfilename).name, path.parse(pathfilename).ext];
}

const displayFilesFromLocalS = () => {
    // remove
    document.getElementById('file-content').innerHTML = ""
    document.getElementById('out-content').innerHTML = ""

    // get file array
    var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
    var OArr = fArr;


    // filter
    var masksFilter = (document.getElementById('masks').checked) ? true : false;
    var bandsFilter = (document.getElementById('bands').checked) ? true : false;
    var demFilter = (document.getElementById('dem').checked) ? true : false;
    fArr = (fArr) ? filterInputFArr(fArr, masksFilter, bandsFilter, demFilter) : [];

    // display
    for (const f of fArr) {
        let li = document.createElement('li', f.absPath)
        // li.appendChild(document.createTextNode(f.absPath))
        let input = document.createElement("input"); //add Input
        input.type = "checkbox"; //specify the type of input to checkbox
        input.checked = document.getElementById("selectAll").checked;
        li.appendChild(document.createTextNode(f.absPath));
        li.appendChild(input);
        li.style.display = "inline-flex";
        li.style.justifyContent = "space-between";
        li.style.width = "-webkit-fill-available"
        document.getElementById('file-content').appendChild(li)
    }
    OArr = (OArr) ? OArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER') || res.absPath.includes('ESRGAN');
    }) : [];

    var cropFilter = (document.getElementById('cropFilter').checked) ? true : false;
    var interFilter = (document.getElementById('interFilter').checked) ? true : false;

    OArr = filterOutputArr(OArr, cropFilter, interFilter)
    var OutArr = JSON.parse(window.localStorage.getItem('out-arr'))
    console.log("OutArr: ", OutArr);
    OArr = (OutArr) ? OutArr.concat(OArr) : OArr;
    console.log("OArr: ", OArr);

    // display
    for (const f of OArr) {
        
        let li = document.createElement('li', f.absPath)
        li.appendChild(document.createTextNode(f.absPath))
        var svgPhoto = styleSvg();
        if(f.absPath.split('.').pop() === "png" && !containsObject(f, OutArr)) {
            svgPhoto.addEventListener('click', function(e) {
                // (TO-FIX) if we want to display the interpolated one we must
                // use the cropped coordinates, cv2 and gdal lose information
                // when resampling :(
                // Possible solution: Save the f{} object with the CROPPED
                // coordinates.
                var file = {};
                if(f.absPath.includes("INTER_")) {
                    file['absPath'] = f.absPath.split('INTER_')[1].split('_temp')[0] + ".png";
                    file['relPath'] = f.relPath.split('INTER_')[0] + f.relPath.split('INTER_')[1].split('_temp')[0] + ".png";
                } else if(f.absPath.includes("_ESRGAN_")) {
                    file['absPath'] = f.absPath.split('ESRGAN')[0] + "CROPPED.png";
                    file['relPath'] = f.relPath.split('ESRGAN')[0] + "CROPPED.png";
                } else {
                    file = f;
                }

                window.api.getCorner(file).then((res) => {
                    res.data.push(res.data[0])
                    L.imageOverlay(f.relPath, res.data, {zIndex: 500}).addTo(map);
                    console.log(res.data);
                    map.fitBounds(res.data);
                })
            })
            li.appendChild(svgPhoto)
            li.style.display = "inline-flex";
            li.style.justifyContent = "space-between";
            li.style.width = "-webkit-fill-available"

            if(f.absPath.includes("INTER")) {
                li.style.color = "brown";
            } else if(f.absPath.includes("CROPPED")) {
                li.style.color = "blue";
            } else {
                li.style.color = "green";
            }
        }

        let input = document.createElement("input"); //add Input
        input.type = "checkbox"; //specify the type of input to checkbox
        li.appendChild(input);
        li.style.display = "inline-flex";
        li.style.justifyContent = "space-between";
        li.style.width = "-webkit-fill-available"

        document.getElementById('out-content').appendChild(li)
    }
}


const displayThumbnail = (coords, im) => {
    let image = null;
    image = showImageCallback(coords, im)
    document.getElementById("images").addEventListener('change', function() {
        image.remove()
        image = showImageCallback(coords, im)
    });
    return image
}

const showImageCallback = (coords, im) => {
    let showImage = (document.getElementById('images').checked) ? true : false;
    if(showImage) {
        "/Users/cristian/Code/TFG-CristianGutierrez/processing-app/opencv_utils/data/S2A_MSIL1C_20221203T104421_N0400_R008_T31TDF_20221203T141912.SAFE/GRANULE/L1C_T31TDF_A038901_20221203T104538/IMG_DATA/T31TDF_20221203T104421_B01_CROPPED.jpg"
        return L.imageOverlay(im, coords, {opacity: 0.85}).addTo(map);
    } else {
        return L.rectangle(coords, {color: "#ff7800", fill: true, weight: 1, className: "zIn"}).addTo(map);
    }
}

function getCorners(layer) {
    const corners = layer.getBounds();

    const northwest = corners.getNorthWest();
    const northeast = corners.getNorthEast();
    const southeast = corners.getSouthEast();
    const southwest = corners.getSouthWest();

    return {
        northwest: northwest,
        northeast: northeast,
        southeast: southeast,
        southwest: southwest
    };
}

const squareDraw = () => {
    document.getElementById('square').addEventListener('click', function() {
        layerGroup.remove()
    });

    // Square Draw
    let m = map.getBounds().pad(-0.7)
    var square = L.rectangle(m, {color: "#0E9F6E", weight: map.getZoom(), draggable: true});
    const layerGroup = L.layerGroup([square]);

    // Corners Draw
    var circle1 = L.circleMarker(square.getBounds().getNorthWest(), {
        color: '#0E9F6E',
        fill: true,
        fillColor:'#31C48D',
        fillOpacity: 1.0,
        radius: map.getZoom(),
        draggable: true
    }).addTo(layerGroup)

    var circle2 = L.circleMarker(square.getBounds().getNorthEast(), {
        color: '#0E9F6E',
        fill: true,
        fillColor:'#31C48D',
        fillOpacity: 1.0,
        radius: map.getZoom(),
        draggable: true
    }).addTo(layerGroup)

    var circle3 = L.circleMarker(square.getBounds().getSouthEast(), {
        color: '#0E9F6E',
        fill: true,
        fillColor:'#31C48D',
        fillOpacity: 1.0,
        radius: map.getZoom(),
        draggable: true
    }).addTo(layerGroup)

    var circle4 = L.circleMarker(square.getBounds().getSouthWest(), {
        color: '#0E9F6E',
        fill: true,
        fillColor:'#31C48D',
        fillOpacity: 1.0,
        radius: map.getZoom(),
        draggable: true
    }).addTo(layerGroup)

    // When dragging
    circle1.on('rectDrag', function(e) {
        map._layers[circle1._leaflet_id].setLatLng(map._layers[square._leaflet_id].getLatLngs()[0][1])
    })
    circle1.on('drag', function(e) {
        const c1latlng = map._layers[circle1._leaflet_id].getLatLng()
        const c2latlng = map._layers[circle2._leaflet_id].getLatLng()
        const c4latlng = map._layers[circle4._leaflet_id].getLatLng()
        map._layers[circle2._leaflet_id].setLatLng([c1latlng.lat, c2latlng.lng])
        map._layers[circle4._leaflet_id].setLatLng([c4latlng.lat, c1latlng.lng])
        map._layers[square._leaflet_id].setBounds([map._layers[circle1._leaflet_id].getLatLng(), map._layers[circle2._leaflet_id].getLatLng(), map._layers[circle3._leaflet_id].getLatLng(), map._layers[circle4._leaflet_id].getLatLng()])
    })

    circle2.on('rectDrag', function(e) {
        map._layers[circle2._leaflet_id].setLatLng(map._layers[square._leaflet_id].getLatLngs()[0][2])
    })
    circle2.on('drag', function(e) {
        const c1latlng = map._layers[circle1._leaflet_id].getLatLng()
        const c2latlng = map._layers[circle2._leaflet_id].getLatLng()
        const c3latlng = map._layers[circle3._leaflet_id].getLatLng()
        map._layers[circle1._leaflet_id].setLatLng([c2latlng.lat, c1latlng.lng])
        map._layers[circle3._leaflet_id].setLatLng([c3latlng.lat, c2latlng.lng])
        map._layers[square._leaflet_id].setBounds([map._layers[circle1._leaflet_id].getLatLng(), map._layers[circle2._leaflet_id].getLatLng(), map._layers[circle3._leaflet_id].getLatLng(), map._layers[circle4._leaflet_id].getLatLng()])
    })

    circle3.on('rectDrag', function(e) {
        map._layers[circle3._leaflet_id].setLatLng(map._layers[square._leaflet_id].getLatLngs()[0][3])
    })
    circle3.on('drag', function(e) {
        const c2latlng = map._layers[circle2._leaflet_id].getLatLng()
        const c3latlng = map._layers[circle3._leaflet_id].getLatLng()
        const c4latlng = map._layers[circle4._leaflet_id].getLatLng()
        map._layers[circle2._leaflet_id].setLatLng([c2latlng.lat, c3latlng.lng])
        map._layers[circle4._leaflet_id].setLatLng([c3latlng.lat, c4latlng.lng])
        map._layers[square._leaflet_id].setBounds([map._layers[circle1._leaflet_id].getLatLng(), map._layers[circle2._leaflet_id].getLatLng(), map._layers[circle3._leaflet_id].getLatLng(), map._layers[circle4._leaflet_id].getLatLng()])
    })

    circle4.on('rectDrag', function(e) {
        map._layers[circle4._leaflet_id].setLatLng(map._layers[square._leaflet_id].getLatLngs()[0][0])
    })
    circle4.on('drag', function(e) {
        const c1latlng = map._layers[circle1._leaflet_id].getLatLng()
        const c3latlng = map._layers[circle3._leaflet_id].getLatLng()
        const c4latlng = map._layers[circle4._leaflet_id].getLatLng()
        map._layers[circle1._leaflet_id].setLatLng([c1latlng.lat, c4latlng.lng])
        map._layers[circle3._leaflet_id].setLatLng([c4latlng.lat, c3latlng.lng])
        map._layers[square._leaflet_id].setBounds([map._layers[circle1._leaflet_id].getLatLng(), map._layers[circle2._leaflet_id].getLatLng(), map._layers[circle3._leaflet_id].getLatLng(), map._layers[circle4._leaflet_id].getLatLng()])
    })

    // Propagate square drag event to all circles
    square.on('drag', function(e) {
        if(!isCloseToCorners(map._layers[square._leaflet_id], {x: e.originalEvent.layerX + 2, y: e.originalEvent.layerY - 2})) {
            circle1.fire('rectDrag')
            circle2.fire('rectDrag')
            circle3.fire('rectDrag')
            circle4.fire('rectDrag')
        }
    })

    document.getElementById("clip").addEventListener("click", function(e) {
        document.getElementById("clip").disabled = true;
        var array = [];

        const circle1_coords = map._layers[circle1._leaflet_id].getLatLng()
        array.push(circle1_coords)
        const circle2_coords = map._layers[circle2._leaflet_id].getLatLng()
        array.push(circle2_coords)
        const circle3_coords = map._layers[circle3._leaflet_id].getLatLng()
        array.push(circle3_coords)
        const circle4_coords = map._layers[circle4._leaflet_id].getLatLng()
        array.push(circle4_coords)

        var xmax = Math.max.apply(Math, array.map(function(o) { return o.lng; }))
        var xmin = Math.min.apply(Math, array.map(function(o) { return o.lng; }))
        var ymax = Math.max.apply(Math, array.map(function(o) { return o.lat; }))
        var ymin = Math.min.apply(Math, array.map(function(o) { return o.lat; }))

        console.log(xmax, xmin)
        console.log(ymax, ymin)
        // get file array
        var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
        if(fArr === null) {
            document.getElementById("clip").disabled = false;
            return;
        }

        // filter
        var masksFilter = (document.getElementById('masks').checked) ? true : false;
        var bandsFilter = (document.getElementById('bands').checked) ? true : false;
        var demFilter = (document.getElementById('dem').checked) ? true : false;
        fArr = filterInputFArr(fArr, masksFilter, bandsFilter, demFilter)

        // filter by checkbox
        var DomArr = document.getElementById("file-content")
        fArr = filterByCheckboxDOM(fArr, DomArr)

        window.api.clip(xmin, ymin, xmax, ymax, fArr).then(res => {
            if(res.data) {
                window.api.setFileArr(res.data)
                displayFilesFromLocalS()
            }
            document.getElementById("clip").disabled = false;
        })
    })

    layerGroup.addTo(map)
    window.api.setRectId(square._leaflet_id)
}

function isCloseToCorners(rect, coords) {
    var closeEnough = 10;

    if(rect._pxBounds.getTopLeft().distanceTo(coords) < closeEnough) {
        return 1;
    } else if(rect._pxBounds.getTopRight().distanceTo(coords) < closeEnough) {
        return 2;
    } else if(rect._pxBounds.getBottomRight().distanceTo(coords) < closeEnough) {
        return 3;
    } else if(rect._pxBounds.getBottomLeft().distanceTo(coords) < closeEnough) {
        return 4;
    } else {
        return 0;
    }
}

document.getElementById("shp-btn").addEventListener("click", function(e) {
    window.api.openDialog()
    .then(res => {
        if(res['data'] && res['data']['files'] && res['data']['files']['canceled'] !== true) {
            for(const f of res.data.files.filePaths) {
                var shapefile = new L.Shapefile(f, {})

                shapefile.once("data:loaded", function(e) {
                    map.fitBounds(shapefile.getBounds())

                    document.getElementById("clip").addEventListener("click", function(e) {
                        document.getElementById("clip").disabled = true;
                        // get file array
                        var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
                        if(fArr === null) {
                            document.getElementById("clip").disabled = false;
                            return;
                        }

                        // filter
                        var masksFilter = (document.getElementById('masks').checked) ? true : false;
                        var bandsFilter = (document.getElementById('bands').checked) ? true : false;
                        var demFilter = (document.getElementById('dem').checked) ? true : false;
                        fArr = filterInputFArr(fArr, masksFilter, bandsFilter, demFilter)

                        // filter by checkbox
                        var DomArr = document.getElementById("file-content")
                        fArr = filterByCheckboxDOM(fArr, DomArr)

                        window.api.clipShp(res['data']['shp'], fArr).then(res => {
                            if(res.data) {
                                window.api.setFileArr(res.data)
                                displayFilesFromLocalS()
                            }
                            document.getElementById("clip").disabled = false;
                        });
                    })
                })

                shapefile.addTo(map)

            }
        }
    })
});

document.getElementById("dem-btn").addEventListener("click", function(e) {
    window.api.openDemDialog()
    .then(res => {
        window.api.setFileArr([res.data.filename]);
        displayFilesFromLocalS();
        L.rectangle(res.data.coordsDem, {color: "#b20fd6", fill: true, weight: 1}).addTo(map);
        map.fitBounds(res.data.coordsDem);
    })
});

const interpolate = () => {
    document.getElementById("interpolate").disabled = true;

    var inter_method = document.getElementById("interpolation-method").value ?? 'cubic';

    var spatial = document.getElementById("spatial-method").value ?? '1';
    var temporal = document.getElementById("temporal-method").value ?? '1';
    var spectral = document.getElementById("spectral-method").value ?? '1';

    var fArr = JSON.parse(window.localStorage.getItem('file-arr')) ?? [];
    var fOutArr = JSON.parse(window.localStorage.getItem('out-arr')) ?? [];
    fArr = fArr.concat(fOutArr);
    
    if(fArr.length === 0 && fOutArr.length === 0) {
        document.getElementById("interpolate").disabled = false;
        return;
    }
    OArr = fArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER') || res.absPath.includes('ESRGAN') || containsObject(res, fOutArr);
    });
    console.log("Oarr: ", OArr);

    var cropFilter = (document.getElementById('cropFilter').checked) ? true : false;
    var interFilter = (document.getElementById('interFilter').checked) ? true : false;

    OArr = filterOutputArr(OArr, cropFilter, interFilter)
    // filter by checkbox
    var DomArr = document.getElementById("out-content")
    OArr = filterByCheckboxDOM(OArr, DomArr)
    console.log(OArr);
    if(OArr.length > 0) {
        window.api.interpolation(inter_method, spatial, temporal, spectral, OArr).then(res => {
            console.log(res.data)
            if(res.data) {
                window.api.setFileArr(res.data)
                displayFilesFromLocalS()
            }
            document.getElementById("interpolate").disabled = false;
        });
    }
    
}

const esrgan = () => {
    document.getElementById("esrgan").disabled = true;
    var scale;
    var domInter = document.getElementById("interpolation-method").value ?? 'model-2';
    var [_, scale] = domInter.split('-')

    var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
    if(fArr === null) {
        document.getElementById("esrgan").disabled = false;
        return;
    }
    OArr = fArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER');
    });

    var cropFilter = (document.getElementById('cropFilter').checked) ? true : false;
    var interFilter = (document.getElementById('interFilter').checked) ? true : false;

    OArr = filterOutputArr(OArr, cropFilter, interFilter)

    window.api.esrgan(scale, OArr).then(res => {
        console.log(res.data)
        if(res.data) {
            window.api.setFileArr(res.data)
            displayFilesFromLocalS()
        }
        document.getElementById("esrgan").disabled = false;
    });
}

const generateGif = () => {
    document.getElementById("gif-btn").disabled = true;

    var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
    if(fArr === null) {
        document.getElementById("gif-btn").disabled = false;
        return;
    }
    OArr = fArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER') || res.absPath.includes('ESRGAN');
    });

    var cropFilter = (document.getElementById('cropFilter').checked) ? true : false;
    var interFilter = (document.getElementById('interFilter').checked) ? true : false;

    OArr = filterOutputArr(OArr, cropFilter, interFilter)

    window.api.interpolation_gif(OArr).then(res => {
        if(res.data) {
            // Ask the user for a output path
            window.api.saveToDisk(res.data, true)
        }
        document.getElementById("gif-btn").disabled = false;
    });
}

const saveSelected = () => {
    document.getElementById("save-btn").disabled = true;

    var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
    if(fArr === null) {
        document.getElementById("gif-btn").disabled = false;
        return;
    }
    OArr = fArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER') || res.absPath.includes('ESRGAN');
    });

    var cropFilter = (document.getElementById('cropFilter').checked) ? true : false;
    var interFilter = (document.getElementById('interFilter').checked) ? true : false;

    OArr = filterOutputArr(OArr, cropFilter, interFilter)

    window.api.saveToDisk(OArr)

    document.getElementById("save-btn").disabled = false;
}

const gotobounds = () => {
    var lat1 = document.getElementById("lat1").value ?? 0;
    var lng1 = document.getElementById("lng1").value ?? 0;
    var lat2 = document.getElementById("lat2").value ?? 0;
    var lng2 = document.getElementById("lng2").value ?? 0;
    console.log(lat1, lng1);
    console.log(lat2, lng2);
    var bounds = new L.LatLngBounds([lat1, lng1],[lat2,lng2]);
    map.fitBounds(bounds);
    var rect = L.rectangle(bounds, {color: "#8000ff", fill: false, weight: 7, className: "zIn"}).addTo(map);
    console.log(rect)

    document.getElementById("clip").addEventListener("click", function(e) {
        document.getElementById("clip").disabled = true;
        
        if(lng1 < 0 || lng2 < 0) {
            var xmax = lng1 < lng2 ? lng1 : lng2;
            var xmin = lng1 > lng2 ? lng1 : lng2;
        } else {
            var xmax = lng1 > lng2 ? lng1 : lng2;
            var xmin = lng1 < lng2 ? lng1 : lng2;
        }
        
        if(lat1 < 0 || lat2 < 0) {
            var ymax = lat1 > lat2 ? lat1 : lat2;
            var ymin = lat1 < lat2 ? lat1 : lat2;
        } else {
            var ymax = lat1 < lat2 ? lat1 : lat2;
            var ymin = lat1 > lat2 ? lat1 : lat2;
        }
        
        ymax = parseFloat(ymax);
        xmax = parseFloat(xmax);
        ymin = parseFloat(ymin);
        xmin = parseFloat(xmin);

        console.log(xmax, xmin)
        console.log(ymax, ymin)
        // get file array
        var fArr = JSON.parse(window.localStorage.getItem('file-arr'))
        if(fArr === null) {
            document.getElementById("clip").disabled = false;
            return;
        }

        // filter
        var masksFilter = (document.getElementById('masks').checked) ? true : false;
        var bandsFilter = (document.getElementById('bands').checked) ? true : false;
        var demFilter = (document.getElementById('dem').checked) ? true : false;
        fArr = filterInputFArr(fArr, masksFilter, bandsFilter, demFilter)

        // filter by checkbox
        var DomArr = document.getElementById("file-content")
        fArr = filterByCheckboxDOM(fArr, DomArr)

        console.log(fArr);

        window.api.clip(xmin, ymin, xmax, ymax, fArr).then(res => {
            if(res.data) {
                console.log(res.data)
                window.api.setFileArr(res.data)
                displayFilesFromLocalS()
            }
            document.getElementById("clip").disabled = false;
        })
    })
}

const location1 = () => {
    // Caracas
    // Landcover-774926
    // [-66.91001229029871, 10.478305180304138, -66.8955690678936, 10.492599762072599]
    document.getElementById("lng1").value = "-66.91001229029871";
    document.getElementById("lat1").value = "10.478305180304138";
    document.getElementById("lng2").value = "-66.8955690678936";
    document.getElementById("lat2").value = "10.492599762072599";
}

const location2 = () => {
    // Delta
    document.getElementById("lng1").value = "0.8731555938720703";
    document.getElementById("lat1").value = "40.73923145636456";
    document.getElementById("lng2").value = "0.8461189270019532";
    document.getElementById("lat2").value = "40.71878198810119";
}

const location3 = () => {
    // Landcover-772780
    // [5.057259787810987, 52.02123291955552, 5.080296825292204, 52.03544311808207]
    document.getElementById("lng1").value = "5.057259787810987";
    document.getElementById("lat1").value = "52.02123291955552";
    document.getElementById("lng2").value = "5.080296825292204";
    document.getElementById("lat2").value = "52.03544311808207";
}

const generate_metrics = () => {
    // get file array
    var fArr = JSON.parse(window.localStorage.getItem('file-arr')) ?? [];
    var fOutArr = JSON.parse(window.localStorage.getItem('out-arr')) ?? [];
    if(fArr.length === 0 && fOutArr.length === 0) {
        document.getElementById("metrics").disabled = false;
        return;
    }
    
    OArr = fArr.filter((res) => {
        return res.absPath.includes('CROPPED') || res.absPath.includes('INTER') || res.absPath.includes('ESRGAN') || containsObject(res, fOutArr);
    }) ?? [];

    OArr = OArr.concat(fOutArr ?? []);
    console.log("Before");
    console.log(fArr);
    console.log(OArr);

    // filter by checkbox
    var DomfArr = document.getElementById("file-content")
    fArr = filterByCheckboxDOM(fArr, DomfArr)
    var DomArr = document.getElementById("out-content")
    OArr = filterByCheckboxDOM(OArr, DomArr)
    console.log("After");
    console.log(fArr);
    console.log(OArr);
    // window.api.clip(xmin, ymin, xmax, ymax, fArr).then(res => {
    //     if(res.data) {
    //         console.log(res.data)
    //         window.api.setFileArr(res.data)
    //         displayFilesFromLocalS()
    //     }
    //     document.getElementById("clip").disabled = false;
    // })
}

