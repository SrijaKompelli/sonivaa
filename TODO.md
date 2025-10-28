# TODO: Fix Diary Entry and Mood-Tagged Playlists

## Diary Entry Fixes
- [x] Add validation in diaryController.js createEntry: Ensure track exists, mood is valid, text is provided if required.
- [x] Improve error handling in client Search.js addDiary: Better error messages and ensure track is saved before diary entry.
- [x] Update client to handle server errors properly.

## Playlist Fixes
- [x] Add validation in playlistController.js createPlaylist: Ensure title is not empty, validate moodTags array.
- [x] Improve error handling in client Playlists.js create: Show specific error messages.
- [x] Update client Search.js addToPlaylist: Better error handling when adding tracks to playlists.

## General
- [ ] Test the fixes by running the app and attempting to create diary entries and playlists.
