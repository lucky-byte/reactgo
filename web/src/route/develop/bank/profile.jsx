import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { styled } from '@mui/material/styles';
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import OutlinedPaper from '../../../comp/outlined-paper';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import titleState from "../../../state/title";
import progressState from '../../../state/progress';
import { get } from '../../../rest';

const ContentCell = styled(TableCell)(({ theme }) => ({
  borderLeft: '1px solid #8884',
  borderRight: '1px solid #8884',
  [`&.${tableCellClasses.body}`]: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
}));

export default function DevelopProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [profile, setProfile] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('开发商详细资料'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/develop/bank/profile?' + params.toString());
          setProfile(resp);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setProgress]);

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
          <IconButton onClick={() => { navigate('..') }} sx={{ mr: 1 }}>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6' gutterBottom={false}>详细资料</Typography>
        </Stack>
        <BaseInfoTable profile={profile} />
      </Paper>
    </Container>
  )
}

function BaseInfoTable(props) {
  const { profile } = props;

  return (
    <TableContainer component={OutlinedPaper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>姓名</TableCell>
            <ContentCell>{profile.name}</ContentCell>
            <TableCell>手机号</TableCell>
            <ContentCell>{profile.mobile}</ContentCell>
          </TableRow>
          <TableRow>
            <TableCell>邮箱地址</TableCell>
            <ContentCell colSpan={3}>{profile.email}</ContentCell>
          </TableRow>
          <TableRow>
            <TableCell>公司名称</TableCell>
            <ContentCell colSpan={3}>{profile.company}</ContentCell>
          </TableRow>
          <TableRow>
            <TableCell>联系地址</TableCell>
            <ContentCell colSpan={3}>{profile.address}</ContentCell>
          </TableRow>
          <TableRow>
            <TableCell>创建时间</TableCell>
            <ContentCell>
              {dayjs(profile.create_at).format('YYYY/MM/DD HH:mm:ss')}
            </ContentCell>
            <TableCell>最后更新时间</TableCell>
            <ContentCell>
              {dayjs(profile.update_at).format('YYYY/MM/DD HH:mm:ss')}
            </ContentCell>
          </TableRow>
          <TableRow>
            <TableCell>状态</TableCell>
            <ContentCell colSpan={3}>
              {profile.deleted ? '已删除' : profile.disabled ? '已禁用' : '正常'}
            </ContentCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
