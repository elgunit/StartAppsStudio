import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";

import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import ClientTabNavigator from "@/navigation/ClientTabNavigator";
import DesignerTabNavigator from "@/navigation/DesignerTabNavigator";
import NewProjectScreen from "@/screens/NewProjectScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import WorkSessionScreen from "@/screens/WorkSessionScreen";
import CreditsScreen from "@/screens/CreditsScreen";
import RequestServiceScreen from "@/screens/RequestServiceScreen";
import JournalListScreen from "@/screens/JournalListScreen";
import JournalArticleScreen from "@/screens/JournalArticleScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import HelpScreen from "@/screens/HelpScreen";
import JournalSignupScreen from "@/screens/JournalSignupScreen";
import JournalStatsScreen from "@/screens/JournalStatsScreen";
import AiTrafficScreen from "@/screens/AiTrafficScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";

export type RootStackParamList = {
  Auth: undefined;
  ClientMain: undefined;
  DesignerMain: undefined;
  NewProject: undefined;
  ProjectDetail: { projectId: string };
  Chat: { projectId: string };
  WorkSession: { projectId?: string };
  Credits: undefined;
  RequestService: { serviceId: string };
  JournalList: undefined;
  JournalArticle: { slug: string };
  JournalSignup: { slug: string; title?: string };
  JournalStats: undefined;
  AiTraffic: undefined;
  Notifications: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Initialize designer account on app start
  useEffect(() => {
    const initDesigner = async () => {
      try {
        await apiRequest("POST", "/api/init-designer", {});
      } catch (error) {
        console.log("Designer init:", error);
      }
    };
    initDesigner();
  }, []);

  if (isLoading) {
    return null; // Or a splash screen
  }

  const isDesigner = user?.role === "designer";

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Auth"
            component={AuthStackNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="JournalList"
            component={JournalListScreen}
            options={{ headerTitle: "Journal" }}
          />
          <Stack.Screen
            name="JournalArticle"
            component={JournalArticleScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="JournalSignup"
            component={JournalSignupScreen}
            options={{
              presentation: "modal",
              headerTitle: "Get Started",
            }}
          />
        </>
      ) : isDesigner ? (
        <>
          <Stack.Screen
            name="DesignerMain"
            component={DesignerTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={{ headerTitle: "Project" }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerTitle: "Chat" }}
          />
          <Stack.Screen
            name="WorkSession"
            component={WorkSessionScreen}
            options={{ headerTitle: "Work Session" }}
          />
          <Stack.Screen
            name="JournalList"
            component={JournalListScreen}
            options={{ headerTitle: "Journal" }}
          />
          <Stack.Screen
            name="JournalArticle"
            component={JournalArticleScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="JournalStats"
            component={JournalStatsScreen}
            options={{ headerTitle: "Journal Stats" }}
          />
          <Stack.Screen
            name="AiTraffic"
            component={AiTrafficScreen}
            options={{ headerTitle: "AI Traffic" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="ClientMain"
            component={ClientTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewProject"
            component={NewProjectScreen}
            options={{
              presentation: "modal",
              headerTitle: "New Project",
            }}
          />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={{ headerTitle: "Project" }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerTitle: "Chat" }}
          />
          <Stack.Screen
            name="Credits"
            component={CreditsScreen}
            options={{ headerTitle: "Credits" }}
          />
          <Stack.Screen
            name="RequestService"
            component={RequestServiceScreen}
            options={{
              presentation: "modal",
              headerTitle: "Request Service",
            }}
          />
          <Stack.Screen
            name="JournalList"
            component={JournalListScreen}
            options={{ headerTitle: "Journal" }}
          />
          <Stack.Screen
            name="JournalArticle"
            component={JournalArticleScreen}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerTitle: "Notifications" }}
          />
          <Stack.Screen
            name="Help"
            component={HelpScreen}
            options={{ headerTitle: "Help & Support" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
