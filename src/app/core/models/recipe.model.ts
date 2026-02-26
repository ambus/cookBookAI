export type RecipeCategory =
  | 'Ciasta i słodycze'
  | 'Dania główne'
  | 'Imprezy'
  | 'Inne'
  | 'Rice Cakes'
  | 'Sałatki'
  | 'Śniadania i kolacje'
  | 'Warzywa'
  | 'Zupy';

export type RecipeRating = 'fatalne' | 'średnie' | 'dobre' | 'wyśmienite';

export interface Recipe {
  id?: string;
  title: string;
  category: RecipeCategory;
  rating?: RecipeRating;
  sourceUrl?: string;
  ingredients: string;
  instructions: string;
  createdAt?: string;
}
