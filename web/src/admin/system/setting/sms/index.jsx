import { Route, Routes } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import Info from "./info";
import TencentAdd from "./tencent/add";
import TencentModify from "./tencent/modify";

export default function SMS() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='tencent/add' element={<TencentAdd />} />
      <Route path='tencent/modify' element={<TencentModify />} />
      <Route path='info' element={<Info />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
