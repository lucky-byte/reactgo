import { Routes, Route } from "react-router-dom";
import NotFound from "../../notfound";
import DevelopList from "./list";
import DevelopAdd from "./add";
import DevelopProfile from "./profile";
import DevelopInfo from "./info";

export default function MerchDevelop() {
  return (
    <Routes>
      <Route path='/' element={<DevelopList />} />
      <Route path='add' element={<DevelopAdd />} />
      <Route path='profile' element={<DevelopProfile />} />
      <Route path='info' element={<DevelopInfo />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
