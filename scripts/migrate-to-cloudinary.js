#!/usr/bin/env node
/**
 * migrate-to-cloudinary.js
 * Reads all products from Supabase, detects base64 data URL images,
 * uploads them to Cloudinary, and updates the DB with the new CDN URLs.
 * Run once: node scripts/migrate-to-cloudinary.js
 */

require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yuytnexcomuscsbmtugv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function isBase64DataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

function isCloudinaryUrl(str) {
  return typeof str === 'string' && str.includes('res.cloudinary.com');
}

async function uploadToCloudinary(base64, publicId) {
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'si-products',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }]
  });
  return result.secure_url;
}

async function migrate() {
  console.log('\n🚀 Starting Cloudinary migration...\n');

  // Only select images array (the actual DB column)
  const { data: products, error } = await supabase
    .from('products')
    .select('code, images');

  if (error) {
    console.error('❌ Failed to fetch products:', error.message);
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products\n`);
  let migratedCount = 0, skippedCount = 0, errorCount = 0;

  for (const product of products) {
    const code = product.code;
    const images = product.images;

    if (!images || images.length === 0) {
      console.log(`  ➖ [${code}] No images — skipping`);
      skippedCount++;
      continue;
    }

    // Check if already all Cloudinary
    if (images.every(url => isCloudinaryUrl(url) || !isBase64DataUrl(url))) {
      console.log(`  ⏭️  [${code}] All images already on Cloudinary or external URLs`);
      skippedCount++;
      continue;
    }

    // Upload each base64 image
    const newImages = [];
    let changed = false;

    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i];
      if (isBase64DataUrl(imgUrl)) {
        try {
          process.stdout.write(`  ⬆️  [${code}] Uploading image ${i+1}/${images.length}...`);
          const url = await uploadToCloudinary(imgUrl, `${code}_img${i+1}`);
          newImages.push(url);
          changed = true;
          console.log(` ✅`);
        } catch (err) {
          console.log(` ❌ ${err.message}`);
          newImages.push(imgUrl); // keep original on error
          errorCount++;
        }
      } else {
        newImages.push(imgUrl); // already a URL, keep as-is
        if (isCloudinaryUrl(imgUrl)) {
          console.log(`  ⏭️  [${code}] Image ${i+1} already on Cloudinary`);
        }
      }
    }

    // Update DB if anything changed
    if (changed) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', code);

      if (updateError) {
        console.error(`  ❌ [${code}] DB update failed: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`  💾 [${code}] DB updated with Cloudinary URLs`);
        migratedCount++;
      }
    }
  }

  // Migrate featured slides
  console.log('\n📸 Checking featured slides...\n');
  const { data: slides, error: slidesError } = await supabase
    .from('featured_slides')
    .select('id, image_url');

  if (slidesError) {
    console.log(`  ⚠️  Could not fetch slides: ${slidesError.message}`);
  } else if (slides) {
    for (const slide of slides) {
      if (slide.image_url && isBase64DataUrl(slide.image_url)) {
        try {
          process.stdout.write(`  ⬆️  [slide-${slide.id}] Uploading banner...`);
          const url = await uploadToCloudinary(slide.image_url, `slide_${slide.id}`);
          await supabase.from('featured_slides').update({ image_url: url }).eq('id', slide.id);
          console.log(` ✅`);
          migratedCount++;
        } catch (err) {
          console.log(` ❌ ${err.message}`);
          errorCount++;
        }
      } else if (slide.image_url && isCloudinaryUrl(slide.image_url)) {
        console.log(`  ⏭️  [slide-${slide.id}] Already on Cloudinary`);
      } else if (slide.image_url) {
        console.log(`  ⏭️  [slide-${slide.id}] External URL — skipping`);
      }
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Migrated:  ${migratedCount}`);
  console.log(`⏭️  Skipped:   ${skippedCount}`);
  console.log(`❌ Errors:    ${errorCount}`);
  console.log('─'.repeat(50));
  console.log('\n🎉 Migration complete!\n');
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
