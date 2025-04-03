"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadIcon, Video, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UploadProps {
  onUploadStart: () => void
  onUploadComplete: (data: any) => void
}

export function Upload({ onUploadStart, onUploadComplete }: UploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    onUploadStart()

    const formData = new FormData()
    formData.append("video", selectedFile)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 500)

      const response = await fetch("http://localhost:5000/process_video", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Failed to process video")
      }

      const data = await response.json()
      onUploadComplete(data)
    } catch (error) {
      console.error("Error uploading video:", error)
      onUploadComplete({ error: "Failed to process video. Please try again." })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setSelectedFile(null)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            selectedFile ? "border-primary" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Drag and drop your video file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supported formats: MP4, AVI, MOV (Max size: 100MB)</p>
              </div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className="mr-2 h-4 w-4" />
                Select Video
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClearFile} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Processing video... {uploadProgress}%</p>
                </div>
              ) : (
                <Button onClick={handleUpload} className="w-full">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Process Video
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

