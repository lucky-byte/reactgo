import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import User from "./user";
import Acl from "./acl";
import History from "./history";
import Settings from "./settings";
import Task from "./task";

export default function System() {
  return (
    <Routes>
      <Route path='user/*' element={<User />} />
      <Route path='acl/*' element={<Acl />} />
      <Route path='history/*' element={<History />} />
      <Route path='settings/*' element={<Settings />} />
      <Route path='task/*' element={<Task />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
