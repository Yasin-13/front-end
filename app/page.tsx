"use client"

import { useState, useRef } from "react"

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<Array<{
    plate_number: string
    traffic_violation: string
  }> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      setIsProcessing(true)
      setResults(null)
      setError(null)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        setIsProcessing(false)
        if (data.results) {
          setResults(data.results)
          setError(null)
        } else if (data.error) {
          setError(data.error)
          setResults(null)
        }
      } catch (error) {
        setIsProcessing(false)
        setError('File upload failed')
        setResults(null)
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Traffic Violation Detection System</h1>
          <p className="text-muted-foreground">Upload a video to detect license plates and traffic violations</p>
        </div>

        <div className="flex flex-col items-center">
          <label htmlFor="file-upload" className="file-upload-label">
            <div className="flex flex-col items-center justify-center w-96 h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer text-center p-4">
              <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-4.553A1.5 1.5 0 0017.5 3.5l-9 9a1.5 1.5 0 01-.832.295l-4.553.455a1.5 1.5 0 001.684 1.684l.455-4.553a1.5 1.5 0 01.295-.832l9-9a1.5 1.5 0 01.832-.295L15 10z"></path>
              </svg>
              <p className="text-gray-400">Drag and drop your video file here or click to browse</p>
              <small className="text-gray-500 mt-2">Supported formats: MP4, AVI, MOV (Max size: 100MB)</small>
            </div>
            <input id="file-upload" type="file" accept="video/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          </label>
        </div>

        {isProcessing && (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
            Processing your video, please wait...
          </div>
        )}

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        {results && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <p className="text-lg font-semibold">Plate Number: {result.plate_number}</p>
                <p className="text-red-500">{result.traffic_violation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}