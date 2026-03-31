import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ChallengeAttributes {
  id: string;
  key: string;
  type: string;
  title: string;
  description: string;
  icon: string | null;
  target: number;
  reward_xp: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface ChallengeCreationAttributes extends Optional<ChallengeAttributes, 'id' | 'icon' | 'created_at' | 'updated_at'> {}

class Challenge extends Model<ChallengeAttributes, ChallengeCreationAttributes> implements ChallengeAttributes {
  declare id: string;
  declare key: string;
  declare type: string;
  declare title: string;
  declare description: string;
  declare icon: string | null;
  declare target: number;
  declare reward_xp: number;
  declare created_at: Date;
  declare updated_at: Date | null;
}

Challenge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reward_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'challenges',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Challenge;
