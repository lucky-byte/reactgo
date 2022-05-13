import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import List from "./list";
import Item from "./item";
import Setting from "./setting";

export default function Notification() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='setting' element={<Setting />} />
      <Route path=':uuid' element={<Item />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
