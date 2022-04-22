import Container from '@mui/material/Container';
import useTitle from "~/hook/title";

export default function Images() {
  useTitle('图片管理');

  return (
    <Container as='main' role='main' maxWidth='lg' sx={{ mb: 4 }}>
    </Container>
  )
}
