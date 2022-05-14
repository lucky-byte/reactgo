import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import List from "./list";
import Item from "./item";

export default function Bulletin() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path=':uuid' element={<Item />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
