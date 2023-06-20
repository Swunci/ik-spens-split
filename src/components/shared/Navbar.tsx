export default function Navbar() {
  return (
    <div className="flex h-12 w-screen flex-col items-center">
      <div className="flex-container-row fixed top-0 z-50 h-12 w-screen rounded bg-red-300">
        <button type="button">Home</button>
        <button type="button">Stuff</button>
      </div>
    </div>
  );
}
