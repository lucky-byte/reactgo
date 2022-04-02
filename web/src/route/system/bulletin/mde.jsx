import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export default function MDE(props) {
  const { content, setContent } = props;

  return (
    <SimpleMDE value={content} onChange={setContent} />
  )
}
