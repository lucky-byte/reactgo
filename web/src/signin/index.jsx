import { Routes, Route } from "react-router-dom";
import NotFound from "~/comp/notfound";
import SignIn from "./signin";
import SMS from "./sms";
import OTP from "./otp";

export default function Index() {
  return (
    <Routes>
      <Route path='/' element={<SignIn />} />
      <Route path='sms' element={<SMS />} />
      <Route path='otp' element={<OTP />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
