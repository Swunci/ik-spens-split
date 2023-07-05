import { Grow, MenuList } from '@mui/material';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export default function Navbar() {
  const router = useRouter();

  const { group: groupId } = router.query;

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

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

  function handleHistoryClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof groupId === 'string') {
      router.push(`/groups/${groupId}/history`);
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
            className="h-full text-base text-black"
            sx={{ textTransform: 'none' }}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            More
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
                      <MenuItem onClick={handleClose}>Edit Group</MenuItem>
                      <MenuItem onClick={(e) => handleHistoryClick(e)}>
                        History
                      </MenuItem>
                      <MenuItem onClick={handleClose}>Export as Excel</MenuItem>
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
