import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Avatar from "@mui/material/Avatar";
import userState from "~/state/user";

export default function UserAvatar(props) {
  // const user = useRecoilValue(userState);
  // const [avatar, setAvatar] = useState('');

  const { avatar, name, ...others } = props;

  let url = avatar || '';

  if (url && !url.startsWith('http')) {
    url = `/image/?u=${url}`;
  }

  // useEffect(() => {
  //   let a = user?.avatar || '';

  //   if (a && !a.startsWith('http')) {
  //     a = `/image/?u=${a}`;
  //   }
  //   setAvatar(a);
  // }, [user?.avatar])

  return (
    <Avatar src={url} alt={name} {...others} />
  )
}
