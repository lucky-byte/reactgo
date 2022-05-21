import { Route, Routes } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import Add from "./add";
import Info from "./info";
import Modify from "./modify";

export default function Mail() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='add' element={<Add />} />
      <Route path='modify' element={<Modify />} />
      <Route path='info' element={<Info />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
