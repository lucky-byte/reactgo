import { Routes, Route } from 'react-router-dom';
import NotFound from "~/route/notfound";
import Home from "./home";

export default function OIDC() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
