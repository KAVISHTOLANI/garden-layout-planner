import { expect, test } from '@playwright/test';
import { checkMobile, snap } from './helpers';

test('plan a garden with the pointer and keyboard', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('before you dig');
  await page.waitForTimeout(1200);
  await snap(page, 'landing');
  await checkMobile(page, 'landing-mobile');

  await page.getByRole('link', { name: 'Open the planner' }).first().click();
  await expect(page.getByTestId('check-summary')).toContainText('1 crowded');
  await page.getByRole('button', { name: 'Show on map' }).first().click();
  await snap(page, 'plan');
  await checkMobile(page, 'plan-mobile');

  // Draw a new bed by dragging in the empty bottom-right corner (cells 12–17, rows 9–10).
  const map = page.getByRole('application');
  await page.getByRole('radio', { name: 'Draw bed' }).click();
  let box = (await map.boundingBox())!;
  const cell = (x: number, y: number) => ({ x: box.x + (x + 0.5) * (box.width / 20), y: box.y + (y + 0.5) * (box.height / 13) });
  await page.mouse.move(cell(12, 9).x, cell(12, 9).y);
  await page.mouse.down();
  await page.mouse.move(cell(17, 10).x, cell(17, 10).y, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByText('Bed 4 added: 1.8 × 0.6 m.').first()).toBeVisible();
  await page.getByRole('radio', { name: 'Place plant' }).click();
  await page.getByLabel('Plant', { exact: true }).selectOption('kale');
  await map.scrollIntoViewIfNeeded();
  box = (await map.boundingBox())!;
  await page.mouse.click(cell(13, 9).x, cell(13, 9).y);
  await page.mouse.click(cell(14, 9).x, cell(14, 9).y);
  await expect(page.getByTestId('check-summary')).toContainText('2 crowded');
  await page.reload();
  await expect(page.getByTestId('check-summary')).toContainText('2 crowded');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Plants' }).click();
  await page.getByLabel('Sun').selectOption('shade');
  await expect(page.getByText('2 shown')).toBeVisible();
  await snap(page, 'plants');
  await checkMobile(page);

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Plant list' }).click();
  await expect(page.getByTestId('count-kale')).toHaveText('2');
  await snap(page, 'list');
});
