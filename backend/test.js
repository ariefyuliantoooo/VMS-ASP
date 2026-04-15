const { Client } = require('pg');

const testRegion = async (region) => {
  const connectionString = 'postgres://postgres.sqokrrhcsxcszhvmytzt:jOFxEyCeifFnUj20@aws-0-' + region + '.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }});
  try {
    await client.connect();
    console.log('SUCCESS Region: ' + region);
    await client.end();
    return true;
  } catch (err) {
    console.log('Failed Region ' + region + ':', err.message);
    return false;
  }
};

const regions = ['ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'us-east-1', 'us-west-1', 'eu-central-1', 'ap-south-1'];
(async () => {
  for (const r of regions) {
    if (await testRegion(r)) break;
  }
})();
