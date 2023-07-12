import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { Group, GroupList } from '@/interfaces/response';
import { getGroupMemberNames } from '@/pages/groups/[group]/history-helpers';
import NextApiClient from '@/utils/api/NextApiClient';
import { removeGroupFromLocalStorage } from '@/utils/localStorageUtils';
import { getLocaleDateString } from '@/utils/timeUtils';

export default function RecentGroups() {
  const [groups, setGroups] = useState(new Array<Group>());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      const groupIds = JSON.parse(localStorage.getItem('groupIds')!);
      const nextApiClient = new NextApiClient().jsonBody();
      const response = await nextApiClient.groups.getSome(groupIds);
      if (!response.ok) {
        setIsLoading(false);
        return;
      }
      const groupsList: GroupList = await response.json();
      setIsLoading(false);
      setGroups(groupsList.groups);
    }
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('groupIds') !== null
    ) {
      fetchGroups();
    }
  }, []);

  const onDeleteGroup = (groupId: string) => {
    const newGroupList = groups.filter((group: Group) => {
      return group.groupId !== groupId;
    });
    setGroups(newGroupList);
  };

  return groups.length === 0 ? (
    <div />
  ) : (
    <section className="p-3">
      <h3 className="px-2 text-2xl text-alice-accent">Visited Groups</h3>
      <div className="rounded bg-alice-main p-3 shadow-md">
        <ul className="space-y-2">
          {isLoading ? (
            <CircularProgress />
          ) : (
            groups.map((group: Group) => {
              return (
                <li
                  className="flexbox-col w-full rounded bg-alice-base p-2 shadow-md"
                  key={group.groupId}
                >
                  <div className="flexbox-row gap-2">
                    <Link
                      className="w-full"
                      href={`/groups/${group.groupId}`}
                      passHref
                    >
                      <div className="flexbox-row">
                        <div className="text-base">{group.groupName}</div>
                        <div className="text-xs">
                          {getLocaleDateString(group.createdDate)}
                        </div>
                      </div>
                      <div className="flexbox-row">
                        <div className="text-xs">
                          Members: {getGroupMemberNames(group)}
                        </div>
                        <div className="text-xs">
                          Currency: {group.currency}
                        </div>
                      </div>
                    </Link>
                    <svg
                      onClick={(e) => {
                        e.preventDefault();
                        removeGroupFromLocalStorage(group.groupId);
                        onDeleteGroup(group.groupId);
                      }}
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
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
