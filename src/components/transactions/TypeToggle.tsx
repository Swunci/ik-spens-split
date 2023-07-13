import { RadioGroup } from '@headlessui/react';
import type { Dispatch, SetStateAction } from 'react';

export default function TypeToggle({
  dataType,
  setDataType,
}: {
  dataType: string;
  setDataType: Dispatch<SetStateAction<string>>;
}) {
  return (
    <RadioGroup
      className="flexbox-row"
      value={dataType}
      onChange={(value) => setDataType(value)}
    >
      <RadioGroup.Label className="sr-only" />
      <div className="flexbox-row justify-start">
        <RadioGroup.Option
          key="transactions"
          value="transactions"
          className={({ active, checked }) =>
            `${active ? '' : ''}
            ${
              checked
                ? 'bg-alice-main bg-opacity-75 text-black'
                : 'bg-alice-base'
            }
            relative flex cursor-pointer border border-y-alice-accent border-l-alice-accent rounded-l-md focus:outline-none h-fit`
          }
        >
          {() => (
            <RadioGroup.Label
              as="button"
              className="px-4 py-3 font-medium text-black"
            >
              Transactions
            </RadioGroup.Label>
          )}
        </RadioGroup.Option>
        <RadioGroup.Option
          key="debts"
          value="debts"
          className={({ active, checked }) =>
            `${active ? '' : ''}
            ${
              checked
                ? 'bg-alice-main bg-opacity-75 text-black'
                : 'bg-alice-base'
            }
            relative flex cursor-pointer border border-alice-accent rounded-r-md focus:outline-none h-fit`
          }
        >
          {() => (
            <RadioGroup.Label
              as="button"
              className="px-4 py-3 font-medium text-black"
            >
              Paid Debts
            </RadioGroup.Label>
          )}
        </RadioGroup.Option>
      </div>
    </RadioGroup>
  );
}
