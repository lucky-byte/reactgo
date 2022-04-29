import Typography from '@mui/material/Typography';

function My() {
  return (
    <Typography>MEME</Typography>
  )
}
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
const elements = [{
  key: 'typography', title: '文字', desc: '文字牌白',
  component: My, layout: {
    w: 3, h: 3, maxW: 4, resizeable: false,
  },
// }, {
//   key: 'icon', title: '天气', desc: '近5天的天气预报',
// }, {
//   key: 'trade', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade2', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade3', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade4', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade5', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade6', title: '交易图标', desc: '当天的交易走势图',
// }, {
//   key: 'trade7', title: '交易图标', desc: '当天的交易走势图',
}];

export default elements;
