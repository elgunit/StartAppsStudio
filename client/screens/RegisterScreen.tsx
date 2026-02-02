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

export default function RegisterScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Please try again."
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
        <ThemedText type="h1">Create Account</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Start building your MVP today
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          leftIcon="user"
          error={errors.name}
          testID="input-name"
        />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
          leftIcon="lock"
          error={errors.password}
          testID="input-password"
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
          leftIcon="lock"
          error={errors.confirmPassword}
          testID="input-confirm-password"
        />

        <Button
          onPress={handleRegister}
          loading={loading}
          style={styles.submitButton}
          testID="button-register"
        >
          Create Account
        </Button>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.footer}>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.footerLink}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Already have an account?{" "}
          </ThemedText>
          <ThemedText type="link">Sign In</ThemedText>
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
