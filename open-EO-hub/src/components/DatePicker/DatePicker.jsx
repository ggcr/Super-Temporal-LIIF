import { useState, useRef, useEffect } from 'react';
import DateEmpty from './DateEmpty';
import DateSingle from './DateSingle';

export default function DatePicker({dateFilter, setDateFilter, check, setCheck}) {

    const [startDate, setStartDate] = useState(dateFilter.startDate)
    const [endDate, setEndDate] = useState(dateFilter.endDate)

    const handleChange = (e) => {
        setCheck(!check)
    }

    useEffect(() => {
        if(startDate !== null || endDate !== null) {
            setDateFilter({startDate: startDate, endDate: endDate})
        }
    }, [startDate, endDate])

    return (

        <div className="flex -space-x-px w-72 z-[2000] mb-3.5">

            <input checked={check} onChange={handleChange} id="helper-checkbox" aria-describedby="helper-checkbox-text" type="checkbox" value="1" className="w-4 h-4 mt-[0.68rem] mr-2.5 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-0" />

            { (check)
                ?
                <div className="flex">
                    <DateSingle order={1} date={startDate} setDate={setStartDate} />
                    <DateSingle order={2} date={endDate} setDate={setEndDate} />
                </div>
                :
                <div className="flex">
                    <DateEmpty order={1}/>
                    <DateEmpty order={2}/>
                </div>
            }
          </div>
    )
}