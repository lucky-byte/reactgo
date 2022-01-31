import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import { useHotkeys } from 'react-hotkeys-hook';
import titleState from "~/state/title";

export default function UserSecurity() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('安全设置'); }, [setTitle]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  return (
    <Container as='main' maxWidth='lg'>
    </Container>
  )
}
