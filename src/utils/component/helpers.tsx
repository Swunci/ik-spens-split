import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

export function displayBackdrop() {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export function displaySnackbar(message: string) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open
      sx={{
        bottom: { xs: 70, sm: 70, lg: 70 },
      }}
    >
      <Alert severity="error">{message}</Alert>
    </Snackbar>
  );
}
