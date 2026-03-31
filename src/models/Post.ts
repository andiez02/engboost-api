import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface PostAttributes {
  id: string;
  user_id: string;
  folder_id: string;
  content: string | null;
  like_count: number;
  save_count: number;
  created_at: Date;
  updated_at: Date | null;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'content' | 'like_count' | 'save_count' | 'created_at' | 'updated_at'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare id: string;
  declare user_id: string;
  declare folder_id: string;
  declare content: string | null;
  declare like_count: number;
  declare save_count: number;
  declare created_at: Date;
  declare updated_at: Date | null;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    folder_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'folders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    save_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['folder_id'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Post;
