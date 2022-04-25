import { Route, Routes } from "react-router-dom";
import NotFound from "~/route/notfound";
import Home from "./home";
import TxSMS from "./txsms";

export default function SMS() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='txsms/*' element={<TxSMS />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
