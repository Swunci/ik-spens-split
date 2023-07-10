import { CircularProgress } from '@mui/material';

import type { MemberDetails } from '@/pages/groups/[group]-helpers';

export default function Overview({
  groupCost,
  membersMap,
  currentMember,
  currencySymbol,
}: {
  groupCost: number;
  membersMap: Map<string, MemberDetails>;
  currentMember: string;
  currencySymbol: string;
}) {
  const debtAmount = membersMap.get(currentMember)?.debt ?? 0;
  const isLoading = membersMap.size === 0;
  return (
    <div className="w-full rounded bg-alice-main shadow-md">
      <div className="flexbox-row max-w-full p-2">
        <div className="w-full rounded px-2 text-center text-2xl">Overview</div>
      </div>
      <div className="flexbox-col w-full space-y-2  p-2 pt-0 text-lg">
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>Total group cost:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${groupCost.toFixed(2)}`
            )}
          </div>
        </div>
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>Your cost:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${membersMap.get(currentMember)?.cost.toFixed(2)}`
            )}
          </div>
        </div>
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>{`You've paid`}:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${membersMap.get(currentMember)?.paid.toFixed(2)}`
            )}
          </div>
        </div>
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>{`You've received`}:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${membersMap.get(currentMember)?.received.toFixed(2)}`
            )}
          </div>
        </div>
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>{debtAmount < 0 ? 'You owe' : 'You are owed'}:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${Math.abs(debtAmount).toFixed(2)}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
