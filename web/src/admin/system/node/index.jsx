import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import User from "./user";

export default function Node() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='user' element={<User />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
