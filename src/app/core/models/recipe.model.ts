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

export interface Recipe {
  id?: string;
  title: string;
  category: RecipeCategory;
  sourceUrl?: string;
  ingredients: string;
  instructions: string;
  createdAt?: string;
}
