import React from 'react';
import { Button, FlySelect } from '@getflywheel/local-components';

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

function openInFinder (folderPath: string): void {
	switch (process.platform) {
		case 'darwin':
			exec(`open "${folderPath}"`);
			break;
		case 'win32':
			exec(`explorer "${folderPath}"`);
			break;
		case 'linux':
			exec(`xdg-open "${folderPath}"`);
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
	const buttonsId = 'open-terminal-buttons-' + site.id;
	const selectedPathId = 'open-terminal-selected-path-' + site.id;
	const noticeId = 'copy-path-notice-' + site.id;
	let selectedFolder = '';

	function onFolderSelected (value) {
		selectedFolder = value;
		const buttonsEl = document.getElementById(buttonsId);
		const pathEl = document.getElementById(selectedPathId);

		if (buttonsEl) {
			buttonsEl.style.display = 'flex';
		}

		if (pathEl) {
			pathEl.textContent = value;
			pathEl.style.display = 'block';
		}
	}

	function handleCopyPath () {
		if (!selectedFolder) {
			return;
		}

		copyToClipboard(selectedFolder);
		const el = document.getElementById(noticeId);

		if (el) {
			el.textContent = `Copied: ${selectedFolder}`;
			el.style.display = 'block';
			setTimeout(() => {
				el.style.display = 'none';
			}, 5000);
		}
	}

	return (
		<div style={{ flex: '1', overflowY: 'auto', padding: '30px' }}>
			<div style={{ marginBottom: '20px' }}>
				<h3 style={{ marginBottom: '4px' }}>Select a folder</h3>
				<p style={{ marginBottom: '12px', color: '#999', fontSize: '13px' }}>
					Choose a WordPress folder, then open it in a terminal, launch Claude Code, or copy the path.
				</p>
				<FlySelect
					placeholder="Select a folder..."
					onChange={(value) => onFolderSelected(value)}
					options={options}
					optionGroups={optionGroups}
				/>
			</div>
			<p
				id={selectedPathId}
				style={{
					display: 'none',
					marginBottom: '16px',
					padding: '8px 12px',
					background: 'rgba(0, 0, 0, 0.05)',
					borderRadius: '4px',
					fontSize: '12px',
					fontFamily: 'monospace',
					color: '#aaa',
					wordBreak: 'break-all',
				}}
			/>
			<div
				id={buttonsId}
				style={{ display: 'none', gap: '10px', alignItems: 'center' }}
			>
				<Button onClick={() => openTerminal(selectedFolder)}>
					Open Terminal
				</Button>
				<Button onClick={() => openClaudeCode(selectedFolder)}>
					Open Claude Code
				</Button>
				<Button onClick={() => handleCopyPath()}>
					Copy Path
				</Button>
				<Button onClick={() => openInFinder(selectedFolder)}>
					Reveal in Finder
				</Button>
			</div>
			<p
				id={noticeId}
				style={{ display: 'none', marginTop: '8px', color: '#51bb7b', fontSize: '12px' }}
			/>
		</div>
	);
}

export default function (context): void {
	const { hooks } = context;

	hooks.addFilter('siteInfoToolsItem', (menu) => [
		...menu,
		{
			menuItem: 'Dev Shortcuts',
			path: `/${addonID}`,
			render: (props) => <OpenTerminalPage {...props} />,
		},
	]);
}
