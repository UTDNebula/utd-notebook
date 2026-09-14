/*
Fetch the aggregated data from the API
Taken from UTD Trends; run with npm run fetchdata
*/
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config({ path: '.env.local' });

const API_URL = process.env.NEBULA_API_URL;
const API_KEY = process.env.NEBULA_API_KEY;

// Wrap the logic in an async function to allow 'await'
async function fetchData() {
  if (typeof API_URL !== 'string') {
    console.error('API URL is undefined');
    return;
  }

  if (typeof API_KEY !== 'string') {
    console.error('API key is undefined');
    return;
  }

  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };

  try {
    console.log('Fetching aggregated data...');
    const response = await fetch(API_URL + 'autocomplete/dag', {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    writeFileSync(
      'src/data/aggregated_data.json',
      JSON.stringify(data, null, 2),
    );
    console.log(
      'Aggregated data fetched and saved to src/data/aggregated_data.json',
    );
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// Execute the function
fetchData();
