import { Routes, Route } from "react-router-dom";
import Kanban from "./kanban";
import Welcome from "./welcome";

export default function Dashboard() {
  return (
    <Routes>
      <Route path='/' element={<Welcome />} />
      <Route path='kanban' element={<Kanban />} />
    </Routes>
  )
}
