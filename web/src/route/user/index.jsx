import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import Password from "./password";
import Profile from "./profile";
import Security from "./security";
import SignInList from "./signinlist";

export default function User() {
  return (
    <Routes>
      <Route path='/' element={<Profile />} />
      <Route path='profile' element={<Profile />} />
      <Route path='password' element={<Password />} />
      <Route path='security/*' element={<Security />} />
      <Route path='signinlist' element={<SignInList />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
