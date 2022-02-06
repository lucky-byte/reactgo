import { Routes, Route } from "react-router-dom";
import NotFound from "../notfound";
import UserPassword from "./password";
import UserProfile from "./profile";
import UserSecurity from "./security";
import UserSignInList from "./signinlist";

export default function User() {
  return (
    <Routes>
      <Route path='/' element={<UserProfile />} />
      <Route path='profile' element={<UserProfile />} />
      <Route path='password' element={<UserPassword />} />
      <Route path='security/*' element={<UserSecurity />} />
      <Route path='signinlist' element={<UserSignInList />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
