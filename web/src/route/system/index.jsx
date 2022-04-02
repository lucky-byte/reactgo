import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import User from "./user";
import Acl from "./acl";
import History from "./history";
import Settings from "./settings";
import Task from "./task";
import Event from "./event";
import Node from "./node";
import Bulletin from "./bulletin";

export default function System() {
  return (
    <Routes>
      <Route path='user/*' element={<User />} />
      <Route path='acl/*' element={<Acl />} />
      <Route path='history/*' element={<History />} />
      <Route path='settings/*' element={<Settings />} />
      <Route path='task/*' element={<Task />} />
      <Route path='event/*' element={<Event />} />
      <Route path='node/*' element={<Node />} />
      <Route path='bulletin/*' element={<Bulletin />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
