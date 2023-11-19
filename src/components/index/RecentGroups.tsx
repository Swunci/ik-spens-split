import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Balancer from 'react-wrap-balancer';

import type { Group, GroupList } from '@/interfaces/response';
import { getGroupMemberNames } from '@/pages/groups/[group]/history-helpers';
import NextApiClient from '@/utils/api/NextApiClient';
import { removeGroupFromLocalStorage } from '@/utils/localStorageUtils';
import { getUTCDateString } from '@/utils/timeUtils';

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
    <section className="p-1 md:p-2">
      <h3 className="px-2 text-2xl text-alice-accent">Visited Groups</h3>
      <div className="rounded bg-alice-main p-2 shadow-md">
        <ul className="space-y-2">
          {isLoading ? (
            <CircularProgress />
          ) : (
            groups.map((group: Group) => {
              return (
                <li
                  className="flexbox-row w-full rounded bg-alice-base shadow-md betterhover:hover:bg-alice-base/70"
                  key={group.groupId}
                >
                  <div className="flexbox-col">
                    <Link
                      className="w-full p-2"
                      href={`/groups/${group.groupId}`}
                      passHref
                    >
                      <div className="flexbox-row w-full">
                        <div className="text-base">{group.groupName}</div>
                        <div className="text-xs">
                          {getUTCDateString(group.createdDate)}
                        </div>
                      </div>
                      <div className="flexbox-row w-full gap-2 text-xs">
                        <div className="block break-words">
                          <Balancer>
                            {`Members: ${getGroupMemberNames(group)}`}
                          </Balancer>
                        </div>
                        <div className="w-fit whitespace-nowrap">
                          Currency: {group.currency}
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="block">
                    <button
                      className="p-1"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeGroupFromLocalStorage(group.groupId);
                        onDeleteGroup(group.groupId);
                      }}
                    >
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
