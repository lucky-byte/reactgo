import { createElement } from 'react';
import Image from './image';

// 可以在 Markdown 中使用下列 React 组件
const customElements = {
  'Image': Image,
}

// 只允许渲染下列 HTML 元素
const allowHtmlElements = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'br',
  'main', 'header', 'footer', 'section', 'summary', 'details',
  'p', 'span', 'ul', 'ol', 'li',
  'em', 'strong', 'del', 'i', 'b', 'u', 'code', 'sup', 'sub',
  'input',
]

// 这个函数用于控制最终可以渲染的元素，包括 React 组件和 HTML 元素
function createCustomElement(tag, props, ...children) {
  if (typeof tag === 'string') {
    // 大写字母开头认为是组件
    if (tag.charAt(0) === tag.charAt(0).toUpperCase()) {
      const comp = customElements[tag];
      if (comp) {
        return createElement(comp, props, children)
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('不支持 Markdown 组件 ', tag, props);
      }
      return <></>;
    } else {
      if (allowHtmlElements.indexOf(tag) < 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('不支持 HTML 元素 ', tag, props);
        }
        return <></>;
      }
      // 只允许 Checkbox 类型的输入
      if (tag === 'input') {
        if (props?.type === 'checkbox') {
          return createElement(tag, props, ...children);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('不支持 HTML 元素 ', tag, props);
        }
        return <></>;
      }
    }
  }
  return createElement(tag, props, ...children);
}

export default createCustomElement;
