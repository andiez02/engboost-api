import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

export interface ReviewLogAttributes {
  id: string;
  user_id: string;
  card_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface ReviewLogCreationAttributes extends Optional<ReviewLogAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ReviewLog extends Model<ReviewLogAttributes, ReviewLogCreationAttributes> implements ReviewLogAttributes {
  declare id: string;
  declare user_id: string;
  declare card_id: string;
  declare rating: number;
  declare created_at: Date;
  declare updated_at: Date | null;
}

ReviewLog.init(
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
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'flashcards', key: 'id' },
    },
    rating: {
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
    tableName: 'review_logs',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ReviewLog;
