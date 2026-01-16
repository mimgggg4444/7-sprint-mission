import dotenv from 'dotenv';
dotenv.config();

export const DATABASE_URL: string | undefined = process.env.DATABASE_URL;
export const PORT: string | number = process.env.PORT || 3000;
export const PUBLIC_PATH: string = './public';
export const STATIC_PATH: string = '/public';
