
export default function DateEmpty({order, value}) {

    return(
        <div className={`flex text-gray-600 items-center justify-center border-gray-300 w-[8rem] text-sm border py-2 rounded-md ${order === 1 ? "rounded-r-none " : "rounded-l-none border-l-0"}`}>
            {(order === 1) ? "Start Date" : "End Date"}
        </div>
    )
}