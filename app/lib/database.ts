import { ref, set, get, child } from 'firebase/database';
import { database } from './firebase';
import { Section, SectionData, Tag, Settings, DashboardWidget } from '../types';

export const saveUserData = async (userId: string, data: {
  sections?: Section[];
  sectionData?: SectionData;
  tags?: Tag[];
  settings?: Settings;
  dashboardWidgets?: DashboardWidget[];
}) => {
  try {
    const serializedData = JSON.parse(JSON.stringify(data));
    console.log('Saving user data:', serializedData);
    await set(ref(database, `users/${userId}`), serializedData);
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    // エラーの詳細情報をログに出力
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
    }
    throw error;
  }
};

export const loadUserData = async (userId: string) => {
  if (!userId) {
    throw new Error('ユーザーIDが必要です');
  }

  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('データベースの読み込みエラー:', error);
    throw error;
  }
};

