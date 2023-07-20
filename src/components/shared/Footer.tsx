export default function Footer() {
  return (
    <footer className="flex h-12 flex-col items-center">
      <div className="flex-container-row h-12 w-screen max-w-screen-md bg-alice-secondary">
        <button type="button">About</button>
        <button type="button">Privacy Policy</button>
        <button type="button">Contact</button>
      </div>
      <a
        className="w-full bg-alice-secondary p-2"
        href="https://www.flaticon.com/free-icons/divide"
        title="icons"
      >
        Icons by Uniconlabs - Flaticon
      </a>
    </footer>
  );
}
