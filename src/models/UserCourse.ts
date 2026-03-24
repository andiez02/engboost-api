import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserCourseAttributes {
  id: string;
  user_id: string;
  course_id: string;
  registered_at: Date;
}

interface UserCourseCreationAttributes extends Optional<UserCourseAttributes, 'id' | 'registered_at'> {}

class UserCourse extends Model<UserCourseAttributes, UserCourseCreationAttributes> implements UserCourseAttributes {
  declare id: string;
  declare user_id: string;
  declare course_id: string;
  declare registered_at: Date;
}

UserCourse.init(
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    registered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_courses',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id'],
        name: 'user_courses_user_id_course_id_unique',
      },
    ],
  }
);

export default UserCourse;
