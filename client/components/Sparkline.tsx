import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export interface SparklineSeries {
  values: number[];
  color: string;
  fillColor?: string;
}

interface SparklineProps {
  series: SparklineSeries[];
  width?: number;
  height?: number;
  showDots?: boolean;
}

function buildPath(values: number[], maxVal: number, width: number, height: number): string {
  if (values.length < 2) return "";
  const step = width / (values.length - 1);
  const pad = 3;
  const drawHeight = height - pad * 2;

  return values
    .map((v, i) => {
      const x = i * step;
      const y = pad + (maxVal > 0 ? (1 - v / maxVal) * drawHeight : drawHeight);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], maxVal: number, width: number, height: number): string {
  if (values.length < 2) return "";
  const linePath = buildPath(values, maxVal, width, height);
  const lastX = ((values.length - 1) * width / (values.length - 1)).toFixed(1);
  return `${linePath} L${lastX},${height} L0,${height} Z`;
}

export function Sparkline({ series, width = 120, height = 36, showDots = false }: SparklineProps) {
  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 1);

  return (
    <Svg width={width} height={height}>
      <Defs>
        {series.map((s, i) =>
          s.fillColor ? (
            <LinearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={s.fillColor} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={s.fillColor} stopOpacity="0.02" />
            </LinearGradient>
          ) : null,
        )}
      </Defs>
      {series.map((s, i) => {
        if (s.values.length < 2) return null;
        const areaPath = s.fillColor ? buildAreaPath(s.values, maxVal, width, height) : "";
        const linePath = buildPath(s.values, maxVal, width, height);
        const step = width / (s.values.length - 1);
        const pad = 3;
        const drawHeight = height - pad * 2;

        return (
          <React.Fragment key={i}>
            {s.fillColor ? (
              <Path d={areaPath} fill={`url(#grad-${i})`} />
            ) : null}
            <Path
              d={linePath}
              stroke={s.color}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showDots
              ? s.values.map((v, j) => {
                  const x = j * step;
                  const y = pad + (maxVal > 0 ? (1 - v / maxVal) * drawHeight : drawHeight);
                  return (
                    <Circle key={j} cx={x} cy={y} r={2} fill={s.color} />
                  );
                })
              : null}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

interface LabeledSparklineProps {
  series: SparklineSeries[];
  labels: { color: string; label: string }[];
  width?: number;
  height?: number;
}

export function LabeledSparkline({ series, labels, width = 120, height = 36 }: LabeledSparklineProps) {
  return (
    <View style={styles.container}>
      <Sparkline series={series} width={width} height={height} />
      <View style={styles.legend}>
        {labels.map((l, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <ThemedText type="caption" style={{ color: l.color }}>{l.label}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  legend: {
    flexDirection: "row",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
