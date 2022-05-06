import { Routes, Route } from 'react-router-dom';
import NotFound from "~/comp/notfound";
import { useSetCode } from "~/state/code";
import Home from "./home";
import SecretCode from './secretcode';
import OTP from './otp';

export default function UserSecurity() {
  useSetCode(0);

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='secretcode' element={<SecretCode />} />
      <Route path='otp' element={<OTP />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
