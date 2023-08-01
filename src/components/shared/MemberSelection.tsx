import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useState } from 'react';

import type { Member } from '@/interfaces/response';
import type { TwoWayReadonlyMap } from '@/utils/currencyUtil';

export default function MemberSelection({
  currentMemberId,
  members,
  idNameMap,
  setCurrentMemberId,
  labelName = '',
}: {
  currentMemberId: string;
  members: Array<Member>;
  idNameMap: TwoWayReadonlyMap<string, string>;
  setCurrentMemberId: Dispatch<SetStateAction<string>>;
  labelName?: string;
}) {
  const [query, setQuery] = useState('');

  const filteredMembers =
    query === ''
      ? members
      : members.filter((member: Member) =>
          member.memberName
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div className="w-full">
      <div
        className={`flex w-full flex-col rounded bg-alice-main ${
          labelName !== '' ? 'p-2' : 'p-1'
        } shadow-md`}
      >
        {labelName !== '' && (
          <label className="w-full px-2 py-1" htmlFor={labelName}>
            {labelName}
          </label>
        )}
        <Combobox
          value={idNameMap.get(currentMemberId) ?? ''}
          onChange={(value) =>
            setCurrentMemberId(idNameMap.revGet(value) ?? '')
          }
        >
          <div className="relative">
            <div className="relative h-full w-full cursor-default overflow-hidden text-ellipsis rounded-md bg-alice-base text-left">
              <Combobox.Button as="div" className="flex h-full items-center">
                <Combobox.Input
                  className="h-full w-full rounded-md border-3 border-alice-main bg-alice-base p-2 pr-7 text-base leading-5 text-gray-900 shadow-md
                     focus:border-alice-accent focus:outline-none betterhover:hover:border-alice-accent betterhover:hover:bg-alice-base"
                  displayValue={(member) => member as string}
                  required
                  id={labelName}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <span className="absolute right-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute z-10 mt-0 max-h-60 w-full overflow-auto rounded-md bg-alice-base py-1 text-base shadow-lg sm:text-sm">
                {filteredMembers.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredMembers.map((member: Member) => (
                    <Combobox.Option
                      key={member.memberId}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? 'bg-alice-accent text-white'
                            : 'text-gray-900'
                        }`
                      }
                      value={member.memberName}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {member.memberName}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-white' : 'text-alice-accent'
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
    </div>
  );
}
