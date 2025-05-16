import { Exercise, YoutubeVideo } from '@/types/exercise';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const exerciseOptions = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY || ''
    }
};

export const fetchRecommendations = async (exerciseName: string) => {
  try {
    const response = await fetch(
      `http://localhost:5500/api/recommendations?exercise=${encodeURIComponent(exerciseName)}`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener recomendaciones');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const youtubeOptions = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Host': 'youtube-search-and-download.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY || ''
    }
};
export const fetchData = async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => {
    try {
        const url = `${API_URL}${endpoint}`;
        const response = await axios.get<{ data: T; success: boolean }>(url, { params });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
export const getExercises = async (params: Record<string, any> = {}): Promise<Exercise[]> => {
    return fetchData<Exercise[]>('/exercises', params);
};

export const getBodyPartList = async (): Promise<string[]> => {
    return fetchData<string[]>('/exercises/bodyPartList');
};


export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
    return fetchData<Exercise[]>(`/exercises/bodyPart/${bodyPart}`);
};


export const getSimilarExercises = async (id: string): Promise<Exercise[]> => {
    return fetchData<Exercise[]>(`/exercises/${id}/similar`);
};

export const searchExercises = async (term: string): Promise<Exercise[]> => {
    return fetchData<Exercise[]>('/exercises', { search: term });
};


export const getExerciseById = async (id: string): Promise<Exercise> => {
    const exercise = await fetchData<Exercise>(`/exercises/${id}`, {
        fields: 'name,gifUrl,target,equipment,bodyPart,id'
    });
    // Fallback para gifUrl si no está presente
    return {
        ...exercise,
        gifUrl: exercise.gifUrl ||
            `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}/gif`
    };
};

// Interfaz para la respuesta de YouTube
interface YouTubeSearchResponse {
    contents: Array<{
        type: string;
        video: {
            videoId: string;
            title: string;
            thumbnails: Array<{
                url: string;
                height: number;
                width: number;
            }>;
            viewCountText?: string;
            channelName?: string;
            author?: {
                name?: string;
            };
        };
    }>;
}
// fetchUtils.ts (Sección de YouTube)
export const fetchYoutubeVideos = async (exerciseName: string): Promise<YoutubeVideo[]> => {
    try {
        const response = await axios.get('https://youtube-search-and-download.p.rapidapi.com/search', {
            ...youtubeOptions,
            params: {
                query: `${exerciseName} exercise`,
                hl: 'en',
                gl: 'US',
                upload_date: 'month',
                type: 'video',
                duration: 'medium',
            }
        });
        console.log("API Response:", response.data);
        const data = response.data as YouTubeSearchResponse;

        // Procesamiento seguro con tipos correctos
        const videos = data.contents
            .filter((item) => item.video?.videoId) // Filtro simplificado
            .slice(0, 3)
            .map((item) => {
                const { video } = item;
                return {
                    videoId: video.videoId,
                    title: video.title,
                    thumbnailUrl: video.thumbnails?.length > 0
                        ? video.thumbnails[video.thumbnails.length - 1].url
                        : '/assets/images/video-placeholder.png',
                    channelName: video.channelName || 'Unknown',
                    viewCount: video.viewCountText?.replace(/\D/g, '') || '0'
                };
            });

        return videos;
    } catch (error) {
        console.error('YouTube API Error:', error);
        throw new Error('Error fetching videos');
    }
};