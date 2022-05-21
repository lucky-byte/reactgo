import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Routes, Route, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Collapse from '@mui/material/Collapse';
import Stack from "@mui/material/Stack";
import Portal from '@mui/material/Portal';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import userState from "~/state/user";
import sidebarState from "~/state/sidebar";
import progressState from "~/state/progress";
import printModalState from "~/state/printmodal";
import natsState from "~/state/nats";
import { SecretCodeProvider } from "../comp/secretcode";
import NotFound from "~/comp/notfound";
import nats from '~/lib/nats';
import { get } from "~/lib/rest";
import { setLastAccess } from '~/lib/last-access';
import Appbar from "./appbar";
import Sidebar from "./sidebar";
import ErrorBoundary from "~/error";
import About from "./about";
import Codes from "./codes";
import Dashboard from "./dashboard";
import Media from "./media";
import System from "./system";
import User from "./user";

export default function Admin() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useRecoilState(userState);
  const sidebar = useRecoilValue(sidebarState);
  const [progress, setProgress] = useRecoilState(progressState);
  const setNatsChange = useSetRecoilState(natsState);
  const [progressVisible, setProgressVisible] = useState(false);

  // 用户角色具有开放平台特征
  const openpt = user?.acl_features?.indexOf('openpt') >= 0;

  // 延迟显示全局进度条
  useEffect(() => {
    if (progress) {
      const timer = setTimeout(() => { setProgressVisible(progress); }, 300)
      return () => { clearTimeout(timer); }
    } else {
      setProgressVisible(false);
    }
  }, [progress]);

  // 获取用户信息，保存到本地缓存
  useEffect(() => {
    // 如果 token 无效，表示用户未登录，跳转登录页面
    const token = localStorage.getItem('token');
    if (!token) {
      setLastAccess(window.location.pathname);
      return navigate('/signin', { replace: true });
    }
    if (!user || !user.uuid) {
      (async () => {
        try {
          setProgress(true);

          const resp = await get('/user/info');
          if (!resp || !resp.userid) {
            return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
          }
          setUser({
            uuid: resp.uuid,
            userid: resp.userid,
            avatar: resp.avatar,
            name: resp.name,
            mobile: resp.mobile,
            email: resp.email,
            address: resp.address,
            secretcode_isset: resp.secretcode_isset,
            totp_isset: resp.totp_isset,
            noti_popup: resp.noti_popup,
            noti_browser: resp.noti_browser,
            noti_mail: resp.noti_mail,
            acl_features: resp.acl_features,
            acl_allows: resp.acl_allows,
          });
        } catch (err) {
          enqueueSnackbar(err.message, { variant: 'error' });
        } finally {
          setProgress(false);
        }
      })();
    }
  }, [user, setUser, navigate, enqueueSnackbar, setProgress]);

  // 连接 NATS 服务器，接收异步通知
  useEffect(() => {
    (async () => {
      try {
        if (user?.uuid) {
          // 获取 nats 服务器配置
          const resp = await get('/nats');
          if (!resp.servers) {
            enqueueSnackbar('未配置 NATS 消息通道，不能接收异步通知', { variant: 'info' });
            return;
          }
          // 连接服务器
          await nats.open(resp.servers, resp.name);
          setNatsChange(Math.random());
        }
      } catch (err) {
        enqueueSnackbar(err.message || '连接消息通道失败');
      }
    })();

    // 关闭连接
    return async () => { await nats.close() }
  }, [setNatsChange, enqueueSnackbar, user?.uuid]);

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
        {!openpt &&
          <Collapse orientation="horizontal" in={sidebar}>
            <Sidebar />
          </Collapse>
        }
        <Stack sx={{
          flex: 1, height: '100vh', minWidth: 0, '@media print': { height: '100%' }
        }}>
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
