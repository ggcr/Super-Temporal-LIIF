
export default function DetailsHeader({id, setSelectedId}) {
    return(
        <div role="status" className="flex flex-row justify-start gap-x-5 items-center px-3 py-3 z-[2000]">
            <div>
            <a onClick={() => setSelectedId(null)} className="cursor-pointer flex items-center px-5 py-3 text-base font-normal text-gray-900 border-2 border-slate-300 rounded-lg bg-slate-200 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                </svg>

               {/* <span class="flex-1 ml-3 whitespace-nowrap">Back</span> */}
            </a>
            </div>
            <div>
                <h1 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">{id}</h1>
            </div>
        </div>
    )
}