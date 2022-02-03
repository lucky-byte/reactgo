import { Routes, Route } from 'react-router-dom';
import NotFound from "~/route/notfound";
import UserSecurityHome from "./home";
import SecretCode from './secretcode';
import OTP from './otp';

export default function UserSecurity() {
  return (
    <Routes>
      <Route path='/' element={<UserSecurityHome />} />
      <Route path='secretcode' element={<SecretCode />} />
      <Route path='otp' element={<OTP />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
