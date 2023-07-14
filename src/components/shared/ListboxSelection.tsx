import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment } from 'react';

export default function ListboxSelection({
  options,
  selection,
  setSelection,
  customWidth,
}: {
  options: Array<string>;
  selection: string;
  setSelection: Dispatch<SetStateAction<string>>;
  customWidth: string;
}) {
  return (
    <Listbox value={selection} onChange={setSelection}>
      <div className={`relative ${customWidth}`}>
        <Listbox.Button className="relative h-full w-full cursor-default rounded-md border border-alice-accent bg-alice-base py-2 pl-3 pr-10 text-left shadow-md">
          <span className="block">{selection}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute max-h-60 w-full rounded-md bg-alice-base py-1 text-base shadow-lg">
            {options.map((option: string) => (
              <Listbox.Option
                key={option}
                className={({ active }) =>
                  `z-10 w-full relative cursor-default select-none py-2 pl-4 pr-4 ${
                    active ? 'bg-alice-accent text-white' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <span
                    className={`block truncate ${
                      selected ? 'font-medium' : 'font-normal'
                    }`}
                  >
                    {option}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
