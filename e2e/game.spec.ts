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
