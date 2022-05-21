import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import Home from "./home";
import Add from "./add";
import Import from "./import";
import Modify from "./modify";
import Password from "./passwd";
import ACL from "./acl";
import Bank from "./bank";
import Profile from "./profile";

export default function User() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='add' element={<Add />} />
      <Route path='import' element={<Import />} />
      <Route path='modify' element={<Modify />} />
      <Route path='passwd' element={<Password />} />
      <Route path='acl' element={<ACL />} />
      <Route path='bank' element={<Bank />} />
      <Route path='profile' element={<Profile />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
