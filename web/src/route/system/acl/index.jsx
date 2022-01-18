import { Routes, Route } from "react-router-dom";
import NotFound from "../../notfound";
import AclAdd from "./add";
import AclAllows from "./allows";
import AclList from "./list";

export default function Acl() {
  return (
    <Routes>
      <Route path='/' element={<AclList />} />
      <Route path='add' element={<AclAdd />} />
      <Route path='allows' element={<AclAllows />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
