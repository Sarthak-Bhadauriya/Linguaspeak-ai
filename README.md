# LinguaSpeak

Main ne `LinguaSpeak` ek simple aur practical web app ke roop me banaya hai jahan user English text ko multiple languages me translate kar sakta hai aur uska audio bhi sun sakta hai.

## Mera Objective

Mera goal tha ek lightweight translator banana jo:
- fast ho
- clean UI de
- extra signup/login ke bina directly kaam kare

Is project me maine translation + speech dono ko combine kiya hai taaki learning, communication aur quick usage easy ho.

## Kya Karta Hai

- English input leta hai
- multiple target languages me translate karta hai
- translated text ka character count dikhata hai
- translated output ko copy karne deta hai
- translated text ko listen karne deta hai (voice support ke saath)
- `Ctrl + Enter` shortcut se quick translate support karta hai

## Tech Stack

- `HTML`
- `CSS`
- `Vanilla JavaScript`
- Browser `SpeechSynthesis` API
- Google Translate endpoint (translation + TTS fallback)
- MyMemory API fallback (translation reliability ke liye)

## Kaise Chalaye

1. Project folder open karein.
2. `index.html` browser me open karein.
3. Input box me English text likhein.
4. Target language select karein.
5. `Translate` click karein.
6. Output ke liye:
   - `Listen` se audio sun sakte hain
   - `Copy` se text clipboard me le sakte hain

## Project Structure

```txt
LinguaSpeak/
|-- index.html
|-- style.css
|-- script.js
`-- images/
```

## Important Notes (Meri Side Se)

- App internet dependent hai kyunki translation APIs online hain.
- Kuch browsers me clipboard/audio permissions required ho sakti hain.
- Har language ke liye local system voice available hona zaroori nahi hota, isliye fallback TTS use hota hai.

## Future Improvements (Jo Main Add Karna Chahta Hoon)

- auto language detection
- translation history
- dark/light theme toggle
- mobile-first UI refinements
- offline ya self-hosted translation option explore karna

## Author

**Sarthak Bhadauriya**  
**Full stack Developer**
