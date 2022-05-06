import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "~/comp/notfound";
import User from "./user";
import Acl from "./acl";
import History from "./history";
import Setting from "./setting";
import Task from "./task";
import Event from "./event";
import Node from "./node";
import Bulletin from "./bulletin";
import Ops from './ops';

export default function System() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='user/*' element={<User />} />
        <Route path='acl/*' element={<Acl />} />
        <Route path='history/*' element={<History />} />
        <Route path='setting/*' element={<Setting />} />
        <Route path='task/*' element={<Task />} />
        <Route path='event/*' element={<Event />} />
        <Route path='node/*' element={<Node />} />
        <Route path='bulletin/*' element={<Bulletin />} />
        <Route path='ops/*' element={<Ops />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
