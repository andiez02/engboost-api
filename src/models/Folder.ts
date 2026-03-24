import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface FolderAttributes {
  id: string;
  title: string;
  user_id: string;
  flashcard_count: number;
  is_public: boolean;
  created_at: Date;
  updated_at: Date | null;
}

interface FolderCreationAttributes extends Optional<FolderAttributes, 'id' | 'flashcard_count' | 'is_public' | 'created_at' | 'updated_at'> {}

class Folder extends Model<FolderAttributes, FolderCreationAttributes> implements FolderAttributes {
  declare id: string;
  declare title: string;
  declare user_id: string;
  declare flashcard_count: number;
  declare is_public: boolean;
  declare created_at: Date;
  declare updated_at: Date | null;
}

Folder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 30],
      },
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
    flashcard_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'folders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['title', 'user_id'],
        name: 'folders_title_user_id_unique',
      },
    ],
  }
);

export default Folder;
