import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flashcardService } from '../flashcard.service';
import { Flashcard, Folder, User } from '../../../models';
import sequelize from '../../../config/sequelize';

describe('FlashcardService', () => {
  let testUser: User;
  let testFolder: Folder;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'test_password_123',
    });

    // Create test folder
    testFolder = await Folder.create({
      title: 'Test Folder',
      user_id: testUser.id,
      is_public: false,
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testUser?.id) {
      await Flashcard.destroy({ where: { user_id: testUser.id } });
      await Folder.destroy({ where: { user_id: testUser.id } });
      await User.destroy({ where: { id: testUser.id } });
    }
  });

  describe('saveToFolder', () => {
    it('should save flashcards with normalized input', async () => {
      const flashcards = [
        {
          english: 'hello',
          vietnamese: 'xin chào',
          object: 'interjection',
        },
        {
          english: 'goodbye',
          vietnamese: 'tạm biệt',
          object: 'Hello, how are you?',
        },
      ];

      const result = await flashcardService.saveToFolder(
        false,
        testFolder.id,
        undefined,
        testUser.id,
        flashcards
      );

      expect(result.inserted_count).toBe(2);
      expect(result.folder.id).toBe(testFolder.id);

      // Verify flashcards were created with correct fields
      const created = await Flashcard.findAll({
        where: { folder_id: testFolder.id },
        order: [['created_at', 'ASC']],
      });

      expect(created).toHaveLength(2);

      // First flashcard: short object → pos
      expect(created[0].english).toBe('hello');
      expect(created[0].vietnamese).toBe('xin chào');
      expect(created[0].pos).toBe('interjection');
      expect(created[0].example).toBeNull();
      expect(created[0].object).toBeNull(); // object field not written for new flashcards

      // Second flashcard: sentence object → example
      expect(created[1].english).toBe('goodbye');
      expect(created[1].vietnamese).toBe('tạm biệt');
      expect(created[1].pos).toBeNull();
      expect(created[1].example).toBe('Hello, how are you?');
      expect(created[1].object).toBeNull(); // object field not written for new flashcards
    });

    it('should not write to object field for new flashcards', async () => {
      const flashcards = [
        {
          english: 'test',
          vietnamese: 'thử nghiệm',
          object: 'noun',
        },
      ];

      await flashcardService.saveToFolder(
        false,
        testFolder.id,
        undefined,
        testUser.id,
        flashcards
      );

      const created = await Flashcard.findOne({
        where: { folder_id: testFolder.id },
      });

      expect(created).toBeDefined();
      expect(created!.object).toBeNull();
      expect(created!.pos).toBe('noun');
    });

    it('should handle missing required fields', async () => {
      const flashcards = [
        {
          english: '',
          vietnamese: 'test',
        },
      ];

      // This should still create the flashcard but with empty headword
      const result = await flashcardService.saveToFolder(
        false,
        testFolder.id,
        undefined,
        testUser.id,
        flashcards
      );

      expect(result.inserted_count).toBe(1);
    });

    it('should update folder flashcard count', async () => {
      const flashcards = [
        { english: 'word1', vietnamese: 'từ 1' },
        { english: 'word2', vietnamese: 'từ 2' },
        { english: 'word3', vietnamese: 'từ 3' },
      ];

      await flashcardService.saveToFolder(
        false,
        testFolder.id,
        undefined,
        testUser.id,
        flashcards
      );

      const updatedFolder = await Folder.findByPk(testFolder.id);
      expect(updatedFolder!.flashcard_count).toBe(3);
    });

    it('should create new folder when createNewFolder is true', async () => {
      const flashcards = [
        { english: 'test', vietnamese: 'thử nghiệm' },
      ];

      const result = await flashcardService.saveToFolder(
        true,
        undefined,
        'New Test Folder',
        testUser.id,
        flashcards
      );

      expect(result.folder.title).toBe('New Test Folder');
      expect(result.inserted_count).toBe(1);

      // Verify folder was created
      const folder = await Folder.findByPk(result.folder.id);
      expect(folder).toBeDefined();
      expect(folder!.user_id).toBe(testUser.id);
    });

    it('should handle explicit pos and example fields', async () => {
      const flashcards = [
        {
          english: 'run',
          vietnamese: 'chạy',
          pos: 'verb',
          example: 'I run every morning.',
        } as any,
      ];

      await flashcardService.saveToFolder(
        false,
        testFolder.id,
        undefined,
        testUser.id,
        flashcards
      );

      const created = await Flashcard.findOne({
        where: { folder_id: testFolder.id },
      });

      expect(created!.pos).toBe('verb');
      expect(created!.example).toBe('I run every morning.');
    });
  });
});
