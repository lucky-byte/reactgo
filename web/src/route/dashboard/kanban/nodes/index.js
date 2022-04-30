import Clock from './clock';
import Chat from './chat';

// 组件列表
//
// 每个组件可以配置下面的属性：
//  key: 组建标识，唯一
//  title: 标题，用于展示
//  desc: 描述，用于展示
//  component: 组件
//  layout: 一个对象，有下面的配置，可选
//    w: 初始宽度，默认为 2
//    h: 初始高度，默认为 2
//    minW: 最小宽度，默认为 1
//    maxW: 最大宽度，默认为无限
//    minH: 最小高度，默认为 1
//    maxH: 最大高度，默认为无限
//    static: 如果为 true，则不能拖动也不能改变大小，默认为 false
//    draggable: 如果为 false，则不能拖动，默认为 true
//    resizable: 如果为 false，则不能改变大小，默认为 true
//
const nodes = [{
  key: 'clock',
  title: '模拟时钟',
  desc: '显示一个模拟时钟',
  component: Clock,
  layout: {
    x: 14, y: 0, w: 2, h: 4, minW: 2, maxW: 4, minH: 2, maxH: 6,
  },
  default: true,
}, {
  key: 'chat',
  title: '即时通信',
  desc: '电话、视频、以及文字通信',
  component: Chat,
  layout: {
    w: 3, h: 6, minW: 2, maxW: 4, minH: 4, maxH: 10,
  },
}];

export default nodes;
