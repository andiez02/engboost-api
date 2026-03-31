import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface PostSaveAttributes {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

interface PostSaveCreationAttributes extends Optional<PostSaveAttributes, 'id' | 'created_at'> {}

class PostSave extends Model<PostSaveAttributes, PostSaveCreationAttributes> implements PostSaveAttributes {
  declare id: string;
  declare user_id: string;
  declare post_id: string;
  declare created_at: Date;
}

PostSave.init(
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
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'post_saves',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
      },
    ],
  }
);

export default PostSave;
