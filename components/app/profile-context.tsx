"use client";
import { Profile } from "@/lib/data/profile";
import { createContext } from "react";

export interface ProfileContextData {
  email: string;
  userId: string;
  profile: Profile;
}

export const ProfileContext = createContext<ProfileContextData>(null!);