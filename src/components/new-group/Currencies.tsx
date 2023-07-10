import { currencyNameCodeMap } from '@/utils/currencyUtil';

export default function Currencies() {
  return (
    <>
      {[...currencyNameCodeMap.map.keys()].map((currencyName) => {
        return <option key={currencyName}>{currencyName}</option>;
      })}
    </>
  );
}
