import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import LinearProgress from '@mui/material/LinearProgress';
import NotFound from "~/comp/notfound";
import Welcome from './welcome';
import Kanban from './kanban';

export default function Dashboard() {
  return (
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path='/' element={<Welcome />} />
        <Route path='kanban' element={<Kanban />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
