import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import titleState from "~/state/title";

export default function UserProfile() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('个人资料'); }, [setTitle]);

  return (
    <Container as='main' maxWidth='lg'>
    </Container>
  )
}
