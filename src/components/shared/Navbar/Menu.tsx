/* eslint-disable react/button-has-type */
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import type { Dispatch } from 'react';
import { Fragment, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import type { ActionType } from '@/components/hooks/snackbarReducer';
import type {
  Group,
  PaidDebtResponse,
  TransactionResponse,
} from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

import {
  handleCopyGroupLink,
  handleEditGroup,
  handleExportToExcel,
  handleHistoryClick,
  handleNewGroup,
} from './helpers';
import {
  CopyLinkActiveIcon,
  CopyLinkInactiveIcon,
  EditActiveIcon,
  EditInactiveIcon,
  ExportActiveIcon,
  ExportInactiveIcon,
  HistoryActiveIcon,
  HistoryInactiveIcon,
  NewGroupActiveIcon,
  NewGroupInactiveIcon,
  ScanActiveIcon,
  ScanInactiveIcon,
} from './MenuIcons';

export default function MenuExample({
  groupId,
  groupData,
  transactionsData,
  paidDebtsData,
  memberIdToNameMap,
  dispatch,
}: {
  groupId: string;
  groupData: Group;
  transactionsData: TransactionResponse;
  paidDebtsData: PaidDebtResponse;
  memberIdToNameMap: TwoWayReadonlyMap<string, string>;
  dispatch: Dispatch<ActionType>;
}) {
  const [groupLink, setGroupLink] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (window) {
      setGroupLink(window.location.host);
    }
  }, []);

  return (
    <div className="h-full w-full p-2">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            className="inline-flex w-full justify-center rounded-md px-4 py-2 text-base
          text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
          >
            Options
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5 text-black"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md
          bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <div className="p-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                    onClick={(e) => handleNewGroup(e, groupId, router)}
                  >
                    {active ? (
                      <NewGroupActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <NewGroupInactiveIcon
                        className="mr-2 h-5 w-5 stroke-alice-accent"
                        aria-hidden="true"
                      />
                    )}
                    New Group
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                    onClick={(e) => handleEditGroup(e, groupId, router)}
                  >
                    {active ? (
                      <EditActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <EditInactiveIcon
                        className="mr-2 h-5 w-5 fill-alice-main stroke-alice-accent"
                        aria-hidden="true"
                      />
                    )}
                    Edit Group
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                    onClick={(e) => handleHistoryClick(e, groupId, router)}
                  >
                    {active ? (
                      <HistoryActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <HistoryInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    History
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <div>
                    <CopyToClipboard text={`${groupLink}/groups/${groupId}`}>
                      <button
                        className={`${
                          active
                            ? 'bg-alice-accent text-white'
                            : 'text-gray-900'
                        } group flex w-full items-center rounded-md p-2 text-sm`}
                        onClick={(e) =>
                          handleCopyGroupLink(e, groupId, dispatch)
                        }
                      >
                        {active ? (
                          <CopyLinkActiveIcon
                            className="mr-2 h-5 w-5 "
                            aria-hidden="true"
                          />
                        ) : (
                          <CopyLinkInactiveIcon
                            className="mr-2 h-5 w-5 fill-alice-main stroke-alice-accent"
                            aria-hidden="true"
                          />
                        )}
                        Copy group link
                      </button>
                    </CopyToClipboard>
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                    onClick={(e) =>
                      handleExportToExcel(
                        e,
                        groupData,
                        transactionsData,
                        paidDebtsData,
                        memberIdToNameMap
                      )
                    }
                  >
                    {active ? (
                      <ExportActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <ExportInactiveIcon
                        className="mr-2 h-5 w-5 fill-alice-main stroke-alice-accent"
                        aria-hidden="true"
                      />
                    )}
                    Export to Excel
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md p-2 text-sm`}
                    onClick={() =>
                      router.push(`/groups/${groupId}/scan-receipt-demo`)
                    }
                  >
                    {active ? (
                      <ScanActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <ScanInactiveIcon
                        className="mr-2 h-5 w-5 fill-alice-main stroke-alice-accent"
                        aria-hidden="true"
                      />
                    )}
                    Scan receipt demo
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
