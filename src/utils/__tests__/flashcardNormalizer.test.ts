import { describe, it, expect } from 'vitest';
import { normalizeFlashcardInput, isSentence } from '../flashcardNormalizer';

describe('isSentence', () => {
  it('should detect sentences with space and punctuation', () => {
    expect(isSentence('This is a sentence.')).toBe(true);
    expect(isSentence('Is this a question?')).toBe(true);
    expect(isSentence('What an exclamation!')).toBe(true);
  });

  it('should detect long strings as sentences', () => {
    expect(isSentence('This is a very long string without punctuation')).toBe(true);
    expect(isSentence('abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('should not detect short words as sentences', () => {
    expect(isSentence('noun')).toBe(false);
    expect(isSentence('verb')).toBe(false);
    expect(isSentence('car')).toBe(false);
  });

  it('should handle edge case: exactly 20 characters', () => {
    expect(isSentence('12345678901234567890')).toBe(false); // exactly 20
    expect(isSentence('123456789012345678901')).toBe(true); // 21 characters
  });

  it('should handle strings with only punctuation', () => {
    expect(isSentence('...')).toBe(false);
    expect(isSentence('!!!')).toBe(false);
  });

  it('should handle empty strings', () => {
    expect(isSentence('')).toBe(false);
    expect(isSentence('   ')).toBe(false);
  });
});

describe('normalizeFlashcardInput', () => {
  describe('field name mapping', () => {
    it('should map english to headword', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
      });
      expect(result.headword).toBe('hello');
    });

    it('should map headword directly', () => {
      const result = normalizeFlashcardInput({
        headword: 'hello',
        translation: 'xin chào',
      });
      expect(result.headword).toBe('hello');
    });

    it('should map vietnamese to translation', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
      });
      expect(result.translation).toBe('xin chào');
    });

    it('should map translation directly', () => {
      const result = normalizeFlashcardInput({
        headword: 'hello',
        translation: 'xin chào',
      });
      expect(result.translation).toBe('xin chào');
    });

    it('should map image_url to imageUrl', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        image_url: 'https://example.com/image.jpg',
      });
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should map imageUrl directly', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        imageUrl: 'https://example.com/image.jpg',
      });
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('object field disambiguation', () => {
    it('should treat sentence-like object as example', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: 'Hello, how are you?',
      });
      expect(result.pos).toBeUndefined();
      expect(result.example).toBe('Hello, how are you?');
    });

    it('should treat short object as pos', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: 'noun',
      });
      expect(result.pos).toBe('noun');
      expect(result.example).toBeUndefined();
    });

    it('should prioritize explicit pos over object', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        pos: 'interjection',
        object: 'noun',
      });
      expect(result.pos).toBe('interjection');
    });

    it('should prioritize explicit example over object', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        example: 'Hello, world!',
        object: 'Hello, how are you?',
      });
      expect(result.example).toBe('Hello, world!');
    });
  });

  describe('trimming', () => {
    it('should trim headword', () => {
      const result = normalizeFlashcardInput({
        english: '  hello  ',
        vietnamese: 'xin chào',
      });
      expect(result.headword).toBe('hello');
    });

    it('should trim translation', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: '  xin chào  ',
      });
      expect(result.translation).toBe('xin chào');
    });

    it('should trim pos', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        pos: '  noun  ',
      });
      expect(result.pos).toBe('noun');
    });

    it('should trim example', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        example: '  Hello, world!  ',
      });
      expect(result.example).toBe('Hello, world!');
    });

    it('should trim imageUrl', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        imageUrl: '  https://example.com/image.jpg  ',
      });
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null object field', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: null,
      });
      expect(result.pos).toBeUndefined();
      expect(result.example).toBeUndefined();
    });

    it('should handle undefined object field', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: undefined,
      });
      expect(result.pos).toBeUndefined();
      expect(result.example).toBeUndefined();
    });

    it('should handle empty string object field', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: '',
      });
      expect(result.pos).toBeUndefined();
      expect(result.example).toBeUndefined();
    });

    it('should handle whitespace-only object field', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        object: '   ',
      });
      expect(result.pos).toBeUndefined();
      expect(result.example).toBeUndefined();
    });

    it('should set imageUrl to undefined when empty', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
        imageUrl: '',
      });
      expect(result.imageUrl).toBeUndefined();
    });

    it('should not have undefined values in required fields', () => {
      const result = normalizeFlashcardInput({
        english: 'hello',
        vietnamese: 'xin chào',
      });
      expect(result.headword).toBeDefined();
      expect(result.translation).toBeDefined();
    });
  });

  describe('type coercion', () => {
    it('should convert number to string', () => {
      const result = normalizeFlashcardInput({
        english: 123,
        vietnamese: 456,
      });
      expect(result.headword).toBe('123');
      expect(result.translation).toBe('456');
    });

    it('should convert boolean to string', () => {
      const result = normalizeFlashcardInput({
        english: true,
        vietnamese: false,
      });
      expect(result.headword).toBe('true');
      expect(result.translation).toBe('false');
    });
  });
});
