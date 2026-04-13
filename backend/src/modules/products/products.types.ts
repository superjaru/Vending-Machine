export interface CreateProductDto {
  name: string;
  nameEn?: string;
  price_thb: number;
  category?: string;
  image_url?: string;
}

export interface UpdateProductDto {
  name?: string;
  nameEn?: string;
  price_thb?: number;
  category?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  category?: string;
  active?: boolean;
}
