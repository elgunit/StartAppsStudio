import React, { useState } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing } from "@/constants/theme";

export default function LoginScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing["3xl"],
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.xl,
      }}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <ThemedText type="h1">Welcome Back</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to access your projects
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon="mail"
          error={errors.email}
          testID="input-email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          leftIcon="lock"
          error={errors.password}
          testID="input-password"
        />

        <Button
          onPress={handleLogin}
          loading={loading}
          style={styles.submitButton}
          testID="button-login"
        >
          Sign In
        </Button>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.footer}>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={styles.footerLink}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            New here?{" "}
          </ThemedText>
          <ThemedText type="link">Create Account</ThemedText>
        </Pressable>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: "center",
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
  },
});
