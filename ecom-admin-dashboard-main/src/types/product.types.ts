export type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: Category;
    stock?: number;
    sku?: string;
    status?: 'active' | 'inactive' | 'draft';
    productImages?: string[];
    fields?: Record<string, string>;
    createdBy?: string;
    updatedAt?: string;
    hasVariations?: boolean; // Flag indicating if product has variations
};

export type ProductCreate = Omit<Product, '_id' | 'createdBy' | 'updatedAt'>;

// Updated Category type to match the API response
export type Category = {
    _id: string;
    name: string;
    description: string;
    fields: {
        _id: string;
        name: string;
        type: string;
        required: boolean;
    }[];
    createdBy: string;
};

export type CategoryCreate = Omit<Category, '_id' | 'createdBy'>;

export type FieldValues = {
    name: string;
    value: string | number;
}

export type CategoryField = {
    _id: string;
    name: string;
    type: string;
    required: boolean;
}

export type CategoryFieldCreate = Omit<CategoryField, '_id'>;