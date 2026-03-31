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

async function verifyBackfill() {
  try {
    // Check for data loss
    const [lossCheck] = await sequelize.query(`
      SELECT COUNT(*) as lost_data_count
      FROM flashcards 
      WHERE object IS NOT NULL 
        AND pos IS NULL 
        AND example IS NULL;
    `);
    
    console.log('📊 Data Loss Check:');
    console.log(`  - Flashcards with object but no pos/example: ${(lossCheck as any)[0].lost_data_count}`);
    
    // Check classification distribution
    const [distribution] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(pos) as has_pos,
        COUNT(example) as has_example,
        COUNT(object) as has_object
      FROM flashcards;
    `);
    
    console.log('\n📈 Classification Distribution:');
    console.log(`  - Total flashcards: ${(distribution as any)[0].total}`);
    console.log(`  - Has pos: ${(distribution as any)[0].has_pos}`);
    console.log(`  - Has example: ${(distribution as any)[0].has_example}`);
    console.log(`  - Has object: ${(distribution as any)[0].has_object}`);
    
    // Sample classified data
    const [samples] = await sequelize.query(`
      SELECT id, object, pos, example
      FROM flashcards
      WHERE object IS NOT NULL
      LIMIT 10;
    `);
    
    console.log('\n📝 Sample Classified Data:');
    (samples as any[]).forEach((sample, index) => {
      console.log(`\n  ${index + 1}. Object: "${sample.object}"`);
      console.log(`     → POS: ${sample.pos || 'null'}`);
      console.log(`     → Example: ${sample.example || 'null'}`);
    });
    
    console.log('\n✓ Verification complete');
    
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

verifyBackfill();
