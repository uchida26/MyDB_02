'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { loadUserData, saveUserData } from '../lib/database';
import { Section, SectionData, Tag, TagGroup, Settings, DashboardWidget, MotivationalQuote } from '../types';

type DataContextType = {
  sections: Section[];
  sectionData: SectionData;
  tags: Tag[];
  tagGroups: TagGroup[];
  settings: Settings;
  dashboardWidgets: DashboardWidget[];
  currentSection: string;
  setSections: (sections: Section[]) => Promise<void>;
  setSectionData: (sectionData: SectionData) => Promise<void>;
  setTags: (tags: Tag[]) => Promise<void>;
  setTagGroups: (tagGroups: TagGroup[]) => Promise<void>;
  setSettings: (settings: Settings) => Promise<void>;
  setDashboardWidgets: (widgets: DashboardWidget[]) => Promise<void>;
  setCurrentSection: (sectionId: string) => void;
  loading: boolean;
};

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirstLogin, setIsFirstLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sections, setSectionsState] = useState<Section[]>([]);
  const [sectionData, setSectionDataState] = useState<SectionData>({});
  const [tags, setTagsState] = useState<Tag[]>([]);
  const [tagGroups, setTagGroupsState] = useState<TagGroup[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [settings, setSettingsState] = useState<Settings>({
    defaultSection: '',
    darkMode: false,
    motivationEmojis: [
      { level: 5, emoji: '🥳' },
      { level: 4, emoji: '🤩' },
      { level: 3, emoji: '😁' },
      { level: 2, emoji: '😊' },
      { level: 1, emoji: '🙂' },
      { level: 0, emoji: '😶' },
      { level: -1, emoji: '😐' },
      { level: -2, emoji: '😕' },
      { level: -3, emoji: '😦' },
      { level: -4, emoji: '😠' },
      { level: -5, emoji: '😡' }
    ],
    graphColor: 'hsl(var(--primary))',
    showMotivationalQuote: false,
    motivationalQuotes: [
      {
        id: 'default',
        text: `盛田昭夫（ソニー創始者）
人は誰でも種々様々な能力を持っているものなのに、自分がどんなに優れた能力があるかを知らずにいる場合が多いと思う。
どの世界でも、偉人というものはたいてい、自分で自分の能力を発見し、育てていった人であろう。`
      }
    ],
    motivationalQuoteSpeed: '1'
  });
  const [dashboardWidgets, setDashboardWidgetsState] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true);
          const userData = await loadUserData(user.uid);
          if (userData) {
            if (userData.sections) setSectionsState(userData.sections);
            if (userData.sectionData) setSectionDataState(userData.sectionData);
            if (userData.tags) setTagsState(userData.tags);
            if (userData.tagGroups) setTagGroupsState(userData.tagGroups);
            if (userData.settings) {
              const updatedSettings = {
                ...userData.settings,
                motivationalQuotes: userData.settings.motivationalQuotes || settings.motivationalQuotes
              };
              setSettingsState(updatedSettings);
            }
            if (userData.dashboardWidgets) setDashboardWidgetsState(userData.dashboardWidgets);
            // Load saved current section from localStorage or use default
            const savedSection = localStorage.getItem('currentSection');
            if (savedSection && userData.sections.some(s => s.id === savedSection)) {
              setCurrentSection(savedSection);
            } else if (userData.sections.length > 0) {
              setCurrentSection(userData.sections[0].id);
            }
          } else {
            // 新規ユーザーの場合、初期データは設定しない
            setIsFirstLogin(true);
          }
        } catch (error) {
          console.error('データの読み込みに失敗しました:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [user, setIsFirstLogin]);

  // Update localStorage when current section changes
  useEffect(() => {
    if (currentSection) {
      localStorage.setItem('currentSection', currentSection);
    }
  }, [currentSection]);

  const setSections = async (newSections: Section[]) => {
    if (user) {
      console.log('保存するセクションデータ:', newSections);
      setSectionsState(newSections);
      const newSettings = {
        ...settings,
        defaultSection: newSections[0]?.id || ''
      };
      setSettingsState(newSettings);
      await saveUserData(user.uid, {
        sections: newSections,
        sectionData,
        tags,
        tagGroups,
        settings: JSON.parse(JSON.stringify(newSettings)),
        dashboardWidgets
      });
    }
  };

  const setSectionData = async (newSectionData: SectionData) => {
    if (user) {
      console.log('保存するセクションデータ:', newSectionData);
      setSectionDataState(newSectionData);
      await saveUserData(user.uid, {
        sections,
        sectionData: newSectionData,
        tags,
        tagGroups,
        settings,
        dashboardWidgets
      });
    }
  };

  const setTags = async (newTags: Tag[]) => {
    if (user) {
      console.log('保存するタグデータ:', newTags);
      setTagsState(newTags);
      await saveUserData(user.uid, {
        sections,
        sectionData,
        tags: newTags,
        tagGroups,
        settings,
        dashboardWidgets
      });
    }
  };

  const setTagGroups = async (newTagGroups: TagGroup[]) => {
    if (user) {
      console.log('保存するタググループデータ:', newTagGroups);
      setTagGroupsState(newTagGroups);
      await saveUserData(user.uid, {
        sections,
        sectionData,
        tags,
        tagGroups: newTagGroups,
        settings,
        dashboardWidgets
      });
    }
  };

  const setSettings = async (newSettings: Settings) => {
    if (user) {
      console.log('保存する設定データ:', newSettings);
      // undefined値を除去
      const cleanSettings = Object.fromEntries(
        Object.entries(newSettings).filter(([_, v]) => v !== undefined)
      );
      setSettingsState(cleanSettings as Settings);
      await saveUserData(user.uid, {
        sections,
        sectionData,
        tags,
        tagGroups,
        settings: cleanSettings,
        dashboardWidgets
      });
    }
  };

  const setDashboardWidgets = async (newWidgets: DashboardWidget[]) => {
    if (user) {
      console.log('保存するウィジェットデータ:', newWidgets);
      setDashboardWidgetsState(newWidgets);
      await saveUserData(user.uid, {
        sections,
        sectionData,
        tags,
        tagGroups,
        settings,
        dashboardWidgets: newWidgets
      });
    }
  };

  const updateCurrentSection = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  return (
    <DataContext.Provider
      value={{
        sections,
        sectionData,
        tags,
        tagGroups,
        settings,
        dashboardWidgets,
        currentSection,
        setSections,
        setSectionData,
        setTags,
        setTagGroups,
        setSettings,
        setDashboardWidgets,
        setCurrentSection: updateCurrentSection,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

