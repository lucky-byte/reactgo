import Avatar from "@mui/material/Avatar";

export default function UserAvatar(props) {
  const { avatar, name, ...others } = props;

  let url = avatar || '';

  if (url && !url.startsWith('http')) {
    url = `/image/?u=${url}`;
  }
  return (
    <Avatar src={url} alt={name} {...others} />
  )
}
