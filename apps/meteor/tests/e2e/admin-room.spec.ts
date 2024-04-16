import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';

import { Users } from './fixtures/userStates';
import { Admin } from './page-objects';
import { createTargetChannel, createTargetPrivateChannel } from './utils';
import { expect, test } from './utils/test';

test.use({ storageState: Users.admin.state });

test.describe.serial('admin-rooms', () => {
	let adminPage: Page;
	let channel: string;
	let privateRoom: string;

	test.beforeEach(async ({ page }) => {
		await page.goto('/admin/rooms');
	});

	let admin: Admin;

	test.beforeEach(async ({ page }) => {
		admin = new Admin(page);
	});

	test.beforeAll(async ({ browser, api }) => {
		adminPage = await browser.newPage({ storageState: Users.admin.state });
		await adminPage.goto('/home');
		await adminPage.waitForSelector('[data-qa-id="home-header"]');

		channel = await createTargetChannel(api);
		privateRoom = await createTargetPrivateChannel(api);
	});
	test('should display the Rooms Table', async ({ page }) => {
		await expect(page.locator('[data-qa-type="PageHeader-title"]')).toContainText('Rooms');
	});

	test('should filter room by name', async ({ page }) => {
		await admin.inputSearchRooms.fill(channel);

		await expect(page.locator(`[qa-room-name="${channel}"]`)).toBeVisible();
	});

	test('should filter rooms by type', async ({ page }) => {
		await admin.dropdownFilterRoomType.click();

		const privateOption = page.locator('text=Private channels');

		await privateOption.waitFor();
		await privateOption.click();

		await expect(page.locator('text=Private Channel').first()).toBeVisible();
	});

	test('should filter rooms by type and name', async ({ page }) => {
		await admin.inputSearchRooms.fill(privateRoom);

		await admin.dropdownFilterRoomType.click();

		const privateOption = page.locator('text=Private channels');

		await privateOption.waitFor();
		await privateOption.click();

		await expect(page.locator(`[qa-room-name="${privateRoom}"]`)).toBeVisible();
	});

	test('should be empty in case of the search does not find any room', async ({ page }) => {
		const nonExistingChannel = faker.string.alpha(10);

		await admin.inputSearchRooms.fill(nonExistingChannel);

		await admin.dropdownFilterRoomType.click();

		const privateOption = page.locator('text=Private channels');

		await privateOption.waitFor();
		await privateOption.click();

		await expect(page.locator('text=No results found')).toBeVisible();
	});

	test('should filter rooms by type and name and keep the filter after changing section', async ({ page }) => {
		await admin.inputSearchRooms.fill(privateRoom);

		await admin.dropdownFilterRoomType.click();

		const privateOption = page.locator('text=Private channels');

		await privateOption.waitFor();
		await privateOption.click();

		await page.goto('/admin/info');

		await page.goto('/admin/rooms');

		const selectDropdown = page.locator('text=Rooms (1)');
		await expect(selectDropdown).toBeVisible();

		await selectDropdown.click();

		const isChecked = await privateOption.isChecked();

		expect(isChecked).toBe(true);

		await expect(admin.inputSearchRooms).toHaveValue(privateRoom);
	});
});
