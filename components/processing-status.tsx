"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function ProcessingStatus() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-medium">Processing Video</h3>
            <p className="text-sm text-muted-foreground">
              This may take a few minutes depending on the video length and complexity
            </p>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span>Detecting objects</span>
              <span>Reading license plates</span>
              <span>Analyzing violations</span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden rounded-full">
              <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

