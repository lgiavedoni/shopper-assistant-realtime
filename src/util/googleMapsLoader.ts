import { Loader } from '@googlemaps/js-api-loader';
import dotenv from 'dotenv';
dotenv.config();

export const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry']
});
