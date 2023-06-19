import { useLoginToken } from "./api/copernicus"
import Home from "./pages/Home"
import { useState } from "react";

export default function App() {
    const [token, setToken] = useLoginToken();

    return (
        <Home token={token}/>
    )
}