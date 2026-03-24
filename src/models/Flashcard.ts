import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface FlashcardAttributes {
  id: string;
  english: string;
  vietnamese: string;
  object: string | null;
  image_url: string | null;
  folder_id: string;
  user_id: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date | null;
}

interface FlashcardCreationAttributes extends Optional<FlashcardAttributes, 'id' | 'object' | 'image_url' | 'is_public' | 'created_at' | 'updated_at'> {}

class Flashcard extends Model<FlashcardAttributes, FlashcardCreationAttributes> implements FlashcardAttributes {
  declare id: string;
  declare english: string;
  declare vietnamese: string;
  declare object: string | null;
  declare image_url: string | null;
  declare folder_id: string;
  declare user_id: string;
  declare is_public: boolean;
  declare created_at: Date;
  declare updated_at: Date | null;
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
