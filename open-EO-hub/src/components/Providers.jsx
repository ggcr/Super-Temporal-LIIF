import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const providers = [
  { id: 'SL2-COGS', name: 'Sentinel L2 CO ⚡️', color: 'bg-green-400' },
  { id: 'Sentinel1', name: 'Sentinel 1', color: 'bg-orange-200' },
  { id: 'Sentinel2', name: 'Sentinel 2', color: 'bg-purple-400' },
  { id: 'Sentinel3', name: 'Sentinel 3', color: 'bg-emerald-300' },
  { id: 'Sentinel5p', name: 'Sentinel 5P', color: 'bg-cyan-400' },
  { id: 'Landsat5', name: 'Landsat 5', color: 'bg-yellow-300' },
  { id: 'Landsat7', name: 'Landsat 7', color: 'bg-slate-300' },
  { id: 'Landsat8', name: 'Landsat 8', color: 'bg-sky-300' },
  { id: 'CopDemGlo30', name: 'DEM GLO-30', color: 'bg-orange-300' },
  { id: 'CopDemGlo90', name: 'DEM GLO-90', color: 'bg-yellow-300' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Providers({setProvider, providers, provider}) {

  return (
    <Listbox value={provider} onChange={setProvider} className="z-[2000]">
      {({ open }) => (
        <div>
          {/* <Listbox.Label className="block text-xs font-medium text-gray-700 py-0">Filter by Provider:</Listbox.Label> */}
          <div className="relative mt-0 pb-4 w-54 md:w-36 z-[2000]">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="flex items-center">
                <span
                  className={classNames(
                    provider.color,
                    'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                  )}
                />
                <span className="ml-3 block truncate">{provider.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {providers.map((provider) => (
                  <Listbox.Option
                    key={provider.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-indigo-600' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={provider}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              provider.color,
                              'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                          >
                            {provider.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  )
}
