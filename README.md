# Dev Shortcuts — Local WP Add-on

A [Local WP](https://localwp.com/) add-on that gives you quick developer shortcuts — open a terminal, launch Claude Code, copy folder paths, or reveal folders in Finder — all from within Local's site interface.

## Demo

https://github.com/aslamdoctor/local-addon-dev-shortcuts/raw/master/assets/demo.mp4

## Features

- **Open Terminal** — Open any WordPress folder in your preferred terminal (Ghostty > iTerm > Terminal.app on macOS)
- **Claude Code** — Launch [Claude Code](https://claude.ai/claude-code) in a new terminal window at any site folder
- **Copy Path** — Copy the full path of any WordPress folder to your clipboard
- **Reveal in Finder** — Open the selected folder in Finder / Explorer / file manager

The folder picker shows all key WordPress directories grouped by category:
- **WordPress** — Root, wp-content, plugins, themes
- **Plugins** — Each installed plugin's directory
- **Themes** — Each installed theme's directory

## Installation

### Quick Install

1. Clone or download this repo into your Local add-ons directory:

   - **macOS:** `~/Library/Application Support/Local/addons`
   - **Windows:** `C:\Users\<username>\AppData\Roaming\Local\addons`
   - **Linux:** `~/.config/Local/addons`

2. Install dependencies and build:

   ```bash
   cd local-addon-dev-shortcuts
   npm install
   npm run build
   ```

3. Restart Local and enable the add-on in **Preferences > Add-ons**

### Symlink Install (for development)

```bash
ln -s /path/to/local-addon-dev-shortcuts ~/Library/Application\ Support/Local/addons/dev-shortcuts
```

## Usage

1. Select a site in Local
2. Go to the **Tools** tab
3. Click **Dev Shortcuts**
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
