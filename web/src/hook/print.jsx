import { useTheme } from "@mui/material/styles";
import { useReactToPrint } from 'react-to-print';
import useColorModeContent from "./colormode";

export default function usePrint(comp) {
  const theme = useTheme();
  const colorMode = useColorModeContent();

  const printContent = useReactToPrint({
    onBeforePrint: () => {
      if (theme.palette.mode === 'dark') {
        colorMode.toggleColorMode();
      }
    },
    content: () => comp,
    removeAfterPrint: true,
  });

  return () => {
    if (theme.palette.mode === 'dark') {
      colorMode.toggleColorMode();
      setTimeout(printContent, 500);
    } else {
      printContent();
    }
  }
}
