import { Grow, MenuList, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useSwr from 'swr';
import * as XLSX from 'xlsx';

import type CustomError from '@/errors/customError';
import type {
  Group,
  PaidDebt,
  PaidDebtResponse,
  Transaction,
  TransactionResponse,
} from '@/interfaces/response';
import { fetcher } from '@/utils/fetcherWrapper';
import { getLocaleDateString } from '@/utils/timeUtils';

export default function Navbar() {
  const router = useRouter();

  const { group: groupId } = router.query;

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

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

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
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
      const { memberNames } = groupData;
      const jsonObjects: any[] = [];
      transactionsData.transactions.forEach((transaction: Transaction) => {
        const splitMap: Map<string, number> = new Map<string, number>(
          Object.entries(JSON.parse(transaction.split))
        );
        memberNames.forEach((name: string) => {
          if (splitMap.has(name)) {
            splitMap.set(name, parseFloat(splitMap.get(name)!.toFixed(2)));
          } else {
            splitMap.set(name, 0.0);
          }
        });
        jsonObjects.push({
          date: getLocaleDateString(transaction.date),
          payer: transaction.payer,
          type: transaction.type,
          amount: parseFloat(transaction.amount.toFixed(2)),
          currency: transaction.currency,
          description: transaction.description,
          ...Object.fromEntries(splitMap.entries()),
        });
      });

      paidDebtsData.paidDebts.forEach((paidDebt: PaidDebt) => {
        const splitMap: Map<string, number> = new Map<string, number>();
        splitMap.set(paidDebt.creditor, parseFloat(paidDebt.amount.toFixed(2)));
        memberNames.forEach((name: string) => {
          if (!splitMap.has(name)) {
            splitMap.set(name, 0.0);
          }
        });
        jsonObjects.push({
          date: getLocaleDateString(paidDebt.date),
          payer: paidDebt.debtor,
          type: 'settlement',
          amount: parseFloat(paidDebt.amount.toFixed(2)),
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
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
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
