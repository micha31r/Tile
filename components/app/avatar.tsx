"use client"

import Avvvatars from "avvvatars-react"

export default function Avatar({ size, email, style = "character" }: { size?: number, email: string, style?: 'character' | 'shape' }) {
  return (
    <Avvvatars size={size} style={style} value={email} />
  )
}