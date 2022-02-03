import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import UserList from "./list";
import TaskAdd from "./add";
import UserPassword from "./passwd";
import UserACL from "./acl";
import UserProfile from "./profile";
import TaskCron from "./cron";

export default function Task() {
  return (
    <Routes>
      <Route path='/' element={<UserList />} />
      <Route path='add' element={<TaskAdd />} />
      <Route path='cron' element={<TaskCron />} />
      <Route path='profile' element={<UserProfile />} />
      <Route path='passwd' element={<UserPassword />} />
      <Route path='acl' element={<UserACL />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
