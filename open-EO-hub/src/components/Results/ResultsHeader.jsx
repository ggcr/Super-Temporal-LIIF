import Providers from "../Providers"
import DatePicker from '../DatePicker/DatePicker'

export default function ResultsHeader({response, loading, setProvider, providers, provider, dateFilter, setDateFilter, check, setCheck}) {
    if (response && !loading) {
        return(
            <header className="flex flex-row justify-between items-center px-3 py-1">
                <div className="py-2">
                    <h1 className="font-inter font-semibold text-2xl text-slate-700 leading-6">Results</h1>
                    <h4 className="font-inter font-normal text-base text-slate-500">Data fetched</h4>
                </div>
                <div className="flex flex-row 2xl:flex-col align-middle items-center gap-x-4">
                <DatePicker dateFilter={dateFilter} setDateFilter={setDateFilter} check={check} setCheck={setCheck}/>
                <Providers setProvider={setProvider} providers={providers} provider={provider}/>
                </div>
            </header>
        )
    } else {
        return(
            <div role="status" className="flex flex-row justify-between items-center px-3 py-1">
                <div className="py-2">
                    <h1 className="font-inter font-semibold text-2xl text-slate-700 leading-6">Results</h1>
                    <h4 className="animate-pulse h-3 bg-gray-200 rounded-full w-[120px] mt-2.5 mb-1"></h4>
                </div>
                <div className="flex align-middle items-center gap-x-4">
                <DatePicker dateFilter={dateFilter} setDateFilter={setDateFilter} check={check} setCheck={setCheck}/>
                <Providers setProvider={setProvider} providers={providers} provider={provider}/>
                </div>
                <span className="sr-only">Loading...</span>
            </div>
        )
    }
};