import { Suspense, lazy } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "../notfound";
import Avatar from "./avatar";
import Password from "./password";
import Security from "./security";
import OIDC from './oidc';
import SignInList from "./signinlist";
import Notification from './notificatiion';

const Profile = lazy(() => import('./profile'));

export default function User() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='/' element={<Profile />} />
        <Route path='profile' element={<Profile />} />
        <Route path='avatar' element={<Avatar />} />
        <Route path='password' element={<Password />} />
        <Route path='security/*' element={<Security />} />
        <Route path='oidc/*' element={<OIDC />} />
        <Route path='signinlist' element={<SignInList />} />
        <Route path='notification/*' element={<Notification />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
