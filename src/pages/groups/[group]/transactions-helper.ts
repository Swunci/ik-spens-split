export function getYourShare(split: string, currentMember: string) {
  const splitObj = JSON.parse(split);
  return splitObj[currentMember]?.toFixed(2);
}

export function getInvolvedMembers(split: string) {
  const splitObj = JSON.parse(split);
  const groupSize = parseInt(localStorage.getItem('groupSize') ?? '0', 10);
  const memberNames = [...Object.keys(splitObj)];
  return groupSize === memberNames.length ? 'everyone' : memberNames.join(', ');
}

export function isMemberInvolved(split: string, memberName: string) {
  const splitObj: Object = JSON.parse(split);
  return memberName in splitObj;
}
