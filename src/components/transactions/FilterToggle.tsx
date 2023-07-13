import { RadioGroup } from '@headlessui/react';
import type { Dispatch, SetStateAction } from 'react';

export default function FilterToggle({
  dataOwner,
  setDataOwner,
}: {
  dataOwner: string;
  setDataOwner: Dispatch<SetStateAction<string>>;
}) {
  return (
    <RadioGroup
      className="flexbox-row"
      value={dataOwner}
      onChange={(value) => setDataOwner(value)}
    >
      <RadioGroup.Label className="sr-only" />
      <div className="flexbox-row justify-start">
        <RadioGroup.Option
          key="all"
          value="all"
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
              All
            </RadioGroup.Label>
          )}
        </RadioGroup.Option>
        <RadioGroup.Option
          key="yours"
          value="yours"
          className={({ active, checked }) =>
            `${active ? '' : ''}
            ${
              checked
                ? 'bg-alice-main bg-opacity-75 text-black'
                : 'bg-alice-base'
            }
            relative flex cursor-pointer border border-alice-accent focus:outline-none h-fit`
          }
        >
          {() => (
            <RadioGroup.Label
              as="button"
              className="px-4 py-3 font-medium text-black"
            >
              Yours
            </RadioGroup.Label>
          )}
        </RadioGroup.Option>
        <RadioGroup.Option
          key="others"
          value="others"
          className={({ active, checked }) =>
            `${active ? '' : ''}
            ${
              checked
                ? 'bg-alice-main bg-opacity-75 text-black'
                : 'bg-alice-base'
            }
            relative flex cursor-pointer border border-y-alice-accent border-r-alice-accent rounded-r-md focus:outline-none h-fit`
          }
        >
          {() => (
            <RadioGroup.Label
              as="button"
              className="px-4 py-3 font-medium text-black"
            >
              Others
            </RadioGroup.Label>
          )}
        </RadioGroup.Option>
      </div>
    </RadioGroup>
  );
}
