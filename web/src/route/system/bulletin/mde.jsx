import { lazy } from 'react';
import "easymde/dist/easymde.min.css";
const SimpleMDE = lazy(() => import('react-simplemde-editor'));

export default function MDE(props) {
  const { content, setContent } = props;

  return (
    <SimpleMDE value={content} onChange={setContent} />
  )
}
