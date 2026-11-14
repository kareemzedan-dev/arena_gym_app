import React, { useState } from "react";
import { Pressable, View } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Rect,
} from "react-native-svg";
import { usePrefs } from "../state/preferences";
import { useTheme } from "../theme/use-theme";
import { chartScale, chartX } from "../screens/chart-scale";
import { Text } from "./ui";

export function MeasurementChart({
  points,
  unit,
}: {
  points: { date: string; value: number }[];
  unit: string;
}) {
  const c = useTheme();
  const { ar, text } = usePrefs();
  const [selected, setSelected] = useState(points.length - 1);
  const [width, setWidth] = useState(300);
  const scale = chartScale(points.map((p) => p.value));
  const left = ar ? 18 : 50,
    right = ar ? 250 : 282,
    top = 38,
    bottom = 186;
  const coords = points.map((p, i) => ({
    x: chartX(i, points.length, ar, left, right),
    y: bottom - scale.fraction(p.value) * (bottom - top),
  }));
  const index = Math.max(0, Math.min(selected, points.length - 1));
  const chosen = points[index];
  const shortDate = (date: string) =>
    new Intl.DateTimeFormat(ar ? "ar-OM" : "en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const path = coords.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  if (!chosen) return null;
  const tooltipX = Math.max(left + 50, Math.min(right - 50, coords[index].x));
  const tooltipY = Math.max(2, coords[index].y - 36);
  return (
    <View testID="measurement-chart" style={{ gap: 4 }}>
      <Text muted size={10}>
        {text("Tap a point to see its value", "اضغط على نقطة لعرض قيمتها")}
      </Text>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ height: 230 }}
      >
        <Svg
          viewBox="0 0 300 230"
          width="100%"
          height={230}
          preserveAspectRatio="none"
          accessibilityLabel={text(
            "Measurement history trend",
            "تطور القياسات",
          )}
        >
          <SvgText
            x={ar ? 264 : 36}
            y={16}
            fill={c.muted}
            fontSize={11}
            textAnchor={ar ? "start" : "end"}
          >
            {unit}
          </SvgText>
          {scale.ticks.map((tick) => {
            const y = bottom - scale.fraction(tick) * (bottom - top);
            return (
              <React.Fragment key={tick}>
                <Line
                  x1={left}
                  x2={right}
                  y1={y}
                  y2={y}
                  stroke={c.line}
                  strokeDasharray="3 4"
                />
                <SvgText
                  x={ar ? right + 8 : left - 8}
                  y={y + 4}
                  fill={c.muted}
                  fontSize={10}
                  textAnchor={ar ? "start" : "end"}
                >
                  {tick}
                </SvgText>
              </React.Fragment>
            );
          })}
          <Line
            x1={ar ? right : left}
            x2={ar ? right : left}
            y1={top}
            y2={bottom}
            stroke={c.line}
          />
          <Line x1={left} x2={right} y1={bottom} y2={bottom} stroke={c.line} />
          {coords.length > 1 && (
            <Path
              d={`${path} L${coords.at(-1)!.x},${bottom} L${coords[0].x},${bottom} Z`}
              fill={c.primary}
              fillOpacity={0.15}
            />
          )}
          <Path
            d={path}
            stroke={c.accent}
            strokeWidth={2.5}
            fill={c.transparent}
          />
          {coords.map((p, i) => (
            <React.Fragment key={i}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={i === points.length - 1 ? 6 : 4}
                fill={i === points.length - 1 ? c.accent : c.card}
                stroke={c.accent}
                strokeWidth={2}
              />
              {(i === 0 ||
                i === points.length - 1 ||
                (points.length > 4 &&
                  i === Math.floor((points.length - 1) / 2))) && (
                <SvgText
                  x={p.x}
                  y={210}
                  fill={c.muted}
                  fontSize={10}
                  textAnchor={
                    p.x === left ? "start" : p.x === right ? "end" : "middle"
                  }
                >
                  {shortDate(points[i].date)}
                </SvgText>
              )}
            </React.Fragment>
          ))}
          <Rect
            x={tooltipX - 50}
            y={tooltipY}
            width={100}
            height={26}
            rx={8}
            fill={c.card}
            stroke={c.line}
          />
          <SvgText
            x={tooltipX}
            y={tooltipY + 17}
            textAnchor="middle"
            fill={c.text}
            fontSize={12}
          >
            {chosen.value} {unit}
          </SvgText>
        </Svg>
        {coords.map((p, i) => (
          <Pressable
            key={i}
            testID={`chart-point-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`${shortDate(points[i].date)}: ${points[i].value} ${unit}`}
            accessibilityState={{ selected: index === i }}
            onPress={() => setSelected(i)}
            style={{
              position: "absolute",
              left: (p.x / 300) * width - 22,
              top: p.y - 22,
              width: 44,
              height: 44,
              borderRadius: 22,
            }}
          />
        ))}
      </View>
      <Text
        size={11}
        muted
        accessibilityLiveRegion="polite"
        testID="chart-value"
      >
        {shortDate(chosen.date)} · {chosen.value} {unit}
      </Text>
    </View>
  );
}
