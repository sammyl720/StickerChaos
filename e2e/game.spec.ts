import { expect, test } from '@playwright/test';
import { DEFAULT_PROGRESS } from '../src/state/progress';

test('start, transfer, undo, restart, and save settings', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('button',{name:/play/i}).first()).toBeVisible();
  await page.getByRole('button',{name:/play/i}).first().click();
  await expect(page.getByRole('heading',{name:'Pick a level!'})).toBeVisible();
  await page.getByRole('button',{name:/Level 1:/}).click();
  await expect(page.getByText('The Giant Chicken')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button',{name:/UNDO/}).waitFor();
  await page.getByRole('button',{name:/RESTART/}).click();
  await page.getByRole('button',{name:'Pause'}).click();
  await expect(page.getByRole('heading',{name:'Taking a breather?'})).toBeVisible();
  await page.getByRole('button',{name:'WORLD MAP'}).click();
  await page.getByRole('button',{name:'Back'}).click();
  await page.getByRole('button',{name:/SETTINGS/}).click();
  await page.getByRole('button',{name:'Tap to move'}).click();
  await page.reload();
  await page.getByRole('button',{name:/SETTINGS/}).click();
  await expect(page.getByRole('button',{name:'Tap to move'})).toHaveClass(/active/);
});

async function clickWorld(page: import('@playwright/test').Page, x:number, y:number) {
  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Canvas has no bounds');
  await canvas.click({position:{x:x*bounds.width/390,y:y*bounds.height/620}});
}

test('complete the first puzzle with a real sticker transfer and restore progress', async ({page}, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('button',{name:/PLAY/}).first()).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('home.png')});
  await page.getByRole('button',{name:/MY BANDIT/}).click();
  await page.screenshot({path:testInfo.outputPath('customization.png')});
  await page.getByRole('button',{name:'Back'}).click();
  await page.getByRole('button',{name:/STICKER BOOK/}).click();
  await page.screenshot({path:testInfo.outputPath('sticker-book.png')});
  await page.getByRole('button',{name:'Back'}).click();
  await page.getByRole('button',{name:/SETTINGS/}).click();
  await page.screenshot({path:testInfo.outputPath('settings.png')});
  await page.getByRole('button',{name:'Tap to move'}).click();
  await page.getByRole('button',{name:'Back'}).click();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.screenshot({path:testInfo.outputPath('world-map.png')});
  await page.getByRole('button',{name:/Level 1:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({path:testInfo.outputPath('tutorial.png')});
  await clickWorld(page,196,56); // BIG badge above the chicken
  await clickWorld(page,294,275); // apple
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('transferred.png')});
  await page.getByRole('button',{name:/UNDO/}).click();
  await expect(page.getByText('0/1 switches')).toBeVisible();
  await clickWorld(page,196,56);
  await clickWorld(page,294,275);
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await clickWorld(page,77,502); // present
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:5000});
  await clickWorld(page,70,62); // go around the chicken
  await page.waitForTimeout(3300);
  await clickWorld(page,195,62); // exit
  await expect(page.getByRole('heading',{name:'Sticker spectacular!'})).toBeVisible({timeout:5000});
  await page.screenshot({path:testInfo.outputPath('victory.png')});
  await page.reload();
  await page.getByRole('button',{name:/KEEP PLAYING/}).click();
  await expect(page.getByRole('button',{name:/Level 2:/})).toBeEnabled();
});

test('moving puzzle goals respond to BOUNCY and FLOATING', async ({page}, testInfo) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS, completedLevels: [1, 2, 3]
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 3:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({path:testInfo.outputPath('before-bouncy.png')});
  await clickWorld(page,86,229); // BOUNCY badge on the ball
  await clickWorld(page,294,270); // rock
  await page.screenshot({path:testInfo.outputPath('after-bouncy.png')});
  await expect(page.getByText('1/1 switches')).toBeVisible({timeout:4000});

  await page.getByRole('button',{name:'Pause'}).click();
  await page.getByRole('button',{name:'WORLD MAP'}).click();
  await page.getByRole('button',{name:/Level 4:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await clickWorld(page,86,229); // FLOATING badge on the frog
  await clickWorld(page,235,270); // boulder crosses the pond
  await expect(page.getByText('1/1 switches')).toBeVisible({timeout:5000});
});

test('giant bouncing ball reaches the factory switch', async ({page}) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS, completedLevels: Array.from({length:17},(_,index)=>index+1)
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 18:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await clickWorld(page,86,207); // BIG badge on the chicken
  await clickWorld(page,294,380); // ball
  await expect(page.getByText('BIG stuck to the ball!')).toBeVisible();
  await clickWorld(page,85,337); // BOUNCY badge on the robot
  await clickWorld(page,294,380); // launch the ball
  await expect(page.getByText('1/1 switches')).toBeVisible({timeout:5000});
});

