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
import Banner from '~/comp/banner';
import menus from "./menus";
import codes from "./codes";
import Item from './item';

export default function Sidebar() {
  const user = useRecoilValue(userState);
  const [visibleMenus, setVisibleMenus] = useState([]);

  // 根据用户的权限计算可以展示的菜单
  useEffect(() => {
    if (user?.acl_allows) {
      const allows = [];

      for (let i = 0; i < user.acl_allows.length; i++) {
        const allow = user.acl_allows[i];
        if (allow.iread) {
          allows.push(allow.code);
        }
      }
      const visible = [];

      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        const items = [];

        for (let j = 0; j < menu.items.length; j++) {
          const item = menu.items[j];

          // 无需授权的菜单
          if (codes[item.code]?.allow) {
            items.push(item);
            continue;
          }
          // 权限允许的菜单
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
  }, [user?.acl_allows]);

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", width: '220px', height: '100vh',
      borderRight: '1px solid #8882', '@media print': {
        height: '100%',
      }
    }}>
      <Toolbar disableGutters sx={{ ml: 2 }}>
        <Link component={RouteLink} to='/'>
          <Banner height={26} />
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
      if (parseInt(menu.items[i].code) === parseInt(code)) {
        setExpanded(true);
      }
    }
  }, [code, menu.items]);

  const listBgColor = theme.palette.mode === 'dark' ? 'black' : 'white';

  const handleChange = e => {
    setExpanded(!expanded);
  };

  return (
    <Accordion disableGutters elevation={0} square
      expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2">{menu.title}</Typography>
      </AccordionSummary>
      <List sx={{ backgroundColor: listBgColor }}>
        {menu.items.map(i => {
          const I = i.icon;
          return (
            <Item key={i.code} code={i.code} icon={<I sx={{ color: '#888b' }} />} />
          )
        })}
      </List>
    </Accordion>
  )
}
