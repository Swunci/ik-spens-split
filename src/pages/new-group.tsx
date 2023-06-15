import type { ChangeEvent } from 'react';
import { useState } from 'react';

import MembersList from '@/componenets/new-group/MembersList';
import { RootLayout } from '@/layouts/RootLayout';

export default function NewGroup() {
  const [newMembersInput, setNewMembersInput] = useState('');
  const [currentMembers, setCurrentMembers] = useState(new Set<string>());

  const handleNewMembersInput = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMembersInput(e.target.value);
  };

  const onAddMember = () => {
    let hasNewMember: boolean = false;
    const newMembers = newMembersInput.split(',').reduce((result, value) => {
      const name = value.trim();
      if (!currentMembers.has(name)) {
        hasNewMember = true;
      }
      if (name !== '') {
        result.push(name);
      }
      return result;
    }, new Array<string>());
    setCurrentMembers(new Set([...currentMembers, ...newMembers]));
    if (hasNewMember) {
      setNewMembersInput('');
      return;
    }
    console.log('Members already exist');
  };

  const onDeleteMember = (member: string) => {
    currentMembers.delete(member);
    setCurrentMembers(new Set([...currentMembers]));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <RootLayout>
      <div className="w-full overscroll-none p-2 text-2xl">
        Create a new group
      </div>
      <form
        className="flex w-full flex-col items-start"
        action=""
        method="post"
        onSubmit={handleSubmit}
      >
        <label className="flex w-full flex-col p-2" htmlFor="groupName">
          Group name
          <input
            className="mt-2 rounded p-1"
            id="groupName"
            type="text"
            placeholder="Trip to ?"
            required
          />
        </label>
        <label className="flex flex-col p-2" htmlFor="mainCurrency">
          Main currency
          <select
            className="mt-2 rounded bg-white p-1"
            id="mainCurrency"
            required
          >
            <option>USD</option>
            <option>EUR</option>
            <option>CAD</option>
            <option>YEN</option>
            <option>RMB</option>
            <option>WON</option>
          </select>
        </label>
        <label className="flex w-full flex-col p-2" htmlFor="addMembers">
          Add member(s)
          <div className="flex flex-row place-content-between">
            <input
              className="mt-2 w-full rounded p-1"
              id="addMembers"
              type="text"
              placeholder="Alice, Bob, Charlie"
              onChange={handleNewMembersInput}
              value={newMembersInput}
            />
            <button
              className="mt-2 rounded bg-orange-400 p-2 px-4"
              type="button"
              onClick={onAddMember}
            >
              Add
            </button>
          </div>
        </label>
        <div className="flex w-fit max-w-full flex-col space-y-2 p-2">
          <div>Current members ({currentMembers.size})</div>
          <MembersList
            currentMembers={currentMembers}
            onDelete={onDeleteMember}
          />
        </div>
        <button className="m-2 bg-green-700 p-2" type="submit">
          Create group
        </button>
      </form>
    </RootLayout>
  );
}
