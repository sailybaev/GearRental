export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  category: number;
  category_detail: Category;
  daily_rate: string;
  image: string | null;
  is_available: boolean;
}

export interface EquipmentFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
}
