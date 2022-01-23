import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import User from "./user";
import Acl from "./acl";
import History from "./history";
import Settings from "./settings";

export default function System() {
  return (
    <Routes>
      <Route path='user/*' element={<User />} />
      <Route path='acl/*' element={<Acl />} />
      <Route path='history/*' element={<History />} />
      <Route path='settings/*' element={<Settings />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
