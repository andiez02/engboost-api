import assert from 'assert';
import { normalizeFlashcardInput } from '../modules/flashcard/flashcard.utils';

function runTests() {
  console.log('Running Flashcard Normalization Tests...\n');

  // Test 1: Old data (no senses)
  console.log('Test 1: Old data (no senses)');
  const oldDataInput = {
    english: 'apple',
    vietnamese: 'quả táo',
    object: 'noun',
    example: 'An apple a day.'
  };
  const normalizedOld = normalizeFlashcardInput(oldDataInput);
  assert.strictEqual(normalizedOld.headword, 'apple');
  assert.strictEqual(normalizedOld.translation, 'quả táo');
  assert.strictEqual(normalizedOld.pos, 'noun');
  assert.strictEqual(normalizedOld.example, 'An apple a day.');
  assert.ok(normalizedOld.senses !== null);
  assert.strictEqual(normalizedOld.senses?.length, 1);
  assert.strictEqual(normalizedOld.senses[0].translation, 'quả táo');
  console.log('-> Passed');

  // Test 2: New data (with senses)
  console.log('Test 2: New data (with senses)');
  const newDataInput = {
    english: 'run',
    pos: 'verb',
    senses: [
      {
        definition: 'move fast',
        translation: 'chạy',
        examples: [{ sentence: 'I run fast.' }]
      }
    ]
  };
  const normalizedNew = normalizeFlashcardInput(newDataInput);
  assert.strictEqual(normalizedNew.translation, 'chạy');
  assert.strictEqual(normalizedNew.definition, 'move fast');
  assert.strictEqual(normalizedNew.example, 'I run fast.');
  assert.strictEqual(normalizedNew.senses?.[0].definition, 'move fast');
  console.log('-> Passed');

  // Test 3: Mixed invalid input (inconsistent hybrid)
  console.log('Test 3: Mixed invalid input (inconsistent hybrid)');
  const mixedInput = {
    english: 'run',
    definition: 'different value entirely', // Inconsistent!
    senses: [
      {
        definition: 'move fast',
        translation: 'chạy',
        examples: [{ sentence: 'I run fast.' }]
      }
    ]
  };
  assert.throws(() => {
    normalizeFlashcardInput(mixedInput);
  }, /Inconsistent data/, 'Should throw on inconsistent definition');
  console.log('-> Passed');

  // Test 4: Empty example
  console.log('Test 4: Empty example');
  const emptyExampleInput = {
    english: 'run',
    senses: [
      {
        definition: 'move fast',
        translation: 'chạy',
        examples: [] // No examples
      }
    ]
  };
  const normalizedEmptyEx = normalizeFlashcardInput(emptyExampleInput);
  assert.strictEqual(normalizedEmptyEx.example, null);
  assert.deepStrictEqual(normalizedEmptyEx.senses?.[0].examples, []);
  console.log('-> Passed');

  // Test 5: Multiple senses
  console.log('Test 5: Multiple senses');
  const multiSenseInput = {
    english: 'bank',
    senses: [
      {
        definition: 'financial institution',
        translation: 'ngân hàng',
        examples: [{ sentence: 'I deposited money in the bank.' }]
      },
      {
        definition: 'land alongside a body of water',
        translation: 'bờ sông',
        examples: [{ sentence: 'He sat on the river bank.' }]
      }
    ]
  };
  const normalizedMulti = normalizeFlashcardInput(multiSenseInput);
  // Top level derived from first sense
  assert.strictEqual(normalizedMulti.definition, 'financial institution');
  assert.strictEqual(normalizedMulti.translation, 'ngân hàng');
  assert.strictEqual(normalizedMulti.senses?.length, 2);
  console.log('-> Passed');

  // Test 6: Partial update attempt (Empty senses array)
  console.log('Test 6: Partial update attempt (Empty senses array)');
  const partialUpdateInput = {
    english: 'fail',
    senses: [] // Zod should reject this
  };
  assert.throws(() => {
    normalizeFlashcardInput(partialUpdateInput);
  }, /Invalid senses structure/, 'Should throw on empty senses array');
  console.log('-> Passed');

  console.log('\nAll tests passed successfully! 🎉');
}

runTests();
