import { Routes, Route } from "react-router-dom";
import NotFound from "~/route/notfound";
import List from "./list";
import Add from "./add";
import Cron from "./cron";
import Entries from "./entries";
import Info from "./info";
import Modify from "./modify";

export default function Task() {
  return (
    <Routes>
      <Route path='/' element={<List />} />
      <Route path='add' element={<Add />} />
      <Route path='cron' element={<Cron />} />
      <Route path='entries' element={<Entries />} />
      <Route path='info' element={<Info />} />
      <Route path='modify' element={<Modify />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
