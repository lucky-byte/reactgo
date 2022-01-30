import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useRecoilValue } from "recoil";
import { Link as RouteLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "@mui/material/Link";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from '@mui/material/List';
import userState from "~/state/user";
import codeState from "~/state/code";
import LuckyByte from '~/img/lucky-byte.png';
import LuckyByteDark from '~/img/lucky-byte-dark.png';
import menus from "./menus";
import Item from './item';

export default function Sidebar() {
  const theme = useTheme();
  const user = useRecoilValue(userState);
  const [visibleMenus, setVisibleMenus] = useState([]);

  const Logo = theme.palette.mode === 'dark' ? LuckyByteDark : LuckyByte;

  useEffect(() => {
    if (user?.allows) {
      const allows = [];

      for (let i = 0; i < user.allows.length; i++) {
        const allow = user.allows[i];
        if (allow.read) {
          allows.push(allow.code);
        }
      }
      const visible = [];

      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        const items = [];

        for (let j = 0; j < menu.items.length; j++) {
          const item = menu.items[j];
          if (allows.includes(item.code)) {
            items.push(item);
          }
        }
        if (items.length > 0) {
          visible.push({...menu, items: items });
        }
      }
      setVisibleMenus(visible);
    }
  }, [user?.allows]);

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", width: '220px', height: '100vh',
      borderRight: '1px solid #8888',
    }}>
      <Toolbar disableGutters sx={{ paddingLeft: '14px' }}>
        <Link component={RouteLink} to='/'>
          <img src={Logo} alt='Logo' height='32px' />
        </Link>
      </Toolbar>
      <Box sx={{ flexGrow: 1, overflowY: 'scroll' }}>
        {visibleMenus.map(menu => (<Menu menu={menu} key={menu.title} />))}
      </Box>
    </Box>
  );
}

function Menu({ menu }) {
  const theme = useTheme();
  const code = useRecoilValue(codeState);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    for (let i = 0; i < menu.items.length; i++) {
      if (menu.items[i].code === code) {
        setExpanded(true);
      }
    }
  }, [code, menu.items]);

  const listBgColor = theme.palette.mode === 'dark' ? 'black' : '#f8f8f8';

  const handleChange = e => {
    setExpanded(!expanded);
  };

  return (
    <Accordion disableGutters elevation={0} square
      expanded={expanded} onChange={handleChange}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
        <Typography variant="subtitle2">{menu.title}</Typography>
      </AccordionSummary>
      <List sx={{ backgroundColor: listBgColor }}>
        {menu.items.map(i => {
          const I = i.icon;
          return <Item key={i.code} code={i.code} icon={<I color='primary' />} />
        })}
      </List>
    </Accordion>
  )
}
