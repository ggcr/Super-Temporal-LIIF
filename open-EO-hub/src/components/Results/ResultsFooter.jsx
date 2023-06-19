import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function ResultsFooter({response, loading, setPage, pageprop}) {
    if (response && !loading) {
        let page=(response.context) ? response.context.page : pageprop ?? 1
        let limit=4
        let total=(response.context) ? response.numberMatched : (response.properties && response.properties.totalResults) ? response.properties.totalResults : 999

        return (
            <footer className="flex items-center justify-between font-sans font-normal text-base px-2 pb-2 pt-3 border-t-2">
                <p className="text-slate-600">Showing <span className="font-semibold text-slate-800">{(page * limit)-(limit-1)}</span> to <span className="font-semibold text-slate-800">{(page*limit < total) ? page*limit : total}</span> of <span className="font-semibold text-slate-800">{total}</span> results</p>
                <div>
                {(page !== 1) &&
                    <button type='button' onClick={() => setPage(page-1)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700">
                    Previous
                    </button>
                }
                {(page * limit < total) &&
                    <button type='button' onClick={() => setPage(page+1)} className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700">
                    Next
                    </button>
                }
                </div>
            </footer>
        )
    } else {
        return(
            <div className="flex animate-pulse items-center justify-between font-sans font-normal text-base px-2 pb-2 pt-3 border-t-2">
                <div className="bg-gray-200 h-2.5 w-60 mt-3 mb-2 rounded-full"></div>
                <div>
                <div className="inline-flex items-center px-4 mr-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700">
                    <span className='bg-gray-200 h-2.5 w-16 my-1 rounded-full'></span>
                </div>
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700">
                    <span className='bg-gray-200 h-2.5 w-10 my-1 rounded-full'></span>
                </div>
                </div>
            </div>
        )
    }
};