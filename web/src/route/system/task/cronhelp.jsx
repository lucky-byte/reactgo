import { lazy, useRef, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from "@mui/material/IconButton";
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Paper from "@mui/material/Paper";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReactToPrint from 'react-to-print';
import cronhelp from './cronhelp.md';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function CronHelp() {
  const [open, setOpen] = useState(false);

  const contentRef = useRef();

  const onClose = () => {
    setOpen(false);
  }

  return (
    <>
      <Tooltip title='查看帮助'>
        <IconButton onClick={() => setOpen(true)}>
          <HelpOutlineIcon fontSize='small' color='primary' />
        </IconButton>
      </Tooltip>
      <Dialog open={open} maxWidth='md' fullWidth onClose={onClose}>
        <DialogTitle>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <span>CRON 表达式说明</span>
            <Stack direction='row' spacing={2}>
              <ReactToPrint
                content={() => contentRef.current}
                trigger={() => (
                  <Tooltip title='打印'>
                    <IconButton aria-label="打印">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                )}
              />
              <IconButton aria-label="关闭" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Paper variant='outlined' sx={{ p: 2 }} ref={contentRef}>
            <Markdown url={cronhelp} />
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  )
}
