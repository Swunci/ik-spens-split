import { CircularProgress } from '@mui/material';
import Decimal from 'decimal.js';

import type { MemberDetails } from '@/pages/groups/[group]-helpers';

export default function Overview({
  groupCost,
  membersMap,
  currentMemberId,
  currencySymbol,
}: {
  groupCost: Decimal;
  membersMap: Map<string, MemberDetails>;
  currentMemberId: string;
  currencySymbol: string;
}) {
  const debtAmount: Decimal =
    membersMap.get(currentMemberId)?.debt ?? new Decimal(0);
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
            ${membersMap.get(currentMemberId)?.cost.toFixed(2)}`
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
            ${membersMap.get(currentMemberId)?.paid.toFixed(2)}`
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
            ${membersMap.get(currentMemberId)?.received.toFixed(2)}`
            )}
          </div>
        </div>
        <div className="flexbox-row border-b-2 border-alice-accent p-2">
          <div>{debtAmount.lessThan(0) ? 'You owe' : 'You are owed'}:</div>
          <div>
            {isLoading ? (
              <CircularProgress size="1.25rem" className="text-alice-accent" />
            ) : (
              `${currencySymbol}
            ${debtAmount.absoluteValue().toFixed(2)}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
