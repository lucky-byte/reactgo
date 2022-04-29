import { useState } from "react";
import { useEffect } from "react";
import GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const layoutKey = 'kanban-layout';

export default function Layout(props) {
  const [layout, setlayout] = useState([]);
  const [restored, setRestored] = useState(false);

  const { width, children } = props;

  useEffect(() => {
    const saved = localStorage.getItem(layoutKey);
    if (saved) {
      try {
        const l = JSON.parse(saved);
        if (Array.isArray(l)) {
          console.log('restore layout:', l)
          setlayout(l);
        }
      } catch (err) {
        console.error('读布局数据错：', err?.message);
        localStorage.removeItem(layoutKey);
      }
    }
    setRestored(true);
  }, []);

  const onLayoutChange = l => {
    console.log(l)
    if (restored) {
      localStorage.setItem(layoutKey, JSON.stringify(l))
    }
  }

  return (
    <GridLayout className="layout"
      layout={layout}
      cols={16}
      rowHeight={30}
      width={width}
      onLayoutChange={onLayoutChange}
      children={children}
    />
  )
}
