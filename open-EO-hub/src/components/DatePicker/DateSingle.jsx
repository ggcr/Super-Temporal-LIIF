import { useEffect, useRef } from "react"

export default function DateSingle({order, date, setDate}) {
    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);

    const handleChange = (e) => {
        if(e.target.id === "day") {
            if(dayRef.current.value > 3 || dayRef.current.value.length == 2) {
                monthRef.current.focus()
            }
        } else if(e.target.id === "month") {
            if(monthRef.current.value > 1 || monthRef.current.value.length == 2) {
                yearRef.current.focus()
            }
        } else {
            if(yearRef.current.value.length == 4) {
                yearRef.current.blur();
                let d = new Date()
                d.setFullYear(yearRef.current.value)
                d.setMonth(Number(monthRef.current.value) - 1)
                d.setDate(dayRef.current.value)
                setDate(d.toISOString())
            }
        }
    }

    const resetVal = (e) => {
        if(e.target.id === "day") {
            dayRef.current.value = ""
        } else if(e.target.id === "month") {
            monthRef.current.value = ""
        } else {
            yearRef.current.value = ""
        }
    }

    useEffect(() => {
        if(date) {
            let d = new Date(date)
            dayRef.current.value = d.getDate()
            monthRef.current.value = d.getMonth() + 1
            yearRef.current.value = d.getFullYear()
        }
    }, [date])

    return(
        <div className={`flex items-center justify-center border-gray-300 w-[8rem] text-xs text-gray-500 border py-2 rounded-md ${order === 1 ? "rounded-r-none " : "rounded-l-none border-l-0"}`}>
            <input
                ref={dayRef}
                onChange={handleChange}
                onClick={resetVal}
                type="text"
                id="day"
                placeholder="dd"
                className="w-[1rem] p-0 m-0 border-0 mx-2 text-sm text-gray-500 placeholder:text-slate-400 text-center rounded-sm caret-transparent focus:text-white focus:placeholder:text-white focus:bg-indigo-500 ring-0"
                autoComplete="off"
            />
            <span>/</span>
            <input
                ref={monthRef}
                onChange={handleChange}
                onClick={resetVal}
                type="text"
                id="month"
                placeholder="mm"
                className="w-[1.5rem] p-0 m-0 border-0 mx-1 text-sm text-gray-500 placeholder:text-slate-400 text-center rounded-sm caret-transparent focus:text-white focus:placeholder:text-white focus:bg-indigo-500 ring-0"
                autoComplete="off"
            />
            <span>/</span>
            <input
                ref={yearRef}
                onChange={handleChange}
                onClick={resetVal}
                type="text"
                id="year"
                placeholder="yyyy"
                className="w-[2.5rem] p-0 m-0 border-0 mx-1 text-sm text-gray-500 placeholder:text-slate-400 text-center rounded-sm caret-transparent focus:text-white focus:placeholder:text-white focus:bg-indigo-500 ring-0"
                autoComplete="off"
            />

        </div>
    )
}