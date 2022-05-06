import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Reset from "./reset";
import SMS from "./sms";
import Success from "./success";

export default function Index() {
  return (
    <Routes>
      <Route path='/' element={<Reset />} />
      <Route path='sms' element={<SMS />} />
      <Route path='success' element={<Success />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
