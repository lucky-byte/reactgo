import { useState, useCallback } from 'react';
import { useTheme } from "@mui/material/styles";
import ReactSplit, { SplitDirection, GutterTheme } from '@devbookhq/splitter';
import './index.css';

export default function Splitter({
  direction = "Horizontal", children, initialSizes, onResizeFinished, ...props
}) {
  const theme = useTheme();
  const [splitSizes, setSplitSizes] = useState(initialSizes);

  const gutterTheme = theme.palette.mode === 'dark' ? 'Dark' : 'Light';

  const _onResizeFinished = useCallback((e, newSizes) => {
    setSplitSizes(newSizes);
    onResizeFinished && onResizeFinished(e, newSizes);
  }, [onResizeFinished]);

  return (
    <ReactSplit
      direction={SplitDirection[direction]}
      initialSizes={splitSizes}
      gutterTheme={GutterTheme[gutterTheme]}
      onResizeFinished={_onResizeFinished}
      gutterClassName='splitter-gutter'
      {...props}>
      {children}
    </ReactSplit>
  )
}
