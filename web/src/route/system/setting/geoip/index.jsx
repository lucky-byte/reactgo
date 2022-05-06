import { Route, Routes } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";

export default function Geoip() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
