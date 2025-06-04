import { mapValues, sortBy } from 'lodash-es';

export default sortBy(
  Object.values(
    mapValues(
      {
        BFD4F2: ['blocking', 'breaking', 'important'],
        C2E0C6: ['active', 'blocked', 'maintenance', 'waiting-for'],
        EDEDED: ['released', 'semantic-release'],
      },
      (names, color) => names.map(name => ({ color, name })),
    ),
  ).flat(),
  'name',
);
