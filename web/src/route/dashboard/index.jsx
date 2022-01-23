import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import titleState from "../../state/title";

export default function Dashboard() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('看板'); }, [setTitle]);

  return (
    <Container as='main'>
    </Container>
  )
}
