import { Route, Routes } from "react-router-dom";
import NotFound from "~/route/notfound";
import Add from "./add";
import Info from "./info";
import Modify from "./modify";
import Settings from "./settings";

export default function Mail() {
  return (
    <Routes>
      <Route path='/' element={<Settings />} />
      <Route path='add' element={<Add />} />
      <Route path='modify' element={<Modify />} />
      <Route path='info' element={<Info />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
