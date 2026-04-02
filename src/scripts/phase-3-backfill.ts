import { Op } from 'sequelize';
import sequelize from '../config/sequelize';
import { Flashcard } from '../models';
import { lexicalRepository } from '../modules/lexical/lexical.repository';

async function runBackfill() {
  console.log('Connecting to database...');
  await sequelize.authenticate();
  console.log('Database connected.');

  // Find all flashcards that have not been migrated to LexicalEntry yet
  const flashcards = await Flashcard.findAll({
    where: {
      lexical_entry_id: null,
    },
    order: [['created_at', 'ASC']], // Process oldest cards first to establish base lexical entries
  });

  console.log(`Found ${flashcards.length} flashcards needing Phase 3 dictionary mapping. Starting batch...`);

  let updatedCount = 0;

  for (const card of flashcards) {
    try {
      // Use the safe upsert to find or create the dictionary entry
      const lexicalEntryId = await lexicalRepository.upsertLexicalEntry({
        headword: card.english, // english is the headword
        pos: card.pos,
        senses: card.senses,
        imageUrl: card.image_url,
      });

      // Map back to flashcard
      await card.update({ lexical_entry_id: lexicalEntryId });
      updatedCount++;

      if (updatedCount % 50 === 0) {
        console.log(`Processed ${updatedCount} flashcards...`);
      }
    } catch (e) {
      console.error(`Failed to map flashcard ${card.id}:`, e);
    }
  }

  console.log(`Phase 3 Migration complete! Successfully mapped ${updatedCount} flashcards to Lexical Entries.`);
  process.exit(0);
}

runBackfill().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
