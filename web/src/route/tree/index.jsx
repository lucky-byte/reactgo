import { Routes, Route } from "react-router-dom";
import Home from "./home";

export default function Tree() {
  return (
    <Routes>
      <Route path='*' element={<Home />} />
    </Routes>
  )
}
