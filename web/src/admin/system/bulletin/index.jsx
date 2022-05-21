import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "~/comp/notfound";
import Home from "./home";
import Edit from "./edit";

export default function Bulletin() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='edit' element={<Edit />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
