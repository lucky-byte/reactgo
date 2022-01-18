import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import BankManage from "./manage";

export default function Bank() {
  return (
    <Routes>
      <Route path='manage/*' element={<BankManage />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
