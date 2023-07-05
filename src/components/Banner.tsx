import Typography from '@mui/material/Typography';

export default function Banner() {
  return (
    <div className="z-50 flex h-12 w-screen flex-col items-center bg-alice-secondary shadow-md">
      <div className="flex-container-row h-12 w-screen justify-center bg-alice-secondary">
        <Typography className="h-full p-2 text-center text-2xl" />
      </div>
    </div>
  );
}
