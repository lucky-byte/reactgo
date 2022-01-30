import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import UserList from "./list";
import UserAdd from "./add";
import UserInfo from "./info";
import UserPassword from "./passwd";
import UserACL from "./acl";
import UserProfile from "./profile";

export default function User() {
  return (
    <Routes>
      <Route path='/' element={<UserList />} />
      <Route path='add' element={<UserAdd />} />
      <Route path='profile' element={<UserProfile />} />
      <Route path='info' element={<UserInfo />} />
      <Route path='passwd' element={<UserPassword />} />
      <Route path='acl' element={<UserACL />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
