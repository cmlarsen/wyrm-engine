import { readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import {
  CharacterSubtypeEnum,
  CharacterTypeEnum,
} from '../src/lib/CharacterCreator';
import { createEngine } from '../src/lib/create-engine';

import { range } from 'lodash';
import { simulateLoop } from './functions';

function generateChart(
  outputFilePath: string,
  chartDef: {
    data: number[][];
    title: string;
  },
) {
  const data = JSON.stringify(chartDef.data);
  const title = JSON.stringify(chartDef.title);

  const template = readFileSync('./tools/surface-chart.mustache').toString();
  const output = render(template, { data, title });
  writeFileSync(outputFilePath, output);
}

const wyrmEngine = createEngine({
  statPointsPerLevel: 3,
  statsModifiers: {
    damage: 1,
    attackPower: 1.5,
    armorPenetration: 1,
    hitRating: 1,
    initiative: 1,
    dodge: 0.7,
    dmgReduction: 1,
  },
  maxHpModifier: 5,
  damageConfig: {
    startDamage: 10,
    damagePerLevel: 1,
  },
  armorConfig: {
    startArmor: 20,
    armorPerLevel: 3,
  },
});

const winRatioData: number[][] = range(1, 61).map(firstLevel =>
  range(1, 61).map(
    secondLevel =>
      simulateLoop(
        wyrmEngine,
        firstLevel,
        secondLevel,
        CharacterTypeEnum.Strong,
        CharacterSubtypeEnum.Balanced,
        CharacterTypeEnum.Strong,
        CharacterSubtypeEnum.Balanced,
        100,
      ).winRatio,
  ),
);

generateChart(`./out/win_ratio_diff.html`, {
  title: 'Win ratio level difference',
  data: winRatioData,
});