for (const puzzle of [
  {number:2, sourceX:86, sourceY:270, sticker:'FAST', targetX:294, targetY:270},
  {number:15, sourceX:86, sourceY:270, sticker:'FAST', targetX:294, targetY:270},
  {number:16, sourceX:86, sourceY:270, sticker:'SLIPPERY', targetX:294, targetY:270}
]) {
  test(`level ${puzzle.number} moving switch activates`, async ({page}, testInfo) => {
    await page.goto('/');
    await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
      ...DEFAULT_PROGRESS, completedLevels: Array.from({length:puzzle.number-1},(_,index)=>index+1)
    });
    await page.reload();
    await page.getByRole('button',{name:/PLAY/}).first().click();
    await page.getByRole('button',{name:new RegExp(`Level ${puzzle.number}:`)}).click();
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(450);
    if (puzzle.number===15) await page.screenshot({path:testInfo.outputPath('before-selection.png')});
    const stickerButton = page.getByRole('button',{name:new RegExp(puzzle.sticker)});
    for (const [x,y] of [[puzzle.sourceX,puzzle.sourceY],[puzzle.sourceX+18,puzzle.sourceY],[puzzle.sourceX+36,puzzle.sourceY],[puzzle.sourceX+54,puzzle.sourceY],[puzzle.sourceX,puzzle.sourceY-43],[puzzle.sourceX+36,puzzle.sourceY-43]]) {
      if (await stickerButton.isVisible()) break;
      await clickWorld(page,x,y);
      await page.waitForTimeout(100);
    }
    if (puzzle.number===15) await page.screenshot({path:testInfo.outputPath('after-selection.png')});
    await stickerButton.click({timeout:3000});
    await clickWorld(page,puzzle.targetX,puzzle.targetY);
    await expect(page.getByText('1/1 switches')).toBeVisible({timeout:5000});
  });
}

test('FAST and SLIPPERY together send the turtle to its track', async ({page}) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS, completedLevels: Array.from({length:9},(_,index)=>index+1)
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 10:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await clickWorld(page,86,270);
  await page.getByRole('button',{name:/FAST/}).click();
  await clickWorld(page,294,380);
  await expect(page.getByText('FAST stuck to the turtle!')).toBeVisible();
  await clickWorld(page,85,334); // SLIPPERY badge on the crate
  await clickWorld(page,294,380);
  await expect(page.getByText('1/1 switches')).toBeVisible({timeout:5000});
});

test('TINY player fits through the castle passage and wins', async ({page}, testInfo) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS,
    settings:{...DEFAULT_PROGRESS.settings,controlMode:'tap'},
    completedLevels: Array.from({length:13},(_,index)=>index+1)
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 14:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await clickWorld(page,86,231); // TINY badge on the snail
  await clickWorld(page,193,495); // player
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await clickWorld(page,77,502); // treasure
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:5000});
  await clickWorld(page,195,255); // align with the narrow gap
  await page.waitForTimeout(1600);
  await page.screenshot({path:testInfo.outputPath('tiny-passage.png')});
  await clickWorld(page,195,62); // pass through to the exit
  await page.waitForTimeout(1800);
  await page.screenshot({path:testInfo.outputPath('after-passage.png')});
  await expect(page.getByRole('heading',{name:'Sticker spectacular!'})).toBeVisible({timeout:5000});
});

test('the chicken king boss needs two stickers on one rock', async ({page}) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS, completedLevels:[1,2,3,4]
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 5:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  await clickWorld(page,56,174); // BIG badge on the chicken king
  await clickWorld(page,294,270); // rock
  await expect(page.getByText('BIG stuck to the rock!')).toBeVisible();
  await clickWorld(page,90,193); // BOUNCY badge now centered above the king
  await clickWorld(page,294,270);
  await expect(page.getByText('1/1 switches')).toBeVisible();
});

test('final robot king powers all three switches', async ({page}) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS, completedLevels:Array.from({length:19},(_,index)=>index+1)
  });
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).first().click();
  await page.getByRole('button',{name:/Level 20:/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(500);
  for (const [sticker,targetX,targetY,goals] of [
    ['BIG',300,165,'1/3 switches'],
    ['FAST',300,290,'2/3 switches'],
    ['HEAVY',300,415,'3/3 switches']
  ] as const) {
    const pill = page.getByRole('button',{name:new RegExp(sticker)});
    for (const y of [270,290,240]) {
      for (const x of [85,110,135,160,185,210]) {
        if (await pill.isVisible()) break;
        await clickWorld(page,x,y);
        await page.waitForTimeout(50);
      }
      if (await pill.isVisible()) break;
    }
    await pill.click({timeout:3000});
    await clickWorld(page,targetX,targetY);
    await expect(page.getByText(goals)).toBeVisible({timeout:3000});
  }
});

test('earned costume and sticker discoveries survive reopening', async ({page}) => {
  await page.goto('/');
  await page.evaluate((progress) => localStorage.setItem('sticker-chaos-progress', JSON.stringify(progress)), {
    ...DEFAULT_PROGRESS,
    completedLevels:[1,2,3,4,5],
    unlockedCosmetics:['classic','rainbow'],
    achievements:['first-sticker'],
    stickerDiscoveries:['BIG'],
    transfers:1
  });
  await page.reload();
  await page.getByRole('button',{name:/MY BANDIT/}).click();
  await page.getByRole('button',{name:/Rainbow Hat/}).click();
  await expect(page.getByRole('heading',{name:'Rainbow Hat'})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:/MY BANDIT/}).click();
  await expect(page.getByRole('heading',{name:'Rainbow Hat'})).toBeVisible();
  await page.getByRole('button',{name:'Back'}).click();
  await page.getByRole('button',{name:/STICKER BOOK/}).click();
  await expect(page.getByRole('heading',{name:'BIG ✓'})).toBeVisible();
  await expect(page.getByText('First Sticker')).toBeVisible();
});
