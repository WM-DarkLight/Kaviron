"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"
import type { Campaign } from "@/lib/types"

interface CampaignCompletionProps {
  campaign: Campaign
  onReturnToMenu: () => void
}

export function CampaignCompletion({ campaign, onReturnToMenu }: CampaignCompletionProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[500px] bg-black border-[#66cc66]">
          {/* LCARS decorative header */}
          <div className="flex w-full">
            <div className="h-3 w-24 bg-[#66cc66] rounded-tl-lg"></div>
            <div className="h-3 w-12 bg-[#ff9900]"></div>
            <div className="h-3 flex-grow bg-[#99ccff]"></div>
            <div className="h-3 w-12 bg-[#ff9900]"></div>
            <div className="h-3 w-24 bg-[#66cc66] rounded-tr-lg"></div>
          </div>

          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <CheckCircle className="h-20 w-20 text-[#66cc66] mx-auto" />
            </motion.div>
            <CardTitle className="text-2xl text-[#66cc66] lcars-title">CAMPAIGN COMPLETE</CardTitle>
            <CardDescription className="text-[#99ccff] lcars-text">
              You have successfully completed the {campaign.title} campaign.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-gray-300 mb-4 lcars-text">
              Congratulations, Captain! You have navigated through all episodes of this campaign and reached the
              conclusion.
            </p>

            {/* LCARS decorative bar */}
            <div className="flex w-full my-2">
              <div className="h-2 w-16 bg-[#66cc66] rounded-l-full"></div>
              <div className="h-2 flex-grow bg-[#99ccff]"></div>
              <div className="h-2 w-16 bg-[#66cc66] rounded-r-full"></div>
            </div>

            <div className="p-4 bg-black border border-[#66cc66] rounded-md">
              <h3 className="text-[#66cc66] font-bold mb-2 lcars-title">CAMPAIGN SUMMARY</h3>
              <p className="text-gray-300 lcars-text">{campaign.description}</p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button className="bg-[#66cc66] text-black hover:bg-[#88ff88] lcars-button" onClick={onReturnToMenu}>
              <Home className="mr-2 h-4 w-4" />
              RETURN TO MAIN MENU
            </Button>
          </CardFooter>

          {/* LCARS decorative footer */}
          <div className="flex w-full">
            <div className="h-3 w-24 bg-[#66cc66] rounded-bl-lg"></div>
            <div className="h-3 w-12 bg-[#ff9900]"></div>
            <div className="h-3 flex-grow bg-[#99ccff]"></div>
            <div className="h-3 w-12 bg-[#ff9900]"></div>
            <div className="h-3 w-24 bg-[#66cc66] rounded-br-lg"></div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
