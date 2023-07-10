import Link from 'next/link';

import type { Group } from '@/interfaces/response';
import { getLocaleDateString } from '@/utils/timeUtils';

export default function RecentGroups({ groups }: { groups: Array<Group> }) {
  return groups.length === 0 ? (
    <div />
  ) : (
    <section className="p-3">
      <h3 className="px-2 text-2xl text-alice-accent">Visited Groups</h3>
      <div className="rounded bg-alice-main p-3 shadow-md">
        <ul className="space-y-2">
          {groups.map((group: Group) => {
            return (
              <li
                className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                key={group.groupId}
              >
                <Link href={`/groups/${group.groupId}`} passHref>
                  <div className="flexbox-row">
                    <div className="text-base">{group.groupName}</div>
                    <div className="text-xs">
                      {getLocaleDateString(group.createdDate)}
                    </div>
                  </div>
                  <div className="flexbox-row">
                    <div className="text-xs">
                      Members: {group.memberNames?.join(', ')}
                    </div>
                    <div className="text-xs">Currency: {group.currency}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
