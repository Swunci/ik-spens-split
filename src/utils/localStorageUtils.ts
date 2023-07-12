function containsGroup(groupIds: Array<string>, groupId: string) {
  return groupIds.includes(groupId);
}

function removeGroupId(groupIds: Array<string>, groupId: string) {
  const index = groupIds.indexOf(groupId);
  if (index > -1) {
    groupIds.splice(index);
  }
  return groupIds;
}

export function saveGroupToLocalStorage(groupId: string) {
  if (!localStorage.getItem('groupIds')) {
    localStorage.setItem('groupIds', JSON.stringify(new Array<string>()));
  }
  const groupIds: Array<string> = JSON.parse(localStorage.getItem('groupIds')!);

  if (!containsGroup(groupIds, groupId)) {
    groupIds.push(groupId);
    localStorage.setItem('groupIds', JSON.stringify(groupIds));
  }
}

export function removeGroupFromLocalStorage(groupId: string) {
  if (!localStorage.getItem('groupIds')) {
    localStorage.setItem('groupIds', JSON.stringify(new Array<string>()));
  }
  const groupIds: Array<string> = JSON.parse(localStorage.getItem('groupIds')!);
  localStorage.setItem(
    'groupIds',
    JSON.stringify(removeGroupId(groupIds, groupId))
  );
}
