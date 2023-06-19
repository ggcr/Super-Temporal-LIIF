import ResultsHeader from "./ResultsHeader";
import ResultsFooter from "./ResultsFooter";
import {saveAs} from "file-saver";
import Loading from "../Loading";
import ResultsEmpty from "./ResultsEmpty";
import { useEffect, useState } from "react";
import { downloadWithToken } from "../../api/copernicus";


function getTitledDate(startDate) {
    let d = new Date(startDate)
    return "".concat(d.getFullYear(), ('0' + d.getMonth() + 1).slice(-2), ('0' + d.getDate()).slice(-2), d.getMinutes())
}

export default function Results({response, loading, setPage, setSelectedId, page, setProvider, providers, provider, token, dateFilter, setDateFilter, check, setCheck}) {
    const [downloadId, setDownloadId] = useState(null)

    useEffect(() => {
        if(downloadId !== null) {
            downloadWithToken(downloadId, token)
        }
    }, [downloadId])

    console.log(response)

    return (
        <div className="flex flex-col w-full h-full ">
            {(loading) &&
                <Loading/>
            }
            {(!response && !loading) &&
                <ResultsEmpty />
            }
            <ResultsHeader
                response={response}
                loading={loading}
                setProvider={setProvider}
                providers={providers}
                provider={provider}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                check={check}
                setCheck={setCheck}
            />
            <main className="flex flex-col grow">
                {(response && !loading) ? response.features.map((f) =>
                <div className="flex items-center justify-between grow border-t-2 border-slater-500 p-[0.5vw] " key={f.id}>
                    <div className="flex items-center">
                        { (! f.stac_version && f.properties.thumbnail === null)
                        ? <div className="w-28 h-28 bg-gray-200 animate-pulse rounded-md text-center place-content-center"></div>
                        : (f.assets && f.assets['thumbnail'] || f.properties && f.properties['thumbnail'])
                            ? <img className="w-28 h-28" src={(f.stac_version) ? f.assets.thumbnail.href : f.properties.thumbnail} />
                            : <img className="w-28 h-28" src={(f.assets && f.assets.rendered_preview) ? f.assets.rendered_preview.href : ''} />
                        }
                        <div className="flex flex-col gap-y-0.6 mb-2 ml-4">
                            <p className="text-base font-semibold truncate 2xl:w-auto xl:w-64">{(f.stac_version)
                                ? f.id
                                : f.properties.platform.concat("_", f.properties.processingLevel, "_", f.properties.instrument, "_", getTitledDate(new Date(f.properties.startDate)))
                            }</p>
                            <div className="text-xs text-slate-600">{(f.stac_version) ? f.properties.platform : f.properties.collection}</div>
                            <div className="text-xs text-slate-600">{new Date((f.stac_version) ? f.properties.datetime : f.properties.published).toLocaleDateString('es-ES')}</div>
                            <div className="text-xs text-slate-600">{new Date((f.stac_version) ? f.properties.datetime : f.properties.published).toLocaleTimeString()}</div>
                            <div className="text-xs text-slate-600">{(f.stac_version) ? 'GSD ' + f.properties.gsd : (f.properties.resolution) ? f.properties.resolution : 'Platform ' + f.properties.platform}</div>
                            <div className="text-xs text-slate-600">{(f.stac_version) ? 'Cloud Cover ' + f.properties["eo:cloud_cover"] + '%' : 'Cloud Cover ' + Math.round(f.properties.cloudCover * 100) / 100 + '%'}</div>
                        </div>
                    </div>
                    <div className="grow flex flex-col w-48 self-start">
                        <div className="flex flex-wrap gap-y-1 w-full justify-end self-end">
                        {f.assets && f.assets.overview && f.assets.overview.type && f.assets.overview.type.split(';').map((item, id) => {
                            if (item.indexOf('profile') !== -1) return (
                                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full" key={id}>
                                    {item.substr(item.indexOf('profile') + 'profile'.length + 1).toUpperCase()}
                                </span>
                            )
                        })}
                        {f.properties && f.properties.bands ?
                                <span className="bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full" key={f.id}>
                                    {f.properties.bands} BANDS
                                </span>
                            :
                                <span className="bg-white-100 h-3" key={f.id}>
                                    {}
                                </span>
                        }
                        </div>
                        <div className="flex flex-col justify-end self-end items-end mt-[2.5vw] pr-2">

                            {/* <a target="_blank" onClick={() => saveAs((f.stac_version) ? f.assets.thumbnail.href : f.properties.thumbnail, f.id + ".jpg")} className="cursor-pointer 2xl:text-base lg:text-sm font-medium text-blue-600 hover:underline">Thumbnail</a> */}
                            <span className="isolate inline-flex rounded-md shadow-sm">
                            { (f.stac_version || f.properties.thumbnail) &&
                                <button
                                    onClick={() => saveAs((f.stac_version) ? f.assets.thumbnail.href : f.properties.thumbnail, f.id + ".jpg")}
                                    type="button"
                                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            }

                                { (f.stac_version && provider.id === "SL2-COGS")
                                ?   <button onClick={() => setSelectedId(f.id)}
                                        type="button"
                                        className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                    </button>
                                :  (provider.id === "CopDemGlo30" || provider.id === "CopDemGlo90")
                                    ?
                                        <button
                                            onClick={() => saveAs((f.assets.data) ? f.assets.data.href : '', f.id + ".tif")}
                                            type="button"
                                            className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                                            </svg>

                                        </button>
                                    :
                                        <button onClick={() => setDownloadId(f.id)}
                                            type="button"
                                            className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                                            </svg>

                                        </button>

                                }

                            </span>
                        </div>

                    </div>
                </div>
                )
                : [...Array(4)].map((e, i) =>
                <div className="flex items-center justify-between grow border-t-2 border-gray-100 p-[0.5vw] animate-pulse" key={i}>
                    <div className="flex items-center">
                        <div className="w-28 h-28 bg-gray-100"></div>
                        <div className="flex flex-col gap-y-0.6 mb-2 ml-4">
                            <p className="bg-gray-100 h-3 w-56 rounded-full my-2">{}</p>
                            <div className="bg-gray-100 h-2 w-28 rounded-full my-1">{}</div>
                            <div className="bg-gray-100 h-2 w-28 rounded-full my-1">{}</div>
                            <div className="bg-gray-100 h-2 w-28 rounded-full my-1">{}</div>
                            <div className="bg-gray-100 h-2 w-28 rounded-full my-1">{}</div>
                            <div className="bg-gray-100 h-2 w-28 rounded-full my-1">{}</div>
                        </div>
                    </div>
                    <div className="grow flex flex-col w-48 self-start">
                        <div className="flex flex-wrap gap-y-1 gap-x-2 w-full justify-end self-end">
                            <span className="bg-gray-100 h-2 w-18 rounded-full my-1">{}</span>
                            <span className="bg-gray-100 h-2 w-20 rounded-full my-1">{}</span>
                            <span className="bg-gray-100 h-2 w-8 rounded-full my-1">{}</span>
                        </div>
                        <div className="flex flex-col justify-end self-end mt-[3.5vw] pr-2">
                            <span className="bg-gray-100 h-2 w-20 rounded-full my-1">{}</span>
                            <span className="bg-gray-100 h-2 w-20 rounded-full my-1">{}</span>
                        </div>

                    </div>
                </div>
                )
                }
            </main>
            <ResultsFooter response={response} loading={loading} setPage={setPage} pageprop={page}/>
        </div>
    )
};