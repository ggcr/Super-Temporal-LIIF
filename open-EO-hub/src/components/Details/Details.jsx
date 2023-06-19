import { useEffect, useState } from "react";
import DetailsHeader from "./DetailsHeader";
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import Loading from "../Loading";

export default function Details({id, setSelectedId, feature}) {
    const [canonical, setCanonical] = useState(null)
    const [loading, setLoading] = useState(null)

    useEffect(() => {
        async function fetchData(setLoading) {
            var requestOptions = {
            method: 'GET',
            redirect: 'follow'
            };

            setLoading(true)
            const data = await fetch(feature.links.find(item => item.rel === 'canonical').href, requestOptions).then(response => response.json())
            setLoading(false)

            setCanonical(data)
        }
        fetchData(setLoading)
      }, [id])

    return (
        <div className="flex flex-col w-full h-[28.4em] ">
            <DetailsHeader id={id} setSelectedId={setSelectedId} />
            {(loading)
            ?
                <Loading />
            :
            <div className="overflow-scroll p-2 rounded">
            {(canonical) &&
            <div className="flex justify-between p-0">
                <div>
                    <h4 className="px-4 py-1 uppercase text-sm font-bold border-t">General info</h4>
                    <ul className="pb-4">
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Constellation <span className="font-mono text-base bg-indigo-100 px-2 py-[0.1rem] rounded">{canonical.properties.constellation}</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Datetime <span className="font-mono text-base bg-indigo-100 px-2 py-[0.1rem] rounded">{new Date(canonical.properties.datetime).toLocaleDateString('es-ES')}</span>
                        </li>
                    </ul>
                    <h4 className="px-4 py-1 uppercase text-sm font-bold border-t">Percentages (100%)</h4>
                    <ul className="pb-4 whitespace-nowrap">
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Cloud Cover <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["eo:cloud_cover"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Cloud Shadow <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:cloud_shadow_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Dark Features <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:dark_features_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            High Proba Clouds <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:high_proba_clouds_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Medium Proba Clouds <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:medium_proba_clouds_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            No Data Pixel <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:nodata_pixel_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Not Vegetated <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:not_vegetated_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Snow Ice <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:snow_ice_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Thin Cirrus <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:thin_cirrus_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Unclassified <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:unclassified_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Vegetation <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:vegetation_percentage"]} %</span>
                        </li>
                        <li className="px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50 text-lg font-normal text-gray-900">
                            Water <span className="font-mono text-base bg-green-100 px-2 py-[0.1rem] rounded">{canonical.properties["s2:water_percentage"]} %</span>
                        </li>
                    </ul>
                </div>
                <div className="px-4 rounded-lg overflow-hidden">
                    <img src={canonical.assets.thumbnail.href} className="rounded overflow-hidden"/>
                </div>
            </div>
            }
                    <dl className="divide-y-reverse border-2 rounded-xl mx-1 mr-6">
                    {(canonical) && Object.keys(canonical.assets).map((item, id) => (
                        (canonical.assets[item].href[0] === "h") && // get only the http accesible
                            <Disclosure as="div" key={id} className="group border-t px-6 pr-2 py-4 first:border-0 first:rounded-t-xl last:border-b-0 last:rounded-b-xl odd:bg-slate-100">
                            {({ open }) => (
                                <>
                                <dt className="">
                                    <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                                    <span className="transition-all text-lg font-medium text-slate-600 group-hover:text-slate-800 leading-7">{canonical.assets[item].title ?? item}</span>
                                    <span className="ml-6 flex h-7 items-center">
                                    { canonical.assets[item].type.split(';').map((item) => {
                                        if (item.indexOf('application') !== -1 ) {
                                            return (
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                                                {item.substr(item.indexOf('application') + 'application'.length + 1).toUpperCase()}
                                            </span>
                                            )
                                        } else if (item.indexOf('image') !== -1) {
                                            return (
                                            <span className="bg-orange-100 text-orange-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                                                {item.substr(item.indexOf('image') + 'image'.length + 1).toUpperCase()}
                                            </span>
                                            )
                                        }
                                        })
                                    }
                                    { (canonical.assets[item]["proj:shape"]) && <span className="whitespace-nowrap bg-pink-100 text-pink-800 text-xs font-normal mr-2 px-1.5 py-0.5 rounded ">{canonical.assets[item]["proj:shape"][0]} x {canonical.assets[item]["proj:shape"][1]}</span>}
                                    {(canonical.assets[item]["href"]) &&
                                        <a href={canonical.assets[item]["href"]} download target="_parent">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 stroke-slate-700">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                                            </svg>
                                        </a>
                                    }

                                    {open ? (
                                    <MinusSmallIcon className="transition-all h-8 w-8 stroke-slate-500 group-hover:stroke-slate-700" aria-hidden="true" />
                                    ) : (
                                    <PlusSmallIcon className="transition-all h-8 w-8 stroke-slate-500 group-hover:stroke-slate-700" aria-hidden="true" />
                                    )}
                                    </span>
                                    </Disclosure.Button>
                                </dt>
                                <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                    <p className="text-base leading-7 text-gray-600">Lorem Ipsum</p>
                                </Disclosure.Panel>
                                </>
                            )}
                            </Disclosure>
                    ))}
                    </dl>
            </div>
            }
        </div>
    )
};