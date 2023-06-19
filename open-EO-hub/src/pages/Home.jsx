import Map from '../map/container/Map'
import Results from '../components/Results/Results'
import Details from '../components/Details/Details'
import Providers from '../components/Providers'
import HomeHeader from '../static/HomeHeader'
import { useEffect, useState } from 'react'
import FAQ from '../static/FAQ'

const providers = [
  // STAC
  { id: 'SL2-COGS', name: 'Sentinel L2 CO ⚡️', color: 'bg-green-400', collection: 'sentinel-s2-l2a-cogs', url: 'https://earth-search.aws.element84.com/v0/search' },
  { id: 'CopDemGlo30', name: 'DEM 30', color: 'bg-orange-300', collection: 'cop-dem-glo-30', url: 'https://planetarycomputer.microsoft.com/api/stac/v1/search'  },
  { id: 'CopDemGlo90', name: 'DEM 90', color: 'bg-yellow-300', collection: 'cop-dem-glo-90', url: 'https://planetarycomputer.microsoft.com/api/stac/v1/search' },
  // NON STAC
  { id: 'Sentinel1', name: 'Sentinel 1', color: 'bg-orange-200', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/' },
  { id: 'Sentinel2', name: 'Sentinel 2', color: 'bg-purple-400', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/' },
  { id: 'Sentinel3', name: 'Sentinel 3', color: 'bg-emerald-300', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/'  },
  { id: 'Sentinel5p', name: 'Sentinel 5P', color: 'bg-cyan-400', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/'  },
  { id: 'Landsat5', name: 'Landsat 5', color: 'bg-yellow-300', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/'  },
  { id: 'Landsat7', name: 'Landsat 7', color: 'bg-slate-300', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/'  },
  { id: 'Landsat8', name: 'Landsat 8', color: 'bg-sky-300', url: 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/'  },
]

export default function Home({token}) {
  const [userCoords, setUserCoords] = useState({coordsIn: null, coordsFi: null})
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(null)
  const [page, setPage] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [postreq, setPostreq] = useState()
  const [provider, setProvider] = useState(providers[0])
  const [dateFilter, setDateFilter] = useState({startDate: null, endDate: null})
  const [check, setCheck] = useState(false)

  useEffect(() => {
    if(userCoords.coordsIn !== null && userCoords.coordsFi !== null) {
      async function fetchData(setLoading) {

          // small offset for pointer selection
          if(userCoords.coordsIn.lat == userCoords.coordsFi.lat && userCoords.coordsIn.lng == userCoords.coordsFi.lng) {
            userCoords.coordsFi.lat += 0.000000001
            userCoords.coordsFi.lng += 0.000000001
          }

          let url = ""
          console.log(provider.id)
          if(provider.id === "SL2-COGS" || provider.id === "CopDemGlo30" || provider.id === "CopDemGlo90") {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
              "collections": [
                provider.collection
              ],
              "bbox": [
                (userCoords.coordsIn["lng"] < userCoords.coordsFi["lng"]) ? userCoords.coordsIn["lng"]: userCoords.coordsFi["lng"],
                (userCoords.coordsIn["lat"] < userCoords.coordsFi["lat"]) ? userCoords.coordsIn["lat"]: userCoords.coordsFi["lat"],
                (userCoords.coordsIn["lng"] < userCoords.coordsFi["lng"]) ? userCoords.coordsFi["lng"]: userCoords.coordsIn["lng"],
                (userCoords.coordsIn["lat"] < userCoords.coordsFi["lat"]) ? userCoords.coordsFi["lat"]: userCoords.coordsIn["lat"],
              ],
              "limit": "4",
              "page": (page) ? page.toString() : "1",
              "datetime": (dateFilter.startDate !== null && dateFilter.endDate !== null) ? dateFilter.startDate + '/' + dateFilter.endDate : "",
            });

            var JSONraw = JSON.parse(raw);
            if(JSONraw["datetime"] === "") {
              delete JSONraw.datetime;
            }
            raw = JSON.stringify(JSONraw);

            console.log(raw)

            var requestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: raw,
              redirect: 'follow'
            };

            setLoading(true)
            var provUrl = (provider.id === "SL2-COGS") ? "https://earth-search.aws.element84.com/v0/search" : "https://planetarycomputer.microsoft.com/api/stac/v1/search"
            const data = await fetch(provUrl, requestOptions).then(response => response.json())
            setLoading(false)

            setSelectedId(null)
            setResponse(data)
          } else {
            // calculate the center point (x1 + x2) / 2, (y1 + y2) / 2
            var ctrlPoint = [(userCoords.coordsFi.lat + userCoords.coordsIn.lat) / 2, (userCoords.coordsFi.lng + userCoords.coordsIn.lng) / 2]

            let params = {
              "lon": ctrlPoint[1],
              "lat": ctrlPoint[0],
              "maxRecords": "4",
              "sortParam": "startDate",
              "sortOrder": "descending",
              "page": page ?? 1,
            };

            if(dateFilter.startDate !== null && dateFilter.endDate !== null) {
              params = {...params, startDate: dateFilter.startDate, completionDate: dateFilter.endDate }
            }

            let query = Object.keys(params)
                          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
                          .join('&');

            let url = 'https://catalogue.dataspace.copernicus.eu/resto/api/collections/' + provider.id + '/' + 'search.json?' + query;
            setLoading(true)
            const data = await fetch(url).then(response => response.json())
            setLoading(false)

            setSelectedId(null)
            setResponse(data)
          }
        }
        fetchData(setLoading)
      }
  }, [userCoords, page])

  return (
    <div className="bg-gray-50">
      <div className="relative overflow-hidden">
        <HomeHeader />
        <main className='relative w-[70vw] md:w-[90vw] sm:w-[95vw] mx-auto z-10 pb-60'>
          <div className='max-h-fit bg-gradient-to-r border border-slate-400 from-indigo-500 mx-4 rounded-3xl flex shadow-2xl'>
            <div className='w-1/2 m-3 mr-0 pl-3 pr-2 py-2 text-2xl bg-white rounded-l-2xl overflow-clip'>
            { (!selectedId)
            ?
              <Results
                response={response}
                loading={loading}
                setPage={setPage}
                setSelectedId={setSelectedId}
                page={page}
                setProvider={setProvider}
                providers={providers}
                provider={provider}
                token={token}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                check={check}
                setCheck={setCheck}
              />
            :
              <Details
                id={selectedId}
                setSelectedId={setSelectedId}
                feature={response.features.find(item => item.id === selectedId)}
              />
            }
            </div>
            <div className='w-1/2 m-3 ml-0 bg-white rounded-r-2xl overflow-clip'>
              <Map
                userCoords={userCoords}
                setUserCoords={setUserCoords}
                setResponse={setResponse}
                setPage={setPage}
                setSelectedId={setSelectedId}
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
