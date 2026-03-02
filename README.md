# LinguaSpeak

I built `LinguaSpeak` as a simple and practical web app where users can translate English text into multiple languages and listen to the translated output.

## Objective

My goal was to create a lightweight translator that is:
- fast
- clean and easy to use
- directly accessible without login/signup

This project combines translation and speech so learning, communication, and daily usage become easier.

## Features

- Accepts English input text
- Translates into multiple target languages
- Shows character count for input and output
- Allows copying translated text
- Supports listening to translated output (voice playback)
- Supports quick translation with `Ctrl + Enter`

## Tech Stack

- `HTML`
- `CSS`
- `Vanilla JavaScript`
- Browser `SpeechSynthesis` API
- Google Translate endpoint (translation + TTS fallback)
- MyMemory API fallback (for better translation reliability)

## How to Run

1. Open the project folder.
2. Open `index.html` in your browser.
3. Enter English text in the input box.
4. Select a target language.
5. Click `Translate`.
6. For output:
   - Use `Listen` to hear audio
   - Use `Copy` to copy text to clipboard

## Project Structure

```txt
LinguaSpeak/
|-- index.html
|-- style.css
|-- script.js
`-- images/
```

## Important Notes

- The app requires internet because translation APIs are online.
- Some browsers may require clipboard/audio permissions.
- Local system voices may not be available for every language, so fallback TTS is used.

## Future Improvements

- Auto language detection
- Translation history
- Dark/light theme toggle
- Mobile-first UI refinements
- Explore offline or self-hosted translation options

## Author

**Sarthak Bhadauriya**  
**Full stack Developer**
