import { Loader } from '@googlemaps/js-api-loader';

export const loader = new Loader({
  apiKey: "AIzaSyDAZgWJSX9vYkmpQG4z2vJYIUmUSOwivQ4",
  version: 'weekly',
  libraries: ['places', 'geometry']
});
