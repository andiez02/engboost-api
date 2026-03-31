import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

interface BackfillResult {
  pos: string | null;
  example: string | null;
}

/**
 * Analyzes the object field value and determines whether it's a sentence or POS tag.
 * 
 * Heuristic:
 * - If value contains space AND ends with punctuation (.!?) OR length > 20: treat as sentence
 * - Otherwise: treat as POS tag
 */
function analyzeObjectField(objectValue: string | null): BackfillResult {
  if (!objectValue || objectValue.trim() === '') {
    return { pos: null, example: null };
  }

  const trimmed = objectValue.trim();
  
  // Heuristic: Detect if value is a sentence
  const isSentence = (
    (trimmed.includes(' ') && /[.!?]$/.test(trimmed)) || // Has space AND ends with punctuation
    trimmed.length > 20 // Long strings are likely sentences
  );

  if (isSentence) {
    return { pos: null, example: trimmed };
  } else {
    return { pos: trimmed, example: null };
  }
}

async function backfillFlashcardFields(dryRun: boolean = false) {
  console.log(`🚀 Starting flashcard fields backfill${dryRun ? ' (DRY RUN)' : ''}...\n`);

  try {
    // Count total flashcards with object field
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM flashcards
      WHERE object IS NOT NULL
        AND pos IS NULL
        AND example IS NULL;
    `);
    
    const total = parseInt((countResult as any)[0].total);
    console.log(`📊 Found ${total} flashcards to process\n`);

    if (total === 0) {
      console.log('✓ No flashcards need backfilling');
      await sequelize.close();
      return;
    }

    const BATCH_SIZE = 1000;
    let processed = 0;
    let sentenceCount = 0;
    let posCount = 0;
    let nullCount = 0;
    let offset = 0;

    // Process in batches
    while (offset < total) {
      const transaction = await sequelize.transaction();
      
      try {
        // Fetch batch
        const [flashcards] = await sequelize.query(`
          SELECT id, object
          FROM flashcards
          WHERE object IS NOT NULL
            AND pos IS NULL
            AND example IS NULL
          LIMIT ${BATCH_SIZE}
          OFFSET ${offset};
        `, { transaction });

        if ((flashcards as any[]).length === 0) {
          await transaction.rollback();
          break;
        }

        // Process each flashcard in the batch
        for (const card of flashcards as any[]) {
          const result = analyzeObjectField(card.object);
          
          if (!dryRun) {
            // Update the flashcard
            await sequelize.query(`
              UPDATE flashcards
              SET pos = :pos, example = :example, updated_at = NOW()
              WHERE id = :id;
            `, {
              replacements: {
                id: card.id,
                pos: result.pos,
                example: result.example,
              },
              transaction,
            });
          }

          processed++;
          
          if (result.example) {
            sentenceCount++;
          } else if (result.pos) {
            posCount++;
          } else {
            nullCount++;
          }
        }

        // Commit transaction for this batch
        if (!dryRun) {
          await transaction.commit();
          console.log(`✓ Batch ${Math.floor(offset / BATCH_SIZE) + 1} committed: ${processed}/${total} flashcards processed`);
        } else {
          await transaction.rollback();
          console.log(`⏳ Batch ${Math.floor(offset / BATCH_SIZE) + 1} analyzed (dry run): ${processed}/${total} flashcards`);
        }

        offset += BATCH_SIZE;

      } catch (error) {
        await transaction.rollback();
        console.error(`✗ Error processing batch at offset ${offset}:`, error);
        throw error;
      }
    }

    console.log(`\n${dryRun ? '📋 Dry run' : '✓ Backfill'} complete!`);
    console.log(`\n📈 Summary:`);
    console.log(`  - Total processed: ${processed}`);
    console.log(`  - Classified as sentences (→ example): ${sentenceCount}`);
    console.log(`  - Classified as POS (→ pos): ${posCount}`);
    console.log(`  - Null values: ${nullCount}`);

    if (!dryRun) {
      // Verification query
      const [verifyResult] = await sequelize.query(`
        SELECT COUNT(*) as remaining
        FROM flashcards
        WHERE object IS NOT NULL
          AND pos IS NULL
          AND example IS NULL;
      `);
      
      const remaining = parseInt((verifyResult as any)[0].remaining);
      
      if (remaining === 0) {
        console.log(`\n✓ Verification passed: All flashcards backfilled successfully`);
      } else {
        console.log(`\n⚠️  Warning: ${remaining} flashcards still need backfilling`);
      }
    }

  } catch (error) {
    console.error('✗ Error during backfill:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the backfill
backfillFlashcardFields(dryRun);
