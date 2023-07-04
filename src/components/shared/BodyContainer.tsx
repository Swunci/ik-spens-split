export default function BodyContainer({ children }: { children: any }) {
  return (
    <div className="flex min-h-screen w-full max-w-screen-md flex-col place-content-start items-center bg-alice-base p-2 shadow-xl">
      {children}
    </div>
  );
}
