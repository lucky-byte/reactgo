import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import Node from "./node";

export default function Tree() {
  return (
    <Routes>
      <Route path='node/*' element={<Node />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
