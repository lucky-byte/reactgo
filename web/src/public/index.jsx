import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Bulletin from "./bulletin";

export default function Public() {
  return (
    <Routes>
      <Route path='/bulletin/*' element={<Bulletin />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
