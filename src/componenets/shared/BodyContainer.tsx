export default function BodyContainer({ children }: { children: any }) {
  return (
    <div className="flex min-h-screen w-full max-w-screen-md flex-col place-content-start items-center rounded bg-slate-200 p-2">
      {children}
    </div>
  );
}
