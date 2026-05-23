import { common } from './common';
import { welcome } from './welcome';
import { profile } from './profile';
import { results } from './results';
import { resources } from './resources';
import { settings } from './settings';
import { actions } from './actions';

export const es: Record<string, string> = {
  ...common,
  ...welcome,
  ...profile,
  ...results,
  ...resources,
  ...settings,
  ...actions,
};
