import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import List from "./list";
import Add from "./add";
import Modify from "./modify";
import Password from "./passwd";
import ACL from "./acl";
import Profile from "./profile";

export default function User() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='add' element={<Add />} />
      <Route path='profile' element={<Profile />} />
      <Route path='modify' element={<Modify />} />
      <Route path='passwd' element={<Password />} />
      <Route path='acl' element={<ACL />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
