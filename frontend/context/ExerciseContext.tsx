// context/ExerciseContext.tsx

'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ExerciseContextType {
  selectedExerciseName: string;
  setSelectedExerciseName: (name: string) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedExerciseName, setSelectedExerciseName] = useState('');

  return (
    <ExerciseContext.Provider value={{ selectedExerciseName, setSelectedExerciseName }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExerciseContext = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
};
