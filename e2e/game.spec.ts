import { expect, test } from '@playwright/test';

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
