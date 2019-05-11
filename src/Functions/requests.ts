import axios from "axios";
import {
  Song,
  Token,
  getUserFavouriteSongs,
  getUserInformations
} from "../Actions/index";
import { store } from "../Stores/index";
import { saveUserAlbums, getUserAlbums } from "../Actions/albums";
export const spotifyConnection = axios.create({
  baseURL: "https://api.spotify.com/v1"
});

// temp solution, because somehow when I move my config to separate file it won't compile
export const apiConnection = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "http://192.168.1.48:8080"
});

type AvailableSongsResponse = {
  data: Song[];
};

export async function getAvailableSongs() {
  return apiConnection
    .get("/songs")
    .then((res: AvailableSongsResponse) => res.data);
}

export async function toggleSongNsfw(songId: number, isNsfw: boolean) {
  return apiConnection
    .put(`/songs/${songId}/${isNsfw}`)
    .then(res => console.log(res));
}

// get user data from spotify and save it in the store
export async function fetchSpotifyData() {
  const userInformations = await getUserInformations();
  const userAlbums = await getUserAlbums();
  store.dispatch(userInformations);
  store.dispatch(userAlbums);
  const userSongs = await getUserFavouriteSongs(store.dispatch);
}
