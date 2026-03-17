import React from 'react';
import { TableList, TableListRow, FlySelect } from '@getflywheel/local-components';

/* eslint-disable @typescript-eslint/no-var-requires */
const packageJSON = require('../package.json');
const addonID = packageJSON.slug;

const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec, execFile } = require('child_process');
/* eslint-enable @typescript-eslint/no-var-requires */

function resolvePath (p: string): string {
	if (p.startsWith('~')) {
		return path.join(os.homedir(), p.slice(1));
	}
	return p;
}

function getSubdirs (dirPath: string): string[] {
	try {
		return fs.readdirSync(dirPath, { withFileTypes: true })
			.filter((e) => e.isDirectory() && !e.name.startsWith('.'))
			.map((e) => e.name)
			.sort();
	} catch {
		return [];
	}
}

function buildOptions (sitePath: string) {
	const resolved = resolvePath(sitePath);
	const wpRoot = path.join(resolved, 'app', 'public');
	const wpContent = path.join(wpRoot, 'wp-content');
	const pluginsDir = path.join(wpContent, 'plugins');
	const themesDir = path.join(wpContent, 'themes');

	const optionGroups = {
		wordpress: { label: 'WordPress' },
		plugins: { label: 'Plugins' },
		themes: { label: 'Themes' },
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const options: any = {};

	options[wpRoot] = { label: 'WordPress Root', optionGroup: 'wordpress' };
	options[wpContent] = { label: 'wp-content', optionGroup: 'wordpress' };
	options[pluginsDir] = { label: 'plugins', optionGroup: 'wordpress' };
	options[themesDir] = { label: 'themes', optionGroup: 'wordpress' };

	for (const name of getSubdirs(pluginsDir)) {
		options[path.join(pluginsDir, name)] = { label: name, optionGroup: 'plugins' };
	}

	for (const name of getSubdirs(themesDir)) {
		options[path.join(themesDir, name)] = { label: name, optionGroup: 'themes' };
	}

	return { options, optionGroups };
}

function escapeSingleQuotes (str: string): string {
	return str.replace(/'/g, "'\\''");
}

function openTerminal (folderPath: string): void {
	switch (process.platform) {
		case 'darwin':
			exec(`open -a Ghostty "${folderPath}"`, (err) => {
				if (err) {
					exec(`open -a iTerm "${folderPath}"`, (err2) => {
						if (err2) {
							exec(`open -a Terminal "${folderPath}"`);
						}
					});
				}
			});
			break;
		case 'win32':
			exec(`wt -d "${folderPath}"`, (err) => {
				if (err) {
					exec(`start cmd.exe /K "cd /d ${folderPath}"`);
				}
			});
			break;
		case 'linux':
			exec(
				`gnome-terminal --working-directory="${folderPath}" 2>/dev/null`
				+ ` || konsole --workdir "${folderPath}" 2>/dev/null`
				+ ` || xfce4-terminal --working-directory="${folderPath}" 2>/dev/null`
				+ ` || xterm -e 'cd "${folderPath}" && bash'`,
			);
			break;
	}
}

function openClaudeCode (folderPath: string): void {
	switch (process.platform) {
		case 'darwin': {
			const escapedPath = escapeSingleQuotes(folderPath);
			const tmpScript = path.join(os.tmpdir(), `claude-local-${Date.now()}.sh`);
			const scriptContent = `#!/bin/bash\ncd '${escapedPath}'\nclaude\n`;

			fs.writeFileSync(tmpScript, scriptContent, { mode: 0o755 });

			exec(`open -a Ghostty "${tmpScript}"`, (err) => {
				if (err) {
					const claudeCmd = `cd '${escapedPath}' && claude`;
					execFile('/usr/bin/osascript', [
						'-e', `tell application "Terminal" to do script "${claudeCmd}"`,
						'-e', 'tell application "Terminal" to activate',
					]);
				}

				setTimeout(() => {
					try {
						fs.unlinkSync(tmpScript);
					} catch (_e) {
						// ignore cleanup errors
					}
				}, 5000);
			});
			break;
		}
		case 'win32':
			exec(`wt -d "${folderPath}" cmd /K claude`, (err) => {
				if (err) {
					exec(`start cmd.exe /K "cd /d ${folderPath} && claude"`);
				}
			});
			break;
		case 'linux':
			exec(
				`gnome-terminal --working-directory="${folderPath}" -- bash -c "claude; bash" 2>/dev/null`
				+ ` || konsole --workdir "${folderPath}" -e bash -c "claude; bash" 2>/dev/null`
				+ ` || xfce4-terminal --working-directory="${folderPath}" -e "bash -c 'claude; bash'" 2>/dev/null`
				+ ` || xterm -e 'cd "${folderPath}" && claude'`,
			);
			break;
	}
}

function copyToClipboard (text: string): void {
	if (navigator && navigator.clipboard) {
		navigator.clipboard.writeText(text);
	}
}

function OpenTerminalPage (props) {
	const site = props.site || props.sites?.[props.match?.params?.siteID];

	if (!site) {
		return null;
	}

	const { options, optionGroups } = buildOptions(site.path);
	const noticeId = 'copy-path-notice-' + site.id;

	function showCopiedNotice (folderPath: string) {
		copyToClipboard(folderPath);
		const el = document.getElementById(noticeId);

		if (el) {
			el.textContent = `Copied: ${folderPath}`;
			el.style.display = 'block';
			setTimeout(() => {
				el.style.display = 'none';
			}, 5000);
		}
	}

	return (
		<div style={{ flex: '1', overflowY: 'auto', margin: '10px' }}>
			<TableList>
				<TableListRow key="open-terminal" label="Open Terminal">
					<FlySelect
						placeholder="Select a folder to open in terminal..."
						onChange={(value) => openTerminal(value)}
						options={options}
						optionGroups={optionGroups}
					/>
				</TableListRow>
				<TableListRow key="open-claude-code" label="Claude Code">
					<FlySelect
						placeholder="Select a folder to open Claude Code..."
						onChange={(value) => openClaudeCode(value)}
						options={options}
						optionGroups={optionGroups}
					/>
				</TableListRow>
				<TableListRow key="copy-folder-path" label="Copy Path">
					<FlySelect
						placeholder="Select a folder to copy its path..."
						onChange={(value) => showCopiedNotice(value)}
						options={options}
						optionGroups={optionGroups}
					/>
					<p
						id={noticeId}
						style={{ display: 'none', marginTop: '8px', color: '#51bb7b', fontSize: '12px' }}
					/>
				</TableListRow>
			</TableList>
		</div>
	);
}

export default function (context): void {
	const { hooks } = context;

	hooks.addFilter('siteInfoToolsItem', (menu) => [
		...menu,
		{
			menuItem: 'Open Terminal',
			path: `/${addonID}`,
			render: (props) => <OpenTerminalPage {...props} />,
		},
	]);
}
