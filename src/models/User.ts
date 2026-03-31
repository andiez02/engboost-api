import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  username: string;
  avatar: string | null;
  role: 'CLIENT' | 'ADMIN';
  is_active: boolean;
  verify_token: string | null;
  streak: number;
  last_study_date: Date | null;
  daily_goal: number;
  total_reviewed: number;
  xp: number;
  level: number;
  created_at: Date;
  updated_at: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'username' | 'avatar' | 'role' | 'is_active' | 'verify_token' | 'streak' | 'last_study_date' | 'daily_goal' | 'total_reviewed' | 'xp' | 'level' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare username: string;
  declare avatar: string | null;
  declare role: 'CLIENT' | 'ADMIN';
  declare is_active: boolean;
  declare verify_token: string | null;
  declare streak: number;
  declare last_study_date: Date | null;
  declare daily_goal: number;
  declare total_reviewed: number;
  declare xp: number;
  declare level: number;
  declare created_at: Date;
  declare updated_at: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'CLIENT',
      validate: {
        isIn: [['CLIENT', 'ADMIN']],
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verify_token: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_study_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    daily_goal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    total_reviewed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;
