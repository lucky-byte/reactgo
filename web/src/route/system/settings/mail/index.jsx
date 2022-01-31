import { Route, Routes } from "react-router-dom";
import NotFound from "~/route/notfound";
import MailAdd from "./add";
import MailInfo from "./info";
import MailModify from "./modify";
import MailSettings from "./settings";

export default function Mail() {
  return (
    <Routes>
      <Route path='/' element={<MailSettings />} />
      <Route path='add' element={<MailAdd />} />
      <Route path='modify' element={<MailModify />} />
      <Route path='info' element={<MailInfo />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
