import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { NavigationContainer, useNavigationContainerRef, LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth";
import ScrollToTopOnNavigate from "@/components/ScrollToTopOnNavigate";

SplashScreen.preventAutoHideAsync();

const GA_MEASUREMENT_ID = "G-FQCKTE2CF8";

export default function App() {
  const navRef = useNavigationContainerRef();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const existingScript = document.querySelector(`script[src*="googletagmanager"]`);
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        const inlineScript = document.createElement("script");
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `;
        document.head.appendChild(inlineScript);
      }
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const linking: LinkingOptions<any> = {
    prefixes: [
      Linking.createURL("/"),
      "https://startappsstudio.com",
      "https://www.startappsstudio.com",
    ],
    config: {
      screens: {
        JournalList: "journal",
        JournalArticle: "journal/:slug",
        ClientMain: {
          screens: {
            Dashboard: "",
            Grow: "grow",
            Messages: "messages",
            Account: "account",
          },
        },
      },
    },
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer ref={navRef} linking={linking}>
                  <ScrollToTopOnNavigate navRef={navRef} />
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="auto" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
