import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "~/route/notfound";
import List from "./list";
import Add from "./add";

export default function Bulletin() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='/' element={<List />} />
        <Route path='add' element={<Add />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
