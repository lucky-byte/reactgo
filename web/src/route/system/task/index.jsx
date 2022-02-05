import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import UserList from "./list";
import TaskAdd from "./add";
import UserPassword from "./passwd";
import TaskCron from "./cron";
import TaskEntries from "./entries";
import TaskInfo from "./info";

export default function Task() {
  return (
    <Routes>
      <Route path='/' element={<UserList />} />
      <Route path='add' element={<TaskAdd />} />
      <Route path='cron' element={<TaskCron />} />
      <Route path='entries' element={<TaskEntries />} />
      <Route path='info' element={<TaskInfo />} />
      <Route path='passwd' element={<UserPassword />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
