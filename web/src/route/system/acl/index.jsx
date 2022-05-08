import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import Add from "./add";
import Allows from "./allows";

export default function Acl() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='add' element={<Add />} />
      <Route path='allows' element={<Allows />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
