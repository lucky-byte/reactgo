import { createElement } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Image from './image';

// 可以在 Markdown 中使用下列的组件
const customElements = {
  'Stack': Stack,
  'Grid': Grid,
  'Paper': Paper,
  'Typography': Typography,
  'Link': Link,
  'IconButton': IconButton,
  'Button': Button,
  'Divier': Divider,
  'Image': Image,
}

function createCustomElement(tag, props, ...children) {
  if (typeof tag === 'string') {
    if (tag.charAt(0) === tag.charAt(0).toUpperCase()) {
      const comp = customElements[tag];
      if (comp) {
        return createElement(comp, props, children)
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn('不支持的 Markdown 自定义组件 ', tag);
      }
      return null;
    }
  }
  return createElement(tag, props, ...children);
}

export default createCustomElement;
