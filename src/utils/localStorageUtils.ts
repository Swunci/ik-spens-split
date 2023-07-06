import type { Group } from '@/interfaces/response';

function containsGroup(groups: Array<Group>, groupId: string) {
  for (let i = 0; i < groups.length; i += 1) {
    if (groups.at(i)?.groupId === groupId) {
      return true;
    }
  }
  return false;
}

function updateGroups(groups: Array<Group>, updatedGroup: Group) {
  const updatedGroups = groups.map((group) => {
    if (group.groupId === updatedGroup.groupId) {
      return updatedGroup;
    }
    return group;
  });
  return updatedGroups;
}

export function saveGroupToLocalStorage(group: Group) {
  if (!localStorage.getItem('groups')) {
    localStorage.setItem('groups', JSON.stringify(new Array<Group>()));
  }
  const groups: Array<Group> = JSON.parse(localStorage.getItem('groups')!);

  if (!containsGroup(groups, group.groupId)) {
    groups.push(group);
    localStorage.setItem('groups', JSON.stringify(groups));
  }
}

export function updateLocalStorageGroup(group: Group) {
  if (!localStorage.getItem('groups')) {
    localStorage.setItem('groups', JSON.stringify(new Array<Group>()));
  }
  let groups: Array<Group> = JSON.parse(localStorage.getItem('groups')!);
  if (containsGroup(groups, group.groupId)) {
    groups = updateGroups(groups, group);
  } else {
    groups.push(group);
  }
  localStorage.setItem('groups', JSON.stringify(groups));
}
