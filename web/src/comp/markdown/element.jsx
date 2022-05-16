import { createElement } from 'react';
import Image from './image';

// 可以在 Markdown 中使用下列的组件
const customElements = {
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
