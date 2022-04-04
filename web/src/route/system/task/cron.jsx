import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useHotkeys } from 'react-hotkeys-hook';
import OutlinedPaper from "~/comp/outlined-paper";
import useTitle from "~/hook/title";
import CronJPG from '~/img/cron.jpg';

export default function Cron() {
  const navigate = useNavigate();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('CRON 表达式说明');

  return (
    <Container as='main' role='main' maxWidth='lg' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6'>CRON 表达式说明</Typography>
        </Stack>
        <Typography variant='body2'>
          CRON 表达式是一个具有时间含义的字符串，字符串以 4 或 5个空格隔开，分为 5 或 6 个域，
          格式为 X X X X X X。其中 X 是一个域的占位符。
          单个域有多个取值时，使用半角逗号(,)隔开取值。每个域可以是确定的取值，
          也可以是具有逻辑意义的特殊字符。
        </Typography>
        <Stack alignItems='center' sx={{ my: 2 }}>
          <img src={CronJPG} alt='img' width='50%' />
        </Stack>
        <TableContainer component={OutlinedPaper} sx={{ my: 1 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell align='center'>字段名</TableCell>
                <TableCell align="center">强制</TableCell>
                <TableCell align="center">允许的值</TableCell>
                <TableCell align="center">允许的特殊符号</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align='center'>秒</TableCell>
                <TableCell align="center">否</TableCell>
                <TableCell align="center">0-59</TableCell>
                <TableCell align="center"><code>* / , -</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'>分</TableCell>
                <TableCell align="center">是</TableCell>
                <TableCell align="center">0-59</TableCell>
                <TableCell align="center"><code>* / , -</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'>时</TableCell>
                <TableCell align="center">是</TableCell>
                <TableCell align="center">0-23</TableCell>
                <TableCell align="center"><code>* / , -</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'>天</TableCell>
                <TableCell align="center">是</TableCell>
                <TableCell align="center">1-31</TableCell>
                <TableCell align="center"><code>* / , - ?</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'>月</TableCell>
                <TableCell align="center">是</TableCell>
                <TableCell align="center">1-12 或者 JAN-DEC</TableCell>
                <TableCell align="center"><code>* / , -</code></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'>星期</TableCell>
                <TableCell align="center">是</TableCell>
                <TableCell align="center">0-6 或者 SUN-SAT</TableCell>
                <TableCell align="center"><code>* / , - ?</code></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant='body2'>
          注意: 月 和 星期 字段值是大小写无关的，"SUN", "sun" 以及 "Sun" 是相等的。
        </Typography>
        <Typography variant='h6' sx={{ mt: 3, mb: 1 }}>特殊字符</Typography>
        <TableContainer component={OutlinedPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center' sx={{ whiteSpace: 'nowrap' }}>字符</TableCell>
                <TableCell align="center">含义</TableCell>
                <TableCell align="center">示例</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align='center'><code>*</code></TableCell>
                <TableCell align="center">所有可能的值</TableCell>
                <TableCell align="center">
                  在月域中，*表示每个月；在星期域中，*表示星期的每一天
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>,</code></TableCell>
                <TableCell align="center">列出枚举值</TableCell>
                <TableCell align="center">
                  在分钟域中，5,20表示分别在5分钟和20分钟触发一次
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>-</code></TableCell>
                <TableCell align="center">范围</TableCell>
                <TableCell align="center">
                  在分钟域中，5-20表示从5分钟到20分钟之间每隔一分钟触发一次
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>/</code></TableCell>
                <TableCell align="center">指定数值的增量</TableCell>
                <TableCell align="center">
                  在分钟域中，0/15表示从第0分钟开始，每15分钟。在分钟域中3/20表示从第3分钟开始，
                  每20分钟
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>?</code></TableCell>
                <TableCell align="center">不指定值，仅日期和星期域支持该字符</TableCell>
                <TableCell align="center">
                  当日期或星期域其中之一被指定了值以后，为了避免冲突，
                  需要将另一个域的值设为?
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant='h6' sx={{ mt: 3, mb: 1 }}>例子</Typography>
        <Typography variant='body2' sx={{ mb: 1 }}>
          下面的例子全部采用 6 个字段的表达式（包含秒），也可以使用 5 个字段的表达式
          （没有秒，第一个字段表示分钟），通常使用 6 个字段更精确。
        </Typography>
        <TableContainer component={OutlinedPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">表达式</TableCell>
                <TableCell align="left">含义</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align='center'><code>0 15 10 ? * *</code></TableCell>
                <TableCell align="left">每天上午10:15执行任务</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 15 10 * * ?</code></TableCell>
                <TableCell align="left">每天上午10:15执行任务</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0 12 * * ?</code></TableCell>
                <TableCell align="left">每天中午12:00执行任务</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0 10,14,16 * * ?</code></TableCell>
                <TableCell align="left">
                  每天上午10:00点、下午14:00以及下午16:00执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0/30 9-17 * * ?</code></TableCell>
                <TableCell align="left">
                  每天上午09:00到下午17:00时间段内每隔半小时执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 * 14 * * ?</code></TableCell>
                <TableCell align="left">
                  每天下午14:00到下午14:59时间段内每隔1分钟执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0-5 14 * * ?</code></TableCell>
                <TableCell align="left">
                  每天下午14:00到下午14:05时间段内每隔1分钟执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0/5 14 * * ?</code></TableCell>
                <TableCell align="left">
                  每天下午14:00到下午14:55时间段内每隔5分钟执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0/5 14,18 * * ?</code></TableCell>
                <TableCell align="left">
                  每天下午14:00到下午14:55、下午18:00到下午18:55时间段内每隔5分钟执行任务
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 0 12 ? * WED</code></TableCell>
                <TableCell align="left">每个星期三中午12:00执行任务</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align='center'><code>0 15 10 15 * ?</code></TableCell>
                <TableCell align="left">每月15日上午10:15执行任务</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
