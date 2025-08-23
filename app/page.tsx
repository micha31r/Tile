"use client";

import { FriendCard } from "@/components/app/friend-gallery";
import { Logo } from "@/components/logo";
import { Tile } from "@/components/tile/tile";
import { t, themeOptions } from "@/lib/theme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useHaptic } from "react-haptic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { faker } from '@faker-js/faker';

type Friend = {
  firstName: string;
  lastName: string;
  theme: string;
  data: {
    tl: boolean;
    tr: boolean;
    bl: boolean;
    br: boolean;
  };
};

function getRandomBool() {
  return Math.random() < 0.5;
}

function generateRandomFriends(count = 6) {
  const usedNames = new Set();
  const friends = [];

  while (friends.length < count) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Prevent duplicate names
    const nameKey = `${firstName}-${lastName}`;
    if (usedNames.has(nameKey)) {
      continue;
    }
    usedNames.add(nameKey);

    // Generate tile shape
    let tl = getRandomBool();
    let tr = getRandomBool();
    let bl = getRandomBool();
    let br = getRandomBool();

    if (!tl && !tr && !bl && !br) {
      // Randomly pick one to set true
      const keys = ["tl", "tr", "bl", "br"];
      const i = Math.floor(Math.random() * 4);
      if (keys[i] === "tl") tl = true;
      if (keys[i] === "tr") tr = true;
      if (keys[i] === "bl") bl = true;
      if (keys[i] === "br") br = true;
    }

    friends.push({
      firstName,
      lastName,
      theme: themeOptions[Math.floor(Math.random() * themeOptions.length)],
      data: { tl, tr, bl, br },
    });
  }
  return friends;
}

export default function Home() {
  const { vibrate } = useHaptic();
  const [friends, setFriends] = useState<Friend[]>([]);
  const segmentRef = useRef<HTMLDivElement | null>(null);
  const [segmentHeight, setSegmentHeight] = useState(1);
  
  useEffect(() => {
    setFriends(generateRandomFriends(6));
  }, []);

  useEffect(() => {
    if (!friends.length) {
      return;
    }

    const element = segmentRef.current;
    if (!element) {
      return;
    }
    
    const measure = () => setSegmentHeight(element.getBoundingClientRect().height || 1);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [friends]);

  if (!friends.length) {
    return null;
  }

  return (
    <div className="max-h-[calc(100svh-16*4px)] flex flex-1 flex-col gap-8 items-center justify-between sm:pt-0 pt-4">
      <Logo tileWidth={28} />

      <div className="flex flex-1 max-h-full w-full relative home-page-gradient overflow-hidden pointer-events-none select-none">
        <motion.div
          animate={{ y: [0, -segmentHeight] }}
          transition={{ ease: "linear", duration: 10, repeat: Infinity }}
          className="w-full will-change-transform"
        >
          <div ref={segmentRef} className="grid grid-cols-2 w-full gap-1 mb-1">
            {friends.map((friend: Friend, index: number) => (
              <FriendCard key={`${friend.firstName}-${index}`} email={""} firstName={friend.firstName}>
                <div className={cn(`rounded-lg p-1.5`, t("bg", friend.theme, "b"))}>
                  <Tile data={friend.data} backgroundClass={t("bg", friend.theme, "b")} foregroundClass={t("bg", friend.theme, "f")} maxWidth={64} radiusClass="rounded-md"/>
                </div>
              </FriendCard>
            ))}
          </div>
          <div aria-hidden className="grid grid-cols-2 w-full gap-1">
            {friends.map((friend: Friend, index: number) => (
              <FriendCard key={`dup-${friend.firstName}-${index}`} email={""} firstName={friend.firstName} lastName={friend.lastName}>
                <div className={cn(`rounded-lg p-1.5`, t("bg", friend.theme, "b"))}>
                  <Tile data={friend.data} backgroundClass={t("bg", friend.theme, "b")} foregroundClass={t("bg", friend.theme, "f")} maxWidth={64} radiusClass="rounded-md"/>
                </div>
              </FriendCard>
            ))}
          </div>
        </motion.div>
      </div>

      <p className="text-center leading-snug text-xl">
        Habit-building done differently. <br /> 4 goals, daily check-offs, and friends to keep you motivated.
      </p>

      <Link onClick={vibrate} href="/auth/login" className="text-center rounded-full bg-foreground text-background px-6 py-4 w-full text-md font-medium hover:scale-95 transition-transform">
        Continue with email
      </Link>
    </div>
  );
}
