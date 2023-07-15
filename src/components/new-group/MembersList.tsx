export default function MembersList({
  currentMembers,
  onDelete,
}: {
  currentMembers: Set<string>;
  onDelete: Function;
}) {
  const handleDelete = (memberName: string) => {
    onDelete(memberName);
  };
  return (
    <ul className="max-w-screen-md space-y-2">
      {[...currentMembers]
        .sort((a, b) => a.localeCompare(b))
        .map((member: string) => {
          return (
            <li
              key={member}
              className="flexbox-col flex w-full flex-row place-content-between items-center rounded border
                       bg-alice-base p-2 px-3 align-middle text-sm shadow-md betterhover:hover:bg-alice-base/70"
            >
              <span className="w-11/12 break-words pr-2">{member}</span>
              <button type="button" onClick={() => handleDelete(member)}>
                <svg
                  className="text-gray-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          );
        })}
    </ul>
  );
}
