import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import Item from "./item";

export default function Bulletin() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path=':uuid' element={<Item />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
