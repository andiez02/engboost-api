import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface LexicalEntryAttributes {
  id: string;
  headword: string;
  pos: string | null;
  senses: any; // JSONB
  phonetic: string | null;
  audio_url: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface LexicalEntryCreationAttributes extends Optional<LexicalEntryAttributes, 'id' | 'pos' | 'phonetic' | 'audio_url' | 'image_url' | 'created_at' | 'updated_at'> {}

class LexicalEntry extends Model<LexicalEntryAttributes, LexicalEntryCreationAttributes> implements LexicalEntryAttributes {
  declare id: string;
  declare headword: string;
  declare pos: string | null;
  declare senses: any;
  declare phonetic: string | null;
  declare audio_url: string | null;
  declare image_url: string | null;
  declare created_at: Date;
  declare updated_at: Date | null;
}

LexicalEntry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    headword: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    pos: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    senses: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    phonetic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audio_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'lexical_entries',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default LexicalEntry;
