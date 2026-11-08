import React, { useEffect, useRef, useState } from "react";
import { AppState, Linking, Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useReducedMotion } from "react-native-reanimated";
import { BannerListResponse } from "@arena/shared";
import { useData } from "./data";
import { Text } from "./ui";
import { usePrefs } from "../state/preferences";
import { bannersForDisplay } from "../api/banners";
import { colors as c } from "../theme/tokens";

export function BannerCarousel() {
  const q = useData("/me/banners", BannerListResponse);
  const { text, ar } = usePrefs();
  const reduced = useReducedMotion();
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [touching, setTouching] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const banners = bannersForDisplay(q.data || []);
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => listener.remove();
  }, []);
  useEffect(() => {
    setIndex(0);
    scroll.current?.scrollTo({
      x: ar ? Math.max(0, banners.length - 1) * width : 0,
      animated: false,
    });
  }, [width, banners.length, ar, q.error]);
  useEffect(() => {
    if (
      reduced ||
      touching ||
      !active ||
      banners.length < 2 ||
      !width ||
      q.error
    )
      return;
    const timer = setInterval(() => {
      const next = (index + 1) % banners.length;
      scroll.current?.scrollTo({
        x: (ar ? banners.length - 1 - next : next) * width,
        animated: true,
      });
      setIndex(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [reduced, touching, active, banners.length, width, index, q.error, ar]);
  if (q.error || (!q.isPending && !banners.length)) return null;
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: 10 }}
    >
      {q.isPending ? (
        <View
          accessibilityLabel={text(
            "Loading banners",
            "جار تحميل الإعلانات المصورة",
          )}
          style={{
            aspectRatio: 16 / 7,
            borderRadius: 24,
            backgroundColor: c.raised,
          }}
        />
      ) : (
        <>
          <ScrollView
            ref={scroll}
            horizontal
            pagingEnabled
            snapToInterval={width || undefined}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            // Reverse the physical pages for RTL while keeping positive native offsets.
            style={{ direction: "ltr", borderRadius: 24, overflow: "hidden" }}
            onTouchStart={() => setTouching(true)}
            onTouchEnd={() => setTouching(false)}
            onTouchCancel={() => setTouching(false)}
            onScrollBeginDrag={() => setTouching(true)}
            onScrollEndDrag={() => setTouching(false)}
            scrollEventThrottle={32}
            onScroll={(event) => {
              if (!width) return;
              const page = Math.max(
                0,
                Math.min(
                  banners.length - 1,
                  Math.round(event.nativeEvent.contentOffset.x / width),
                ),
              );
              setIndex(ar ? banners.length - 1 - page : page);
            }}
            onMomentumScrollEnd={() => setTouching(false)}
          >
            {(ar ? [...banners].reverse() : banners).map((banner) => {
              const link = banner.linkUrl;
              return (
                <View
                  key={banner.id}
                  style={{
                    width,
                    aspectRatio: 16 / 7,
                    borderRadius: 24,
                    overflow: "hidden",
                    backgroundColor: c.card,
                  }}
                >
                  <Image
                    source={{ uri: banner.imageUrl }}
                    contentFit="cover"
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                    accessibilityLabel={banner.title}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.9)"]}
                    style={{
                      position: "absolute",
                      inset: 0,
                      justifyContent: "flex-end",
                      padding: 12,
                      gap: 2,
                    }}
                  >
                    <Text
                      bold
                      size={16}
                      numberOfLines={1}
                      style={{ color: "white" }}
                    >
                      {banner.title}
                    </Text>
                    {!!banner.subtitle && (
                      <Text
                        size={12}
                        numberOfLines={1}
                        style={{ color: "white" }}
                      >
                        {banner.subtitle}
                      </Text>
                    )}
                    {!!link && (
                      <Pressable
                        accessibilityRole="link"
                        accessibilityLabel={text("Learn more", "اعرفي المزيد")}
                        onPress={() =>
                          void Linking.openURL(link).catch(() => {})
                        }
                        style={{
                          alignSelf: ar ? "flex-end" : "flex-start",
                          backgroundColor: c.accent,
                          borderRadius: 24,
                          paddingHorizontal: 14,
                          minHeight: 44,
                          justifyContent: "center",
                        }}
                      >
                        <Text bold size={12} style={{ color: c.ink }}>
                          {text("Learn more", "اعرفي المزيد")}
                        </Text>
                      </Pressable>
                    )}
                  </LinearGradient>
                </View>
              );
            })}
          </ScrollView>
          {banners.length > 1 && (
            <View
              style={{
                flexDirection: ar ? "row-reverse" : "row",
                direction: "ltr",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {banners.map((banner, i) => (
                <Pressable
                  key={banner.id}
                  accessibilityRole="button"
                  accessibilityLabel={text(
                    `Banner ${i + 1}`,
                    `الإعلان ${i + 1}`,
                  )}
                  accessibilityState={{ selected: index === i }}
                  onPress={() => {
                    setIndex(i);
                    scroll.current?.scrollTo({
                      x: (ar ? banners.length - 1 - i : i) * width,
                      animated: !reduced,
                    });
                  }}
                  hitSlop={8}
                  style={{ paddingVertical: 8 }}
                >
                  <View
                    style={{
                      width: index === i ? 22 : 7,
                      height: 6,
                      borderRadius: 4,
                      backgroundColor: index === i ? c.accent : c.line,
                    }}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
