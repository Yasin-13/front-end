"use client"

import { useState } from "react"
import { Upload } from "@/components/upload"
import { Results } from "@/components/results"
import { ProcessingStatus } from "@/components/processing-status"

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<Array<{
    plate_number: string
    traffic_violation: string
  }> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (data: any) => {
    setIsProcessing(false)
    if (data.results) {
      setResults(data.results)
      setError(null)
    } else if (data.error) {
      setError(data.error)
      setResults(null)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Traffic Violation Detection System</h1>
          <p className="text-muted-foreground">Upload a video to detect license plates and traffic violations</p>
        </div>

        <Upload
          onUploadStart={() => {
            setIsProcessing(true)
            setResults(null)
            setError(null)
          }}
          onUploadComplete={handleUploadComplete}
        />

        {isProcessing && <ProcessingStatus />}

        {error && <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>}

        {results && <Results results={results} />}
      </div>
    </main>
  )
}

