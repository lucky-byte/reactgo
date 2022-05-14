import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import SMS from "./sms";
import Success from "./success";

export default function Index() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='sms' element={<SMS />} />
      <Route path='success' element={<Success />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
