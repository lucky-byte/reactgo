import { createElement } from 'react';
import Image from './image';

// 可以在 Markdown 中使用下列的组件
const customElements = {
  'Image': Image,
}

const allowTags = [
  'p', 'ul', 'ol', 'li', 'span', 'em', 'strong', 'code', 'sup', 'sub', 'del', 'br',
  'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'footer', 'section', 'input',
  'summary', 'details'
]

function createCustomElement(tag, props, ...children) {
  if (typeof tag === 'string') {
    // 大写字母开头认为是组件
    if (tag.charAt(0) === tag.charAt(0).toUpperCase()) {
      const comp = customElements[tag];
      if (comp) {
        return createElement(comp, props, children)
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn('不支持 Markdown 组件 ', tag, props);
      }
      return <></>;
    } else {
      if (allowTags.indexOf(tag) < 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('不支持 Markdown 标签 ', tag, props);
        }
        return <></>;
      }
      if (tag === 'input') {
        if (props?.type === 'checkbox') {
          return createElement(tag, props, ...children);
        } else {
          return <></>;
        }
      }
    }
  }
  return createElement(tag, props, ...children);
}

export default createCustomElement;
