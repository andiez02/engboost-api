import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface FlashcardAttributes {
  id: string;
  english: string;
  vietnamese: string;
  /** @deprecated Use pos and example fields instead */
  object: string | null;
  image_url: string | null;
  folder_id: string;
  user_id: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date | null;

  /** Part of speech (e.g., "noun", "verb", "adjective") */
  pos: string | null;
  /** Example sentence demonstrating usage */
  example: string | null;

  /** Spaced Repetition System (SRS) fields */ 
  repetition: number;
  interval: number;
  ease_factor: number;
  next_review_at: Date;
  last_reviewed_at: Date | null;
  /** Learning state fields */
  is_learning: boolean;
  learning_step: number;
}

interface FlashcardCreationAttributes extends Optional<FlashcardAttributes, 'id' | 'object' | 'image_url' | 'is_public' | 'created_at' | 'updated_at' | 'pos' | 'example' | 'repetition' | 'interval' | 'ease_factor' | 'next_review_at' | 'last_reviewed_at' | 'is_learning' | 'learning_step'> {}

class Flashcard extends Model<FlashcardAttributes, FlashcardCreationAttributes> implements FlashcardAttributes {
  declare id: string;
  declare english: string;
  declare vietnamese: string;
  /** @deprecated Use pos and example fields instead */
  declare object: string | null;
  declare image_url: string | null;
  declare folder_id: string;
  declare user_id: string;
  declare is_public: boolean;
  declare created_at: Date;
  declare updated_at: Date | null;
  declare pos: string | null;
  declare example: string | null;
  declare repetition: number;
  declare interval: number;
  declare ease_factor: number;
  declare next_review_at: Date;
  declare last_reviewed_at: Date | null;
  declare is_learning: boolean;
  declare learning_step: number;
}

Flashcard.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    english: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    vietnamese: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    object: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    pos: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    folder_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'folders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repetition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ease_factor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 2.5,
    },
    next_review_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    last_reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_learning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    learning_step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'flashcards',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['folder_id'] },
      { fields: ['user_id'] },
    ],
  }
);

export default Flashcard;
