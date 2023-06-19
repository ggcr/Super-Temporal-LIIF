import { useEffect, useState } from 'react';
import { createWriteStream, supported } from 'streamsaver';
import { WritableStream } from 'web-streams-polyfill/ponyfill/es6';

const refreshTokenValid = async(url, refresh) => {
    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "refresh_token");
    urlencoded.append("refresh_token", refresh);
    urlencoded.append("client_id", "cdse-public");

    var requestOptions = {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded',}),
        body: urlencoded,
        redirect: 'follow'
    };

    let res = await fetch(url, requestOptions)
    .then(response => response.json())

    return (res["refresh_token"] === null)
}

// https://stackoverflow.com/a/64546967
function useLoginToken(refreshTokenKey = 'refreshTokenCVC') {

    const url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"

    const [token, setToken] = useState();

    const [refresh, setRefresh] = useState(() => {
        // check for the refresh token in LocalStorage
        const val = window.localStorage.getItem(refreshTokenKey)
        if(val) {
            return JSON.parse(val)
        }
        return null
    })

    let tok // temporal token

    if(refresh !== null && (tok = refreshTokenValid(url, refresh)) !== undefined) {
        // get a new access token with the refresh token
        var urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "refresh_token");
        urlencoded.append("refresh_token", refresh);
        urlencoded.append("client_id", "cdse-public");
    } else {
        // get a new access token from source
        const username = import.meta.env.VITE_COPERNICUS_USERNAME
        const password = import.meta.env.VITE_COPERNICUS_PASSWORD

        var urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "password");
        urlencoded.append("username", username);
        urlencoded.append("password", password);
        urlencoded.append("client_id", "cdse-public");
    }

    var requestOptions = {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded',}),
        body: urlencoded,
        redirect: 'follow'
    };

    useEffect(() => {
        const fetchData = async(url, requestOptions) => {
            let res = await fetch(url, requestOptions)
            .then(response => response.json())

            let newRefreshToken = (res && res["refresh_token"]) ? res["refresh_token"] : null;
            window.localStorage.setItem(refreshTokenKey, JSON.stringify(newRefreshToken))

            if(res && res["access_token"]) {
                setToken(res["access_token"])
            }
        }
        fetchData(url, requestOptions)
    }, [])

    // Return access token
    return [token, setToken]
}

const downloadWithToken = async (id, token) => {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    let response = await fetch("https://catalogue.dataspace.copernicus.eu/odata/v1/Products(" + id + ")/$value", requestOptions)

    if (!supported) {
        window.WritableStream = WritableStream;
    }
    const filestream = createWriteStream(id + ".zip");
    const writer = filestream.getWriter();

    if (response.body.pipeTo) {
        writer.releaseLock();
        return response.body.pipeTo(filestream);
    }

    const reader = response.body.getReader();

    const pump = () =>
        reader
            .read()
            .then(({ value, done }) => (done ? writer.close() : writer.write(value).then(pump)));

    pump();
};

export { useLoginToken, downloadWithToken };