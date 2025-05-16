'use client';

import { Exercise } from '@/types/exercise';
import { useEffect, useState } from 'react';
import ExerciseCard from '../ui/ExerciseCard';

interface ApiResponse {
  recommendations: Exercise[];
}

interface SimilarExercisesProps {
  exerciseName: string;
}

const SimilarExercises = ({ exerciseName }: SimilarExercisesProps) => {
  const [similarExercises, setSimilarExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!exerciseName) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:8000/api/recommendations/?exercise_name=${encodeURIComponent(exerciseName)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recommendations');
        }

        const data: ApiResponse = await response.json();
        setSimilarExercises(data.recommendations);
      } catch (err) {
        console.error('Error fetching similar exercises:', err);
        setError(err instanceof Error ? err.message : 'Failed to load similar exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [exerciseName]);

  if (loading) {
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6">Similar Exercises</h3>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500" />
          <span className="ml-3">Loading similar exercises...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6">Similar Exercises</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (similarExercises.length === 0) {
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6">Similar Exercises</h3>
        <p className="text-gray-600">No similar exercises found</p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold mb-6">Similar Exercises</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            className="hover:scale-105 transition-transform duration-300"
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarExercises;