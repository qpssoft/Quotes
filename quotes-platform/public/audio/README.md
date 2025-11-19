# Audio Notification

The app currently uses a **generated bell sound** via Web Audio API (no file needed).

## To add a custom notification sound (optional):

1. **Download a sound file:**
   - Visit [Freesound.org](https://freesound.org/) and search for "bell" or "chime"
   - Or use [YouTube Audio Library](https://www.youtube.com/audiolibrary)
   - Download as MP3 format

2. **Save the file:**
   - Place the MP3 file in this folder
   - Name it: `notification.mp3`

3. **Enable the audio file:**
   - Open `src/app/core/services/audio.service.ts`
   - In the `constructor()`, uncomment the line: `this.preloadAudio();`

4. **License requirements:**
   - Ensure the audio is licensed for your use case
   - Provide attribution if required
   - Document the source and license here

## Current setup:
✅ Generated bell sound using Web Audio API (800Hz fundamental with harmonics)  
⚠️ No MP3 file loaded (avoids 404 error)  
📝 To use a custom MP3, follow the steps above