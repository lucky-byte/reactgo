import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import { useSnackbar } from 'notistack';

export default function Privacy() {
  const [content, setContent] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => { document.title = '隐私政策'; }, []);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/privacy', {
          method: 'GET',
          redirect: "follow",
        });
        if (!resp) {
          let text = await resp.text();
          if (!text) {
            text = resp.statusText;
          }
          throw new Error(text || '未知错误-' + resp.status);
        }
        const text = await resp.text();
        if (text) {
          setContent(text);
        } else {
          setContent('*非常抱歉，当前提供未提供隐私政策文件，请联系系统管理人员*。')
        }
      } catch (err) {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    })();
  }, [enqueueSnackbar]);

  return (
    <Container as='main' maxWidth='md' sx={{ my: 4 }}>
    </Container>
  )
}
