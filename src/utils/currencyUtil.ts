import Decimal from 'decimal.js';

const currencyDetails = {
  AFN: { name: 'Afghan Afghani', symbol: '؋' },
  ALL: { name: 'Albanian Lek', symbol: 'Lek' },
  DZD: { name: 'Algerian Dinar', symbol: 'دج' },
  AOA: { name: 'Angolan Kwanza', symbol: 'Kz' },
  ARS: { name: 'Argentine Peso', symbol: '$' },
  AMD: { name: 'Armenian Dram', symbol: '֏' },
  AWG: { name: 'Aruban Florin', symbol: 'ƒ' },
  AUD: { name: 'Australian Dollar', symbol: '$' },
  AZN: { name: 'Azerbaijani Manat', symbol: 'm' },
  BSD: { name: 'Bahamian Dollar', symbol: 'B$' },
  BHD: { name: 'Bahraini Dinar', symbol: '.د.ب' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳' },
  BBD: { name: 'Barbadian Dollar', symbol: 'Bds$' },
  BYN: { name: 'Belarusian Ruble', symbol: 'Br' },
  BZD: { name: 'Belize Dollar', symbol: '$' },
  BMD: { name: 'Bermudan Dollar', symbol: '$' },
  BTN: { name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  BOB: { name: 'Bolivian Boliviano', symbol: 'Bs.' },
  BAM: { name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  BWP: { name: 'Botswanan Pula', symbol: 'P' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  GBP: { name: 'British Pound Sterling', symbol: '£' },
  BND: { name: 'Brunei Dollar', symbol: 'B$' },
  BGN: { name: 'Bulgarian Lev', symbol: 'Лв.' },
  BIF: { name: 'Burundian Franc', symbol: 'FBu' },
  KHR: { name: 'Cambodian Riel', symbol: 'KHR' },
  CAD: { name: 'Canadian Dollar', symbol: '$' },
  CVE: { name: 'Cape Verdean Escudo', symbol: '$' },
  KYD: { name: 'Cayman Islands Dollar', symbol: '$' },
  XOF: { name: 'CFA Franc BCEAO', symbol: 'CFA' },
  XAF: { name: 'CFA Franc BEAC', symbol: 'FCFA' },
  XPF: { name: 'CFP Franc', symbol: '₣' },
  CLP: { name: 'Chilean Peso', symbol: '$' },
  CLF: { name: 'Chilean Unit of Account', symbol: 'CLF' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  COP: { name: 'Colombian Peso', symbol: '$' },
  KMF: { name: 'Comorian Franc', symbol: 'CF' },
  CDF: { name: 'Congolese Franc', symbol: 'FC' },
  CRC: { name: 'Costa Rican Colón', symbol: '₡' },
  HRK: { name: 'Croatian Kuna', symbol: 'kn' },
  CUP: { name: 'Cuban Peso', symbol: '$' },
  CZK: { name: 'Czech Republic Koruna', symbol: 'Kč' },
  DKK: { name: 'Danish Krone', symbol: 'Kr.' },
  DJF: { name: 'Djiboutian Franc', symbol: 'Fdj' },
  DOP: { name: 'Dominican Peso', symbol: '$' },
  XCD: { name: 'East Caribbean Dollar', symbol: '$' },
  EGP: { name: 'Egyptian Pound', symbol: 'ج.م' },
  ERN: { name: 'Eritrean Nakfa', symbol: 'Nfk' },
  ETB: { name: 'Ethiopian Birr', symbol: 'Nkf' },
  EUR: { name: 'Euro', symbol: '€' },
  FKP: { name: 'Falkland Islands Pound', symbol: '£' },
  FJD: { name: 'Fijian Dollar', symbol: 'FJ$' },
  GMD: { name: 'Gambian Dalasi', symbol: 'D' },
  GEL: { name: 'Georgian Lari', symbol: 'ლ' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵' },
  GIP: { name: 'Gibraltar Pound', symbol: '£' },
  XAU: { name: 'Gold', symbol: 'Ounce' },
  GTQ: { name: 'Guatemalan Quetzal', symbol: 'Q' },
  GGP: { name: 'Guernsey Pounds', symbol: '£' },
  GNF: { name: 'Guinean Franc', symbol: 'FG' },
  GYD: { name: 'Guyanaese Dollar', symbol: '$' },
  HTG: { name: 'Haitian Gourde', symbol: 'G' },
  HNL: { name: 'Honduran Lempira', symbol: 'L' },
  HKD: { name: 'Hong Kong Dollar', symbol: '$' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
  ISK: { name: 'Icelandic Króna', symbol: 'kr' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
  IRR: { name: 'Iranian Rial', symbol: '﷼' },
  IQD: { name: 'Iraqi Dinar', symbol: 'د.ع' },
  ILS: { name: 'Israeli New Sheqel', symbol: '₪' },
  JMD: { name: 'Jamaican Dollar', symbol: 'J$' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  JEP: { name: 'Jersey Pound', symbol: '£' },
  JOD: { name: 'Jordanian Dinar', symbol: 'ا.د' },
  KZT: { name: 'Kazakhstani Tenge', symbol: 'лв' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh' },
  KWD: { name: 'Kuwaiti Dinar', symbol: 'ك.د' },
  KGS: { name: 'Kyrgystani Som', symbol: 'лв' },
  LAK: { name: 'Laotian Kip', symbol: '₭' },
  LVL: { name: 'Latvian Lats', symbol: 'Ls' },
  LBP: { name: 'Lebanese Pound', symbol: '£' },
  LSL: { name: 'Lesotho Loti', symbol: 'L' },
  LRD: { name: 'Liberian Dollar', symbol: '$' },
  LYD: { name: 'Libyan Dinar', symbol: 'د.ل' },
  LTL: { name: 'Lithuanian Litas', symbol: 'Lt' },
  MOP: { name: 'Macanese Pataca', symbol: '$' },
  MKD: { name: 'Macedonian Denar', symbol: 'ден' },
  MGA: { name: 'Malagasy Ariary', symbol: 'Ar' },
  MWK: { name: 'Malawian Kwacha', symbol: 'MK' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  MVR: { name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  IMP: { name: 'Manx Pound', symbol: '£' },
  MRO: { name: 'Mauritanian Ouguiya', symbol: 'MRU' },
  MUR: { name: 'Mauritian Rupee', symbol: '₨' },
  MXN: { name: 'Mexican Peso', symbol: '$' },
  MDL: { name: 'Moldovan Leu', symbol: 'L' },
  MNT: { name: 'Mongolian Tugrik', symbol: '₮' },
  MAD: { name: 'Moroccan Dirham', symbol: 'MAD' },
  MZN: { name: 'Mozambican Metical', symbol: 'MT' },
  MMK: { name: 'Myanmar Kyat', symbol: 'K' },
  NAD: { name: 'Namibian Dollar', symbol: '$' },
  NPR: { name: 'Nepalese Rupee', symbol: '₨' },
  ANG: { name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
  TWD: { name: 'New Taiwan Dollar', symbol: '$' },
  NZD: { name: 'New Zealand Dollar', symbol: '$' },
  NIO: { name: 'Nicaraguan Córdoba', symbol: 'C$' },
  NGN: { name: 'Nigerian Naira', symbol: '₦' },
  KPW: { name: 'North Korean Won', symbol: '₩' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr' },
  OMR: { name: 'Omani Rial', symbol: '.ع.ر' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨' },
  PAB: { name: 'Panamanian Balboa', symbol: 'B/.' },
  PGK: { name: 'Papua New Guinean Kina', symbol: 'K' },
  PYG: { name: 'Paraguayan Guarani', symbol: '₲' },
  PEN: { name: 'Peruvian Nuevo Sol', symbol: 'S/.' },
  PHP: { name: 'Philippine Peso', symbol: '₱' },
  PLN: { name: 'Polish Zloty', symbol: 'zł' },
  QAR: { name: 'Qatari Rial', symbol: 'ق.ر' },
  RON: { name: 'Romanian Leu', symbol: 'lei' },
  RUB: { name: 'Russian Ruble', symbol: '₽' },
  RWF: { name: 'Rwandan Franc', symbol: 'FRw' },
  SVC: { name: 'Salvadoran Colón', symbol: '₡' },
  WST: { name: 'Samoan Tala', symbol: 'SAT' },
  STD: { name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼' },
  RSD: { name: 'Serbian Dinar', symbol: 'din' },
  SCR: { name: 'Seychellois Rupee', symbol: 'SRe' },
  SLE: { name: 'Sierra Leonean Leone', symbol: 'Le' },
  SGD: { name: 'Singapore Dollar', symbol: '$' },
  XAG: { name: 'Silver Ounce', symbol: 'Ounce' },
  SBD: { name: 'Solomon Islands Dollar', symbol: 'Si$' },
  SOS: { name: 'Somali Shilling', symbol: 'Sh.so.' },
  ZAR: { name: 'South African Rand', symbol: 'R' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  XDR: { name: 'Special Drawing Rights', symbol: 'SDR' },
  LKR: { name: 'Sri Lankan Rupee', symbol: 'Rs' },
  SHP: { name: 'St. Helena Pound', symbol: '£' },
  SDG: { name: 'Sudanese Pound', symbol: '.س.ج' },
  SRD: { name: 'Surinamese Dollar', symbol: '$' },
  SZL: { name: 'Swazi Lilangeni', symbol: 'E' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  CHF: { name: 'Swiss Franc', symbol: 'CHf' },
  SYP: { name: 'Syrian Pound', symbol: 'LS' },
  TJS: { name: 'Tajikistani Somoni', symbol: 'SM' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh' },
  THB: { name: 'Thai Baht', symbol: '฿' },
  TOP: { name: "Tongan Pa'anga", symbol: '$' },
  TTD: { name: 'Trinidad & Tobago Dollar', symbol: '$' },
  TND: { name: 'Tunisian Dinar', symbol: 'ت.د' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  TMT: { name: 'Turkmenistani Manat', symbol: 'T' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh' },
  UAH: { name: 'Ukrainian Hryvnia', symbol: '₴' },
  AED: { name: 'United Arab Emirates Dirham', symbol: 'إ.د' },
  UYU: { name: 'Uruguayan Peso', symbol: '$' },
  USD: { name: 'US Dollar', symbol: '$' },
  UZS: { name: 'Uzbekistan Som', symbol: 'лв' },
  VUV: { name: 'Vanuatu Vatu', symbol: 'VT' },
  VES: { name: 'Venezuelan BolÃvar', symbol: 'Bs' },
  VND: { name: 'Vietnamese Dong', symbol: '₫' },
  YER: { name: 'Yemeni Rial', symbol: '﷼' },
  ZMW: { name: 'Zambian Kwacha', symbol: 'ZK' },
  ZWL: { name: 'Zimbabwean dollar', symbol: '$' },
};

export class TwoWayReadonlyMap<T, K> {
  map: Map<T, K>;

  reverseMap: Map<K, T>;

  constructor(map: Map<T, K>) {
    this.map = map;
    this.reverseMap = new Map<K, T>();
    map.forEach((value, key) => {
      this.reverseMap.set(value, key);
    });
  }

  get(key: T) {
    return this.map.get(key);
  }

  revGet(key: K) {
    return this.reverseMap.get(key);
  }
}

const nameSymbolMap = Object.entries(currencyDetails).reduce(
  (map, [_code, value]) => {
    map.set(value.name, value.symbol);
    return map;
  },
  new Map<string, string>()
);

const nameCodeMap = Object.entries(currencyDetails).reduce(
  (map, [code, value]) => {
    map.set(value.name, code);
    return map;
  },
  new Map<string, string>()
);

const codeSymbolMap = Object.entries(currencyDetails).reduce(
  (map, [code, value]) => {
    map.set(code, value.symbol);
    return map;
  },
  new Map<string, string>()
);

export const currencyNameSymbolMap = nameSymbolMap;
export const currencyNameCodeMap = new TwoWayReadonlyMap(nameCodeMap);
export const currencyCodeSymbolMap = codeSymbolMap;

export function getDecimalPrecisionCurrency(number: number, precision: number) {
  return parseFloat(number.toFixed(precision));
}

function addCommasToNumber(num: string) {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function displayWithCommas(num: string) {
  const index = num.lastIndexOf('.');
  if (index !== -1) {
    const numWithCommas = addCommasToNumber(num.slice(0, index));
    return `${numWithCommas}${num.slice(index)}`;
  }
  return addCommasToNumber(num);
}

export function trimLeadingZeros(num: string) {
  let indexAfterLastLeadingZero = 0;
  for (let i = 0; i < num.length; i += 1) {
    if (num.charAt(i) !== '0') {
      break;
    }
    indexAfterLastLeadingZero += 1;
  }
  const value = num.slice(indexAfterLastLeadingZero);
  if (value === '' || value.charAt(0) === '.') {
    return `0${value}`;
  }
  return value;
}

export interface ExchangeRate {
  currency: string;
  rate: Decimal;
}

const quotes = {
  AED: 3.673102,
  AFN: 86.159371,
  ALL: 90.217733,
  AMD: 392.368126,
  ANG: 1.812974,
  AOA: 827.498647,
  ARS: 268.588898,
  AUD: 1.476765,
  AWG: 1.8,
  AZN: 1.696759,
  BAM: 1.756034,
  BBD: 2.03111,
  BDT: 109.188694,
  BGN: 1.75664,
  BHD: 0.376969,
  BIF: 2846.7789,
  BMD: 1,
  BND: 1.33064,
  BOB: 6.966398,
  BRL: 4.798304,
  BSD: 1.005953,
  BTC: 3.3474927e-5,
  BTN: 82.539529,
  BWP: 13.133109,
  BYN: 2.539124,
  BYR: 19600,
  BZD: 2.027699,
  CAD: 1.31692,
  CDF: 2480.000238,
  CHF: 0.8661,
  CLF: 0.029609,
  CLP: 817.000335,
  CNY: 7.171204,
  COP: 3979,
  CRC: 539.882919,
  CUC: 1,
  CUP: 26.5,
  CVE: 98.997989,
  CZK: 21.520803,
  DJF: 179.113992,
  DKK: 6.68875,
  DOP: 56.466384,
  DZD: 134.795177,
  EGP: 30.799699,
  ERN: 15,
  ETB: 55.387247,
  EUR: 0.897765,
  FJD: 2.218298,
  FKP: 0.778294,
  GBP: 0.77644,
  GEL: 2.56498,
  GGP: 0.778294,
  GHS: 11.673969,
  GIP: 0.778294,
  GMD: 59.697109,
  GNF: 8651.851852,
  GTQ: 7.896745,
  GYD: 210.455433,
  HKD: 7.815795,
  HNL: 24.762965,
  HRK: 6.723859,
  HTG: 137.310887,
  HUF: 342.64022,
  IDR: 15015,
  ILS: 3.612675,
  IMP: 0.778294,
  INR: 82.068501,
  IQD: 1317.788392,
  IRR: 42250.000133,
  ISK: 131.339827,
  JEP: 0.778294,
  JMD: 155.250281,
  JOD: 0.7091,
  JPY: 140.111496,
  KES: 141.820371,
  KGS: 87.870343,
  KHR: 4154.433221,
  KMF: 439.050007,
  KPW: 899.95041,
  KRW: 1281.589622,
  KWD: 0.30691,
  KYD: 0.838331,
  KZT: 447.15199,
  LAK: 19213.934592,
  LBP: 15099.347262,
  LKR: 328.212541,
  LRD: 184.750191,
  LSL: 17.859681,
  LTL: 2.95274,
  LVL: 0.60489,
  LYD: 4.764043,
  MAD: 9.786357,
  MDL: 17.554051,
  MGA: 4465.993266,
  MKD: 55.325606,
  MMK: 2112.464872,
  MNT: 3453.920695,
  MOP: 8.094652,
  MRO: 356.999828,
  MUR: 45.250079,
  MVR: 15.397023,
  MWK: 1059.753086,
  MXN: 16.892602,
  MYR: 4.553033,
  MZN: 63.249867,
  NAD: 17.860181,
  NGN: 791.009993,
  NIO: 36.794613,
  NOK: 10.046895,
  NPR: 132.061665,
  NZD: 1.607165,
  OMR: 0.385011,
  PAB: 1.005962,
  PEN: 3.605894,
  PGK: 3.596857,
  PHP: 54.6975,
  PKR: 286.196128,
  PLN: 3.996889,
  PYG: 7320.149941,
  QAR: 3.640994,
  RON: 4.4259,
  RSD: 105.20981,
  RUB: 90.09797,
  RWF: 1176.666008,
  SAR: 3.751448,
  SBD: 8.347827,
  SCR: 13.160186,
  SDG: 600.497535,
  SEK: 10.332545,
  SGD: 1.32703,
  SHP: 1.21675,
  SLE: 20.546507,
  SLL: 19749.999962,
  SOS: 569.499529,
  SRD: 38.267009,
  STD: 20697.981008,
  SVC: 8.802615,
  SYP: 2512.434176,
  SZL: 17.867404,
  THB: 34.291989,
  TJS: 11.020328,
  TMT: 3.5,
  TND: 3.029503,
  TOP: 2.34015,
  TRY: 26.8542,
  TTD: 6.78768,
  TWD: 31.195496,
  TZS: 2445.000117,
  UAH: 37.152054,
  UGX: 3666.85821,
  UYU: 38.302686,
  USD: 1,
  UZS: 11662.192374,
  VEF: 2884215.762281,
  VES: 28.842802,
  VND: 23653.5,
  VUV: 117.845256,
  WST: 2.708418,
  XAF: 588.967802,
  XAG: 0.040202,
  XAU: 0.000507,
  XCD: 2.70255,
  XDR: 0.742716,
  XOF: 588.957226,
  XPF: 106.749845,
  YER: 250.299797,
  ZAR: 17.91855,
  ZMK: 9001.200568,
  ZMW: 19.389913,
  ZWL: 321.999592,
};

export const ratesMap = new Map<string, Decimal>();

Array.from(Object.entries(quotes)).forEach(([code, rate]) => {
  ratesMap.set(code, new Decimal(rate));
});
