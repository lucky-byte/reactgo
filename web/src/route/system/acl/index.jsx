import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Add from "./add";
import Allows from "./allows";
import List from "./list";

export default function Acl() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='add' element={<Add />} />
      <Route path='allows' element={<Allows />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
