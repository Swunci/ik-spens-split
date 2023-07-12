import { Grow, MenuList, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { SyntheticEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import useSwr from 'swr';
import * as XLSX from 'xlsx';

import type CustomError from '@/errors/customError';
import type { ShareCost } from '@/interfaces/request';
import type {
  Group,
  Member,
  PaidDebt,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import { TwoWayReadonlyMap } from '@/utils/currencyUtil';
import { fetcher } from '@/utils/fetcherWrapper';
import { getLocaleDateString } from '@/utils/timeUtils';

export default function Navbar() {
  const router = useRouter();

  const { group: groupId } = router.query;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const [memberIdToNameMap, setMemberIdToNameMap] = useState(
    new TwoWayReadonlyMap(new Map<string, string>())
  );

  const { data: groupData } = useSwr<Group, CustomError>(
    () => (groupId ? `/api/groups/${groupId}` : null),
    fetcher
  );

  const { data: transactionsData } = useSwr<TransactionResponse, CustomError>(
    () => (groupId ? `/api/groups/${groupId}/transactions` : null),
    fetcher
  );

  const { data: paidDebtsData } = useSwr<PaidDebtResponse, CustomError>(
    () => (groupId ? `/api/groups/${groupId}/debts` : null),
    fetcher
  );

  useEffect(() => {
    if (groupData) {
      const idNameMap = groupData.members.reduce(
        (map: Map<string, string>, member: Member) => {
          map.set(member.memberId, member.memberName);
          return map;
        },
        new Map<string, string>()
      );
      const readOnlyMap = new TwoWayReadonlyMap(idNameMap);
      setMemberIdToNameMap(readOnlyMap);
    }
  }, [groupData]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleNewGroup(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof groupId === 'string') {
      router.push('/new-group');
    }
    setOpen(false);
  }

  function handleEditGroup(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof groupId === 'string') {
      router.push(`/groups/${groupId}/edit`);
    }
    setOpen(false);
  }

  function handleHistoryClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof groupId === 'string') {
      router.push(`/groups/${groupId}/history`);
    }
    setOpen(false);
  }

  function handleExportToExcel(e: React.MouseEvent) {
    e.preventDefault();
    if (groupData && transactionsData && paidDebtsData) {
      const { members } = groupData;
      const jsonObjects: any[] = [];
      transactionsData.transactions.forEach((transaction: Transaction) => {
        const shareCostsWithName = new Map<string, string>();
        transaction.shareCosts.forEach((shareCost: ShareCost) => {
          shareCostsWithName.set(
            memberIdToNameMap.get(shareCost.memberId)!,
            shareCost.shareCost
          );
        });
        jsonObjects.push({
          date: getLocaleDateString(transaction.date),
          payer: memberIdToNameMap.get(transaction.payerId),
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          ...Object.fromEntries(shareCostsWithName.entries()),
        });
      });

      paidDebtsData.paidDebts.forEach((paidDebt: PaidDebt) => {
        const splitMap: Map<string, string> = new Map<string, string>();
        splitMap.set(
          memberIdToNameMap.get(paidDebt.creditor)!,
          paidDebt.amount
        );
        members.forEach((member: Member) => {
          if (!splitMap.has(member.memberName)) {
            splitMap.set(member.memberName, '0');
          }
        });
        jsonObjects.push({
          date: getLocaleDateString(paidDebt.date),
          payer: paidDebt.debtor,
          type: 'settlement',
          amount: paidDebt.amount,
          currency: paidDebt.currency,
          description: 'paid money back',
          ...Object.fromEntries(splitMap.entries()),
        });
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(jsonObjects);
      XLSX.utils.book_append_sheet(wb, ws, groupData.groupName);
      XLSX.writeFile(wb, `${groupData.groupName}.xlsx`);
    }
    setOpen(false);
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);
  return (
    <div className="z-50 flex h-12 w-screen flex-col items-center bg-alice-secondary shadow-md">
      <div className="flex-container-row h-12 w-screen justify-between bg-alice-secondary">
        <Link className="h-full" href="/" passHref>
          <button className="h-full text-base" type="button">
            Home
          </button>
        </Link>
        <div className="h-full">
          <Button
            className="h-full text-base"
            sx={{ textTransform: 'none' }}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <Typography className="text-black">More</Typography>
          </Button>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={(e) => handleListKeyDown(e)}
                    >
                      <MenuItem onClick={(e) => handleNewGroup(e)}>
                        New Group
                      </MenuItem>
                      <MenuItem onClick={(e) => handleEditGroup(e)}>
                        Edit Group
                      </MenuItem>
                      <MenuItem onClick={(e) => handleHistoryClick(e)}>
                        History
                      </MenuItem>
                      <MenuItem onClick={(e) => handleExportToExcel(e)}>
                        Export as Excel
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </div>
    </div>
  );
}
