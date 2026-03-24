const API_KEY = '95adc5035d8cca4e8850ff7ad9c23431';
const BASE_URL = 'https://api.themoviedb.org/3';

export const getTrending = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/all/week?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('getTrending error:', error);
    return [];
  }
};

export const getPopular = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('getPopular error:', error);
    return [];
  }
};

export const getTopRated = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('getTopRated error:', error);
    return [];
  }
};

export const getMovieDetails = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getMovieDetails error:', error);
    return null;
  }
};

export const getTVDetails = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getTVDetails error:', error);
    return null;
  }
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%23222" width="500" height="750"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const searchMulti = async (query) => {
  if (!query) return [];
  
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Failed to search');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('searchMulti error:', error);
    return [];
  }
};

export const getMoviesOnly = async (page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getMoviesOnly error:', error);
    return { results: [], total_pages: 0 };
  }
};

export const getTVShowsOnly = async (page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getTVShowsOnly error:', error);
    return { results: [], total_pages: 0 };
  }
};

export const getNewReleases = async (page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getNewReleases error:', error);
    return { results: [], total_pages: 0 };
  }
};