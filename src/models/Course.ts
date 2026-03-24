import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface CourseAttributes {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  video_format: string;
  video_public_id: string;
  thumbnail_url: string;
  thumbnail_public_id: string;
  user_id: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'description' | 'video_duration' | 'video_format' | 'video_public_id' | 'thumbnail_url' | 'thumbnail_public_id' | 'is_public' | 'created_at' | 'updated_at'> {}

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare video_url: string;
  declare video_duration: number;
  declare video_format: string;
  declare video_public_id: string;
  declare thumbnail_url: string;
  declare thumbnail_public_id: string;
  declare user_id: string;
  declare is_public: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    video_duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    video_format: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    video_public_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    thumbnail_public_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
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
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Course;
