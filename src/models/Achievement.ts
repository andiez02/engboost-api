import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface AchievementAttributes {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface AchievementCreationAttributes extends Optional<AchievementAttributes, 'id' | 'icon' | 'created_at' | 'updated_at'> {}

class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
  declare id: string;
  declare key: string;
  declare title: string;
  declare description: string;
  declare icon: string | null;
  declare created_at: Date;
  declare updated_at: Date | null;
}

Achievement.init(
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
    tableName: 'achievements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Achievement;
