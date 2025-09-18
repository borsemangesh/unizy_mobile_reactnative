export type Language = {
  id: number;
  code: string;
  name: string;
  flag: any;
};

export const languages: Language[] = [
  {
    id: 1,
    code: 'en',
    name: 'English',
    flag: require('../../../assets/images/english.png'),
  },
  {
    id: 2,
    code: 'es',
    name: 'Spanish',
    flag: require('../../../assets/images/spanish.png'),
  },
  {
    id: 3,
    code: 'fr',
    name: 'French',
    flag: require('../../../assets/images/french.png'),
  },
  {
    id: 4,
    code: 'sv',
    name: 'Swedish',
    flag: require('../../../assets/images/swedish.png'),
  },
  {
    id: 5,
    code: 'it',
    name: 'Italian',
    flag: require('../../../assets/images/italian.png'),
  },
  {
    id: 6,
    code: 'de',
    name: 'German',
    flag: require('../../../assets/images/german.png'),
  },
  {
    id: 7,
    code: 'pt',
    name: 'Portuguese',
    flag: require('../../../assets/images/portuguese.png'),
  },
];