import { Route, Routes } from "react-router-dom";
import NotFound from "../../../notfound";
import MailAdd from "./add";
import MailModify from "./modify";
import MailSettings from "./settings";

export default function Mail() {
  return (
    <Routes>
      <Route path='/' element={<MailSettings />} />
      <Route path='add' element={<MailAdd />} />
      <Route path='modify' element={<MailModify />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
