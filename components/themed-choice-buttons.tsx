"use client"

import { useTheme } from "@/contexts/theme-context"
import { ChoiceButtons } from "@/components/choice-buttons"
import { MinimalistChoiceButtons } from "@/components/choice-buttons/minimalist-choice-buttons"
import { EnterpriseChoiceButtons } from "@/components/choice-buttons/enterprise-choice-buttons"
import { VoyagerChoiceButtons } from "@/components/choice-buttons/voyager-choice-buttons"
import { DefiantChoiceButtons } from "@/components/choice-buttons/defiant-choice-buttons"
import type { Choice } from "@/lib/types"

interface ThemedChoiceButtonsProps {
  choices: Choice[]
  onChoiceSelected: (choice: Choice) => void
  disabled?: boolean
}

export function ThemedChoiceButtons({ choices, onChoiceSelected, disabled }: ThemedChoiceButtonsProps) {
  const { theme } = useTheme()

  switch (theme) {
    case "minimalist":
      return <MinimalistChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
    case "enterprise":
      return <EnterpriseChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
    case "voyager":
      return <VoyagerChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
    case "defiant":
      return <DefiantChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
    case "lcars":
    default:
      return <ChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
  }
}
