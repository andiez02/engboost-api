import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';
import Achievement from './Achievement';

export interface UserAchievementAttributes {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: Date;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserAchievementCreationAttributes extends Optional<UserAchievementAttributes, 'id' | 'unlocked_at' | 'created_at' | 'updated_at'> {}

class UserAchievement extends Model<UserAchievementAttributes, UserAchievementCreationAttributes> implements UserAchievementAttributes {
  declare id: string;
  declare user_id: string;
  declare achievement_id: string;
  declare unlocked_at: Date;
  declare created_at: Date;
  declare updated_at: Date | null;
}

UserAchievement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    achievement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'achievements', key: 'id' },
    },
    unlocked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'user_achievements',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'achievement_id']
      }
    ],
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserAchievement;
