import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

export default function Pay() {
  return (
    <>
      <Tooltip title='收款' arrow>
        <IconButton aria-label="收款" color="primary">
          <CurrencyExchangeIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
