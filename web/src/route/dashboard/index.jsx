import { Routes, Route } from "react-router-dom";
import Welcome from "./welcome";
import Kanban from "./kanban";

export default function Dashboard() {
  return (
    <Routes>
      <Route path='/' element={<Welcome />} />
      <Route path='kanban' element={<Kanban />} />
    </Routes>
  )
}
