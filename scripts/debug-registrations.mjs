
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load the env correctly
console.log('Loading .env from:', path.resolve(__dirname, '../.env'));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN is missing!');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function checkRegistrations() {
  console.log('Fetching registrations...');
  const query = `*[_type == "eventRegistration"]{
    _id,
    name,
    clerkId,
    status,
    "userEmail": user->email,
    user->{_id, email, clerkId}
  }`;

  try {
    const registrations = await client.fetch(query);
    console.log(JSON.stringify(registrations, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

checkRegistrations();
