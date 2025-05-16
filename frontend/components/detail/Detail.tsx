// src/components/detail/Detail.tsx
import { Box, Dumbbell, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SimpleParallax from "simple-parallax-js";
import SimilarExercises from './SimilarExcercises';

interface DetailProps {
  exerciseDetail: {
    name: string;
    gifUrl?: string;
    target?: string;
    equipment?: string;
    bodyPart?: string;
    id?: string;
  };
}



const Detail: React.FC<DetailProps> = ({ exerciseDetail }) => {
  const { name, gifUrl, target, equipment, bodyPart, id } = exerciseDetail;
  const [imgError, setImgError] = useState(false);

  // Imagen de respaldo
  const fallbackImg = '/assets/images/exercise-placeholder.png';
  
  // Opcionalmente, podríamos intentar cargar la imagen directamente de RapidAPI
  // si la original falla (descomentar esto si quieres usar RapidAPI como backup)
  
  const rapidApiGifUrl = id ? 
    `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}/gif` : 
    fallbackImg;
  

  const extraDetails = [
    {
      icon: <UserCircle2 size={24} className="text-red-500" />,
      name: bodyPart,
      label: "Body Part",
      bgColor: "bg-red-100",
      textColor: "text-red-600"
    },
    {
      icon: <Box size={24} className="text-blue-500" />,
      name: target,
      label: "Target",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      icon: <Dumbbell size={24} className="text-green-500" />,
      name: equipment,
      label: "Equipment",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 items-center">
      <div className="relative w-full max-w-md aspect-square">
      <SimpleParallax>

      <Image
          src={imgError ? fallbackImg : (gifUrl || rapidApiGifUrl)}
          alt={name}
          width={800}
          height={600}
          quality={80}
          priority={false}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover aspect-square"
          onLoadingComplete={(img) => img.style.opacity = '1'}
          onError={() => setImgError(true)}
          style={{ transition: 'opacity 0.3s', opacity: 0 }}
        />
        </SimpleParallax>
      </div>

      {/* Exercise Information */}
      <div className="flex flex-col gap-6 max-w-xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold capitalize">{name}</h2>
        
        <p className="text-gray-700 text-lg">
          Exercises keep you strong. <span className="capitalize">{name}</span> is one
          of the best exercises to target your {target}. It will help you improve your
          mood and gain energy.
        </p>

        {/* Detail Items */}
        <div className="flex flex-col gap-6 mt-4">
          {extraDetails.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`${item.bgColor} w-16 h-16 rounded-full flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className={`${item.textColor} text-lg font-semibold capitalize`}>{item.name}</span>
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    {/* Sección de ejercicios recomendados */}
    {id && name && (
      <SimilarExercises 
        id={id} 
        exerciseName={name}  // Pasa el nombre del ejercicio como prop
      />
      )}
    </div>
  );
};

export default Detail;