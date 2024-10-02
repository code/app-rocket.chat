import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import AppsUsageCard from './AppsUsageCard';

const appRoot = mockAppRoot().withTranslations('en', 'core', {
	Apps_InfoText_limited:
		'Community workspaces can enable up to {{marketplaceAppsMaxCount}} marketplace apps. Private apps can only be enabled in <1>premium plans</1>.',
	Apps_InfoText:
		'Community allows up to {{privateAppsMaxCount}} private apps and {{marketplaceAppsMaxCount}} marketplace apps to be enabled',
});

it('should render a skeleton if no data', () => {
	render(<AppsUsageCard />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
	expect(screen.getByRole('presentation')).toBeInTheDocument();
});

it('should render data as progress bars', async () => {
	render(<AppsUsageCard privateAppsLimit={{ value: 1, max: 3 }} marketplaceAppsLimit={{ value: 2, max: 5 }} />, {
		wrapper: appRoot.build(),
		legacyRoot: true,
	});

	expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Click_here_for_more_info' })).toBeInTheDocument();

	expect(screen.getByRole('progressbar', { name: 'Marketplace_apps' })).toBeInTheDocument();
	expect(screen.getByRole('progressbar', { name: 'Marketplace_apps' })).toHaveAttribute('aria-valuenow', '40');
	expect(screen.getByText('2 / 5')).toBeInTheDocument();

	expect(screen.getByRole('progressbar', { name: 'Private_apps' })).toBeInTheDocument();
	expect(screen.getByRole('progressbar', { name: 'Private_apps' })).toHaveAttribute('aria-valuenow', '33');
	expect(screen.getByText('1 / 3')).toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: 'Click_here_for_more_info' }));

	expect(
		screen.getByText('Community workspaces can enable up to 5 marketplace apps. Private apps can only be enabled in premium plans.'),
	).toBeInTheDocument();
});

it('should render an upgrade button if marketplace apps reached 80% of the limit', async () => {
	render(<AppsUsageCard privateAppsLimit={{ value: 1, max: 3 }} marketplaceAppsLimit={{ value: 4, max: 5 }} />, {
		wrapper: appRoot.build(),
		legacyRoot: true,
	});

	expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Click_here_for_more_info' })).toBeInTheDocument();

	expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: 'Click_here_for_more_info' }));

	expect(
		screen.getByText('Community workspaces can enable up to 5 marketplace apps. Private apps can only be enabled in premium plans.'),
	).toBeInTheDocument();
});

it('should render a full progress bar with private apps disabled', async () => {
	render(<AppsUsageCard privateAppsLimit={{ value: 0, max: 0 }} marketplaceAppsLimit={{ value: 2, max: 5 }} />, {
		wrapper: appRoot.build(),
		legacyRoot: true,
	});

	expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Click_here_for_more_info' })).toBeInTheDocument();

	expect(screen.getByRole('progressbar', { name: 'Marketplace_apps' })).toBeInTheDocument();
	expect(screen.getByRole('progressbar', { name: 'Marketplace_apps' })).toHaveAttribute('aria-valuenow', '40');
	expect(screen.getByText('2 / 5')).toBeInTheDocument();

	expect(screen.getByRole('progressbar', { name: 'Private_apps' })).toBeInTheDocument();
	expect(screen.getByRole('progressbar', { name: 'Private_apps' })).toHaveAttribute('aria-valuenow', '100');
	expect(screen.getByText('0 / 0')).toBeInTheDocument();

	await userEvent.click(screen.getByRole('button', { name: 'Click_here_for_more_info' }));

	expect(screen.getByText('Community allows up to 0 private apps and 5 marketplace apps to be enabled')).toBeInTheDocument();
});