import { Route, Routes } from "react-router-dom";
import NotFound from "../../../notfound";
import MailAdd from "./add";
import MailSettings from "./settings";

export default function Mail() {
  return (
    <Routes>
      <Route path='/' element={<MailSettings />} />
      <Route path='add' element={<MailAdd />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
