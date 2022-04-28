import { useTheme } from "@mui/material/styles";
import { useSetRecoilState } from 'recoil';
import { useReactToPrint } from 'react-to-print';
import useColorModeContent from "./colormode";
import printModalState from "~/state/printmodal";

export default function usePrint(printNode) {
  const theme = useTheme();
  const colorMode = useColorModeContent();
  const setPrintModalOpen = useSetRecoilState(printModalState);

  const printContent = useReactToPrint({
    onBeforePrint: () => {
      if (theme.palette.mode === 'dark') {
        colorMode.toggleColorMode();
      }
      setPrintModalOpen(false);
    },
    content: () => printNode,
    removeAfterPrint: true,
  });

  return () => {
    setPrintModalOpen(true);

    if (theme.palette.mode === 'dark') {
      colorMode.toggleColorMode();
      setTimeout(printContent, 500);
    } else {
      printContent();
    }
  }
}
