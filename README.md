# Text Reader Chrome Extension

A simple Chrome extension that adds a "Read out loud" option to the right-click context menu for highlighted text.

## Features

- Right-click on any highlighted text to see "Read out loud" option
- Uses the Web Speech API for text-to-speech
- Visual feedback when text is being read
- Automatically selects the best available voice
- Works on any website
- **Stop reading instantly by pressing the Delete key**
- Context menu item "Stop Reading" is only enabled while reading

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `text-reader-extension` folder
5. The extension should now appear in your extensions list

## Usage

1. Highlight any text on any webpage
2. Right-click on the highlighted text
3. Select "Text Reader" > "Read out loud" from the context menu
4. The text will be read aloud using your system's text-to-speech
5. To stop reading, you can:
    - Right-click and select "Text Reader" > "Stop Reading"
    - **Press the Delete key on your keyboard**
    - Use the Stop button in the extension popup

## How it works

- **manifest.json**: Defines the extension structure and permissions
- **background.js**: Creates the context menu and handles menu clicks, enables/disables "Stop Reading"
- **content.js**: Implements the text-to-speech functionality, handles Delete key, and notifies background of reading state

## Customization

You can modify the speech settings in `content.js`:
- `utterance.rate`: Speech speed (0.1 to 10)
- `utterance.pitch`: Voice pitch (0 to 2)
- `utterance.volume`: Volume level (0 to 1)

## Browser Compatibility

This extension works with Chrome and other Chromium-based browsers (Edge, Brave, etc.) that support Manifest V3.

## Notes

- The extension requires the "contextMenus" and "activeTab" permissions
- Text-to-speech quality depends on your system's available voices
- The extension will automatically stop any currently playing speech before starting new text
- **You can always stop reading by pressing the Delete key** 