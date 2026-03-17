# Open Terminal — Local WP Add-on

A [Local WP](https://localwp.com/) add-on that lets you quickly open a terminal, launch Claude Code, copy folder paths, or reveal folders in Finder — all from within Local's site interface.

## Features

- **Open Terminal** — Open any WordPress folder in your preferred terminal (Ghostty > iTerm > Terminal.app on macOS)
- **Claude Code** — Launch [Claude Code](https://claude.ai/claude-code) in a new terminal window at any site folder
- **Copy Path** — Copy the full path of any WordPress folder to your clipboard
- **Reveal in Finder** — Open the selected folder in Finder / Explorer / file manager

The folder picker shows all key WordPress directories grouped by category:
- **WordPress** — Root, wp-content, plugins, themes
- **Plugins** — Each installed plugin's directory
- **Themes** — Each installed theme's directory

## Screenshots

Select a folder from the dropdown, then use any of the action buttons:

![Open Terminal Add-on](https://img.shields.io/badge/Local_WP-Add--on-51bb7b)

## Installation

### Quick Install

1. Clone or download this repo into your Local add-ons directory:

   - **macOS:** `~/Library/Application Support/Local/addons`
   - **Windows:** `C:\Users\<username>\AppData\Roaming\Local\addons`
   - **Linux:** `~/.config/Local/addons`

2. Install dependencies and build:

   ```bash
   cd open-terminal-in-folder
   npm install
   npm run build
   ```

3. Restart Local and enable the add-on in **Preferences > Add-ons**

### Symlink Install (for development)

```bash
ln -s /path/to/open-terminal-in-folder ~/Library/Application\ Support/Local/addons/open-terminal
```

## Usage

1. Select a site in Local
2. Go to the **Tools** tab
3. Click **Open Terminal**
4. Choose a folder from the dropdown
5. Click any action button

## Terminal Support

### macOS
Opens in the first available terminal: **Ghostty** > **iTerm** > **Terminal.app**

### Windows
Opens in the first available terminal: **Windows Terminal** > **cmd.exe**

### Linux
Opens in the first available terminal: **gnome-terminal** > **konsole** > **xfce4-terminal** > **xterm**

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch for changes
npm run watch

# Lint
npm run lint
```

## License

MIT
