import { Track } from "discord-player";

export const pipe = <T>(...fns: ((arg: T) => T)[]) => (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);

export const parseSpotifyUrl = (url: string): string => {
const regex = /^(?:https:\/\/open\.spotify\.com\/(intl-([a-z]|[A-Z]){0,3}\/)?(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/;
  const match = url.match(regex);
  if (!match) return url;
  const [, , , type, id] = match;
  return `https://open.spotify.com/${type}/${id}`;
};

export const parseYoutubeUrl = (urlString: string): string => {
try {
    const url = new URL(urlString);
    if (!url.host.includes('youtube.com')) return urlString;
    const searchParams = url.searchParams;
    const videoId = searchParams.get('v');
    const playlistId = searchParams.get('list');
    if (playlistId) {
      return `https://www.youtube.com/playlist?list=${playlistId}`;
    }
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  } catch {
    return urlString;
  }
};

export const parseUrl = (url: string): string => {
  return pipe(
    parseSpotifyUrl,
    parseYoutubeUrl,
  )(url);
}

export const treatYoutubeList = (userQuery: string) => (tracks: Track<{id: string}>[]): Track[] => {
  try {
    const track = tracks[0];
    if (track?.playlist?.source !== 'youtube') { return tracks; }
    const url = new URL(userQuery);
    const searchParams = url.searchParams;
    const playlistId = searchParams.get('list');
    const videoId = searchParams.get('v');
    if (!playlistId || !videoId) { return tracks; }
    const videoIndex = tracks.findIndex((track) => track.metadata.id === videoId);
    if (videoIndex === -1) { return tracks; }
    const newTracks = tracks.slice(videoIndex);
    return newTracks;
  } catch {
    return tracks;
  }
}

export const treatList = (tracks: Track[], userQuery: string) => pipe(treatYoutubeList(userQuery))(tracks);
