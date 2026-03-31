import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface UserChallengeAttributes {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserChallengeCreationAttributes extends Optional<UserChallengeAttributes, 'id' | 'progress' | 'completed' | 'completed_at' | 'created_at' | 'updated_at'> {}

class UserChallenge extends Model<UserChallengeAttributes, UserChallengeCreationAttributes> implements UserChallengeAttributes {
  declare id: string;
  declare user_id: string;
  declare challenge_id: string;
  declare progress: number;
  declare completed: boolean;
  declare completed_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date | null;
}

UserChallenge.init(
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
    challenge_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'challenges', key: 'id' },
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
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
    tableName: 'user_challenges',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'challenge_id'] },
    ],
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserChallenge;
