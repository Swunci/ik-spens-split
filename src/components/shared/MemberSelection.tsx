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
}: {
  currentMemberId: string;
  members: Array<Member>;
  idNameMap: TwoWayReadonlyMap<string, string>;
  setCurrentMemberId: Dispatch<SetStateAction<string>>;
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
    <Combobox
      value={idNameMap.get(currentMemberId) ?? ''}
      onChange={(value) => setCurrentMemberId(idNameMap.revGet(value) ?? '')}
    >
      <div className="relative">
        <div className="relative h-full w-full cursor-default overflow-hidden text-ellipsis rounded-md bg-alice-base text-left shadow-md">
          <Combobox.Input
            className="h-full w-full rounded-md border border-alice-accent bg-alice-base p-2 pr-7 text-base leading-5 text-gray-900 shadow-md"
            displayValue={(member) => member as string}
            required
            id="currentMember"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-0 max-h-60 w-full overflow-auto rounded-md bg-alice-base py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
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
                      active ? 'bg-alice-accent text-white' : 'text-gray-900'
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
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
  );
}
