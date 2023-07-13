import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useState } from 'react';

import { currencyNameCodeMap } from '@/utils/currencyUtil';

export default function CurrencySelection({
  selectedCurrency,
  setSelectedCurrency,
}: {
  selectedCurrency: string;
  setSelectedCurrency: Dispatch<SetStateAction<string>>;
}) {
  const [query, setQuery] = useState('');

  const currencies = [...currencyNameCodeMap.map.keys()];

  const filteredCurrencies =
    query === ''
      ? currencies
      : currencies.filter((currency: string) =>
          currency
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div className="w-full">
      <label
        className="flex w-full flex-col rounded bg-alice-main p-2 shadow-md"
        htmlFor="mainCurrency"
      >
        Main currency
        <Combobox value={selectedCurrency} onChange={setSelectedCurrency}>
          <div className="relative mt-2">
            <div className="relative w-full cursor-default overflow-hidden rounded-md bg-alice-base text-left">
              <Combobox.Input
                className="w-full rounded-md border p-2 text-base leading-5 text-gray-900"
                displayValue={(currency) => currency as string}
                required
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
              <Combobox.Options className="absolute mt-0 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {filteredCurrencies.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredCurrencies.map((currency) => (
                    <Combobox.Option
                      key={currency}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? 'bg-alice-accent text-white'
                            : 'text-gray-900'
                        }`
                      }
                      value={currency}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {currency}
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
      </label>
    </div>
  );
}
