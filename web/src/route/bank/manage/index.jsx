import { Routes, Route } from "react-router-dom";
import NotFound from "../../notfound";
import BankList from "./list";
import BankAdd from "./add";
import BankProfile from "./profile";
import BankInfo from "./info";

export default function BankManage() {
  return (
    <Routes>
      <Route path='/' element={<BankList />} />
      <Route path='add' element={<BankAdd />} />
      <Route path='profile' element={<BankProfile />} />
      <Route path='info' element={<BankInfo />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
