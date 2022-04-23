import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Collapse from '@mui/material/Collapse';
import Stack from "@mui/material/Stack";
import Portal from '@mui/material/Portal';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import CircularProgress from '@mui/material/CircularProgress';
import sidebarState from "~/state/sidebar";
import progressState from "~/state/progress";
import printModalState from "~/state/printmodal";
import { SecretCodeProvider } from "../comp/secretcode";
import Appbar from "./appbar";
import Sidebar from "./sidebar";
import ErrorBoundary from "~/error";
import NotFound from "./notfound";
import About from "./about";
import Codes from "./codes";
import Dashboard from "./dashboard";
import Media from "./media";
import System from "./system";
import User from "./user";

export default function Index() {
  const sidebar = useRecoilValue(sidebarState);
  const progress = useRecoilValue(progressState);
  const [progressVisible, setProgressVisible] = useState(false);

  // 延迟显示全局进度条
  useEffect(() => {
    if (progress) {
      const timer = setTimeout(() => { setProgressVisible(progress); }, 300)
      return () => { clearTimeout(timer); }
    } else {
      setProgressVisible(false);
    }
  }, [progress]);

  return (
    <SecretCodeProvider>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        {progressVisible &&
          <Portal>
            <LinearProgress sx={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'modal'
            }} />
          </Portal>
        }
        <Collapse orientation="horizontal" in={sidebar}>
          <Sidebar />
        </Collapse>
        <Stack sx={{ flex: 1, height: '100vh', '@media print': { height: '100%' } }}>
          <Appbar />
          <Box sx={{ maxHeight: '100%', overflow: 'auto' }}>
            <ErrorBoundary>
              <Routes>
                <Route path='/*' element={<Dashboard />} />
                <Route path='user/*' element={<User />} />
                <Route path='media/*' element={<Media />} />
                <Route path='system/*' element={<System />} />
                <Route path='codes' element={<Codes />} />
                <Route path='about' element={<About />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </Box>
        </Stack>
        <PrintModal />
      </Box>
    </SecretCodeProvider>
  )
}

// 准备打印提示窗口
function PrintModal() {
  const [printModalOpen, setPrintModalOpen] = useRecoilState(printModalState);

  const onClose = () => {
    setPrintModalOpen(false);
  }

  return (
    <Dialog
      open={printModalOpen}
      onClose={onClose}
      aria-labelledby="准备打印"
      aria-describedby="准备打印">
      <DialogContent>
        <Stack alignItems='center' spacing={2}>
          <CircularProgress />
          <DialogContentText>准备打印</DialogContentText>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
