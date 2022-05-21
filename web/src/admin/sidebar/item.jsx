import PropTypes from 'prop-types';
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import codeState from "~/state/code";
import urlCodes from './codes';

export default function Item(props) {
  const navigate = useNavigate();
  const code = useRecoilValue(codeState);
  const [showCode, setShowCode] = useState(false);

  const item = urlCodes[props?.code];

  if (!item) {
    return (
      <Typography color='error' variant='button' paragraph sx={{ ml: 2 }}>
        菜单 {props?.code} 不存在
      </Typography>
    )
  }

  const onMouseEnter = () => {
    setShowCode(true);
  }

  const onMouseLeave = () => {
    setShowCode(false);
  }

  const onClick = () => {
    navigate(item.to);
  }

  return (
    <ListItem disablePadding onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <ListItemButton onClick={onClick}>
        <ListItemIcon sx={{ minWidth: '32px' }}>{props.icon}</ListItemIcon>
        {code === props.code ?
          <ListItemText primary={item.title}
            primaryTypographyProps={{
              variant: 'button', color: 'primary', fontWeight: 'bold'
            }}
          />
          :
          <ListItemText primary={item.title}
            primaryTypographyProps={{ variant: 'button' }}
          />
        }
        {showCode &&
          <Typography variant='button' color='#8888'>{props.code}</Typography>
        }
      </ListItemButton>
    </ListItem>
  )
}

Item.propTypes = {
  code: PropTypes.number.isRequired,
  icon: PropTypes.element.isRequired,
}
