import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import List from "./list";
import Add from "./add";

export default function Bulletin() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='add' element={<Add />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
