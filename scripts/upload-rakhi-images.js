require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yuytnexcomuscsbmtugv.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const BUCKET_NAME = 'product-images';
const PICS_FOLDER = path.resolve('./public/pics');

async function run() {
  console.log('🚀 Starting rakhi image upload to Supabase Storage...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= 68; i++) {
    const filename = `rakhi_${i}.jpeg`;
    const localPath = path.join(PICS_FOLDER, filename);
    const remotePath = `rakhi/${filename}`;
    const code = 'RKH' + String(i).padStart(3, '0');

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  File not found, skipping: ${filename}`);
      failCount++;
      continue;
    }

    // Upload image to Supabase Storage
    const fileBuffer = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${filename}:`, uploadError.message);
      failCount++;
      continue;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(remotePath);
    const publicUrl = urlData.publicUrl;

    // Update the product's images column in DB
    const { error: dbError } = await supabase
      .from('products')
      .update({ images: [publicUrl] })
      .eq('code', code);

    if (dbError) {
      console.error(`❌ DB update failed for ${code}:`, dbError.message);
      failCount++;
      continue;
    }

    console.log(`✅ [${i}/68] ${code} → uploaded & mapped`);
    successCount++;
  }

  console.log('\n=============================');
  console.log(`✅ Success: ${successCount}/68`);
  if (failCount > 0) console.log(`❌ Failed:  ${failCount}`);
  console.log('=============================\n');

  if (successCount === 68) {
    console.log('🎉 All done! You can now safely delete public/pics/ folder.');
    console.log('   Images are now served from Supabase Storage CDN.');
  }
}

run();
