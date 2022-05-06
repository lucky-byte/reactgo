import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "~/comp/notfound";
import Images from './images';
import Videos from './videos';

export default function Media() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='images' element={<Images />} />
        <Route path='videos' element={<Videos />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
