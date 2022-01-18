import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import BankDevelop from "./bank";
import MerchDevelop from "./merch";

export default function Develop() {
  return (
    <Routes>
      <Route path='bank/*' element={<BankDevelop />} />
      <Route path='merch/*' element={<MerchDevelop />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
