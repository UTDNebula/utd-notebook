import type { SvgIconComponent } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';

export const mainCats = ['Home', 'Create Note'] as const;
export const moreCats = ['About'] as const;
export const personalCats = ['Admin'] as const;

export type allCats =
  | (typeof mainCats)[number]
  | (typeof moreCats)[number]
  | (typeof personalCats)[number];
export const IconMap: {
  [key in allCats[number]]: SvgIconComponent;
} = {
  Home: HomeIcon,
  About: HelpIcon,
  'Create Note': AddIcon,
  Admin: GavelIcon,
};

export const routeMap: {
  [key in allCats[number]]: string;
} = {
  Home: '/',
  About: 'https://www.utdnebula.com/projects/notebook',
  'Create Note': '/notes/create',
  Admin: '/admin',
};
