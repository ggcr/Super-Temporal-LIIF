import React, {useEffect, useState, useRef, useCallback} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap, Rectangle } from 'react-leaflet';
import { Icon } from "leaflet";
import useLocalStorage from "../../hooks/useLocalStorage";
import SelectionControl from "../components/SelectionControl";

const defaultCoords = [50, 50]

function MapModifications({userCoords}) {
    const map = useMap()

    // Prevent page to scroll when zooming the map
    useEffect(() => {
        map.getContainer().focus = ()=>{}
    })

    // Initial animation to user-coords
    useEffect(() => {
        if(userCoords !== defaultCoords) {
            map.flyTo(userCoords, 9, {
                animate: true,
                duration: 3
            });
        }
    }, [userCoords])

    return null
}

function Map(props) {
    const [coords, setCoords] = useLocalStorage("client-coords", defaultCoords)
    const mapRef = useRef(null)
    const rectRef = useRef(null)

    const defaultRec = [[0, 0], [0, 0]];

    function success(pos) {
        setCoords([pos.coords.latitude, pos.coords.longitude])
    }

    // Read the user-coords
    useEffect(() => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success)
        }
    }, [])

    const rectangle = (props.userCoords.coordsFi)
    ? [props.userCoords.coordsIn, props.userCoords.coordsFi]
    : defaultRec;

    const rectOptions = { color: "#4c4c4c", weight: 0.5}

    return (
        <MapContainer ref={mapRef} center={coords} zoom={3} onClick={() => {clickedMap()}}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapModifications userCoords={coords} />
            <div className="flex flex-row w-[100%] justify-end">
            <SelectionControl className="w-[120px]" mapRef={mapRef} rectRef={rectRef} setUserCoords={props.setUserCoords} setResponse={props.setResponse} setPage={props.setPage} setSelectedId={props.setSelectedId}/>
            </div>
            <Rectangle ref={rectRef} bounds={rectangle} pathOptions={rectOptions} />

        </MapContainer>
    );
}

export default Map;