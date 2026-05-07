import React from 'react';
import { X } from 'lucide-react';
import { Exercise, Recipe } from '@/data/fitnessData';

interface Props {
  item: Exercise | Recipe;
  onClose: () => void;
}

const ExerciseModal: React.FC<Props> = ({ item, onClose }) => {
  const isExercise = 'steps' in item && 'image' in item;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border/40 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border/40 flex items-center justify-center hover:bg-background/80 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {isExercise && (
            <div className="lg:w-1/2 bg-accent/5 p-8 flex items-center justify-center">
              <img 
                src={(item as Exercise).image} 
                alt={item.name}
                className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl animate-in zoom-in-50 duration-500"
              />
            </div>
          )}

          <div className={`${isExercise ? 'lg:w-1/2' : 'w-full'} p-8 overflow-y-auto custom-scrollbar`}>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-naskh mb-2">{'name' in item ? item.name : item.title}</h2>
                <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                  {'content' in item ? item.content : ('description' in item ? item.description : '')}
                </p>
              </div>

              {'ingredients' in item && item.ingredients && (
                <div className="space-y-3">
                  <h3 className="font-bold font-naskh text-primary">المكونات:</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {item.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-naskh bg-primary/5 p-2 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.steps && (
                <div className="space-y-3">
                  <h3 className="font-bold font-naskh text-primary">الخطوات:</h3>
                  <div className="space-y-4">
                    {item.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-lg bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-sm font-naskh leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
