export interface Story {
  id: string;
  title: string;
  targetAudience: 'child' | 'adult';
  category: string;
  coverImage: string;
  markdownContent: string;
  estimatedReadTime: string;
  author?: string;
  language: 'ar' | 'en';
  isReal: boolean;
}

import { allStories } from './allStoriesData';
export const stories: Story[] = allStories;
