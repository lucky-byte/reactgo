import { useState } from "react";
import { useEffect } from "react";
import GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default function Layout(props) {
  const [layout, setlayout] = useState([]);
  const [restored, setRestored] = useState(false);

  const { width, children } = props;

  // 从 localStorage 中读取上次保存的布局
  useEffect(() => {
    const storage = localStorage.getItem('kanban-layout');
    if (storage) {
      try {
        const arr = JSON.parse(storage);

        if (Array.isArray(arr)) {
          setlayout(arr);
        } else {
          localStorage.removeItem('kanban-layout');
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('读布局数据错：', err?.message);
        }
        localStorage.removeItem('kanban-layout');
      }
    }
    setRestored(true);
  }, []);

  // 将布局保存到 localStorage 中，注意我们需要等待第一次恢复布局后再保存，
  // 不然将无法正确的恢复布局，因为 onLayoutChange 在组件 mount 过程中会执行，
  // 也就是说在上面的 useEffect 之前执行
  const onLayoutChange = newLayout => {
    if (restored) {
      localStorage.setItem('kanban-layout', JSON.stringify(newLayout))
    }
  }

  return (
    <GridLayout className="layout"
      layout={layout}
      cols={20}
      rowHeight={10}
      width={width}
      onLayoutChange={onLayoutChange}
      children={children}
    />
  )
}
