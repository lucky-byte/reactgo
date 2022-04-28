import { useState } from "react";
import { useEffect } from "react";
import GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const storageKey = 'kanban-layout';

export default function Layout(props) {
  const [layout, setlayout] = useState([]);
  const [restored, setRestored] = useState(false);

  const { width, children } = props;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const l = JSON.parse(saved);
        if (Array.isArray(l)) {
          console.log('restore layout:', l)
          setlayout(l);
        }
      } catch (err) {
        console.error('读布局数据错：', err?.message);
        localStorage.removeItem(storageKey);
      }
    }
    setRestored(true);
  }, []);

  const onLayoutChange = l => {
    console.log(l)
    if (restored) {
      localStorage.setItem(storageKey, JSON.stringify(l))
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
