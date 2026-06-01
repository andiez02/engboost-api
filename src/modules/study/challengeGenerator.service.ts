export interface UserStats {
  dueTodayCount: number;
  overdueCount: number;
  streak: number;
}

export interface DynamicChallenge {
  type: 'REVIEW_COUNT' | 'STREAK' | 'OVERDUE';
  title: string;
  description: string;
  target: number;
  rewardXp: number;
  priority: number;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function generateDailyChallenges(userStats: UserStats): DynamicChallenge[] {
  const { dueTodayCount, overdueCount, streak } = userStats;

  const challenges: DynamicChallenge[] = [
    {
      type: 'REVIEW_COUNT',
      title: 'Ôn tập hôm nay',
      description: 'Hoàn thành mục tiêu ôn tập hôm nay',
      target: clamp(dueTodayCount, 10, 30),
      rewardXp: 25,
      priority: 2,
    },
    {
      type: 'STREAK',
      title: 'Giữ chuỗi học tập',
      description: 'Duy trì chuỗi học tập của bạn',
      target: streak + 1,
      rewardXp: 30,
      priority: 1,
    },
  ];

  if (overdueCount > 0) {
    challenges.push({
      type: 'OVERDUE',
      title: 'Xử lý thẻ quá hạn',
      description: 'Hoàn thành các thẻ đã quá hạn',
      target: Math.min(overdueCount, 20),
      rewardXp: 40,
      priority: 3,
    });
  }

  return challenges.sort((a, b) => b.priority - a.priority);
}
