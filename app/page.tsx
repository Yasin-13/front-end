"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  AlertCircle,
  BarChart3,
  Camera,
  ChevronDown,
  Clock,
  Download,
  FileVideo,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Play,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Upload,
} from "lucide-react"

export default function TrafficViolationDashboard() {
  // State management
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<"uploading" | "analyzing" | "complete">("uploading")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"upload" | "results" | "analytics">("upload")
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("today")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [isRealtimeActive, setIsRealtimeActive] = useState(false)
  const [realtimeResults, setRealtimeResults] = useState<Array<{
    plate_number: string
    traffic_violation: string
  }> | null>(null)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

  // Violation results
  const [violationResults, setViolationResults] = useState<Array<{
    id: string
    timestamp: string
    location: string
    plate_number: string
    vehicle_type: string
    violations: string[]
    confidence: number
    screenshot: string
  }> | null>(null)

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalViolations: 0,
    noHelmetCount: 0,
    speedingCount: 0,
    redLightCount: 0,
    licensePlateIssues: 0,
    processingTime: 0,
  })

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB limit

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [videoPreview])

  // File handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the 100MB limit. Please upload a smaller file or compress your video.`)
        return
      }
      setSelectedFile(file)
      setViolationResults(null)
      setError(null)

      // Create a preview URL for the video
      const videoURL = URL.createObjectURL(file)
      setVideoPreview(videoURL)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (!file.type.startsWith("video/")) {
        setError("Please upload a video file")
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the 100MB limit. Please upload a smaller file or compress your video.`)
        return
      }
      setSelectedFile(file)
      setViolationResults(null)
      setError(null)

      // Create a preview URL for the video
      const videoURL = URL.createObjectURL(file)
      setVideoPreview(videoURL)
    }
  }

  // Process video function
  const processVideo = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingStage("uploading")
    setUploadProgress(0)
    setViolationResults(null)
    setError(null)

    try {
      // Simulate upload progress
      const uploadTimer = simulateUploadProgress()

      // After "upload" completes, start "analysis"
      setTimeout(() => {
        clearInterval(uploadTimer)
        setUploadProgress(100)
        setProcessingStage("analyzing")

        // Simulate analysis phase
        setTimeout(() => {
          // Generate mock results
          const mockResults = generateMockResults()
          const mockAnalytics = generateMockAnalytics(mockResults)

          setViolationResults(mockResults)
          setAnalytics(mockAnalytics)
          setIsProcessing(false)
          setProcessingStage("complete")
          setActiveView("results")
        }, 4500)
      }, 7000)
    } catch (error) {
      setIsProcessing(false)
      setError("Processing failed. Please check your connection and try again.")
    }
  }

  // Real-time detection function
  const startRealtimeDetection = async () => {
    setIsProcessing(true)
    setError(null)
    setIsRealtimeActive(true)
    setRealtimeResults(null)
    setActiveView("upload")

    try {
      // Request access to the webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setWebcamStream(stream)

      // In a real implementation, you would connect to your Flask backend's /realtime endpoint
      // For this demo, we'll simulate results after a delay
      setTimeout(() => {
        // Simulate real-time detection results
        const mockRealtimeResults = [
          {
            plate_number: "RT" + Math.floor(Math.random() * 10000),
            traffic_violation: "No helmet, Speeding",
          },
          {
            plate_number: "RT" + Math.floor(Math.random() * 10000),
            traffic_violation: "Lane violation",
          },
        ]

        setRealtimeResults(mockRealtimeResults)

        // In a real implementation, you would continuously receive updates from the backend
        // Here we're just setting the processing state to false after getting initial results
        setIsProcessing(false)
      }, 3000)
    } catch (error) {
      console.error("Error accessing webcam:", error)
      setIsProcessing(false)
      setIsRealtimeActive(false)
      setError("Failed to access webcam. Please ensure you have granted camera permissions.")
    }
  }

  // Function to stop real-time detection
  const stopRealtimeDetection = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop())
      setWebcamStream(null)
    }
    setIsRealtimeActive(false)
    setRealtimeResults(null)
  }

  // Helper functions for simulation
  const simulateUploadProgress = () => {
    return setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) return 95
        return prev + (Math.random() * 3 + 1)
      })
    }, 500)
  }

  const generateMockResults = () => {
    return [
      {
        id: "VIO-" + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        location: "",
        plate_number: "AB0658",
        vehicle_type: "Motorcycle",
        violations: ["No helmet", "Speeding"],
        confidence: 0.94,
        screenshot: "/placeholder.svg?height=200&width=320",
      },
      {
        id: "VIO-" + Math.floor(Math.random() * 10000),
        timestamp: new Date(Date.now() - 120000).toISOString(),
        location: "",
        plate_number: "XYZ789",
        vehicle_type: "Motorcycle",
        violations: ["No helmet"],
        confidence: 0.89,
        screenshot: "/placeholder.svg?height=200&width=320",
      },
    ]
  }

  const generateMockAnalytics = (results: any[]) => {
    let noHelmetCount = 0
    let speedingCount = 0

    results.forEach((result) => {
      result.violations.forEach((v: string) => {
        if (v.includes("helmet")) noHelmetCount++
        if (v.includes("Speeding")) speedingCount++
      })
    })

    return {
      totalViolations: results.length,
      noHelmetCount,
      speedingCount,
      redLightCount: 0,
      licensePlateIssues: 0,
      processingTime: 11.5,
    }
  }

  // UI helper functions
  const getViolationColor = (violation: string): string => {
    if (violation.includes("Speeding") || violation.includes("red light")) {
      return "bg-red-600"
    } else if (violation.includes("helmet") || violation.includes("License plate")) {
      return "bg-yellow-600"
    } else {
      return "bg-blue-600"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatConfidence = (confidence: number) => {
    return (confidence * 100).toFixed(1) + "%"
  }

  // Cleanup effect for webcam
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [webcamStream])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Traffic Violation Detection System</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeView === "upload"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveView("upload")}
          >
            Upload Video
          </button>
          <button
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeView === "results"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveView("results")}
            disabled={!violationResults}
          >
            Detection Results
          </button>
          <button
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeView === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveView("analytics")}
            disabled={!violationResults}
          >
            Analytics
          </button>
        </div>

        {/* Upload View */}
        {activeView === "upload" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Traffic Footage</h2>

              {/* Upload area */}
              <div
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer p-6 transition-colors
                  ${selectedFile ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="text-center space-y-3">
                    <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <FileVideo className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-600">Video selected</p>
                      <p className="text-sm text-gray-500">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <Upload className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Drag and drop your video file here or click to browse</p>
                      <p className="text-gray-500 text-sm mt-2">Supported formats: MP4, AVI, MOV (Max size: 100MB)</p>
                    </div>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>

            {/* Video preview */}
            {selectedFile && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-medium flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Video Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {videoPreview && (
                    <video ref={videoRef} src={videoPreview} controls className="w-full h-auto max-h-[500px] rounded">
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Webcam preview for real-time detection */}
            {isRealtimeActive && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-medium flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Real-time Detection
                  </h3>
                  <button
                    onClick={stopRealtimeDetection}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center"
                  >
                    Stop Detection
                  </button>
                </div>
                <div className="p-4">
                  {webcamStream && (
                    <video
                      ref={(video) => {
                        if (video && webcamStream) {
                          video.srcObject = webcamStream
                          video.play()
                        }
                      }}
                      className="w-full h-auto max-h-[500px] rounded"
                      autoPlay
                      playsInline
                      muted
                    />
                  )}
                </div>

                {/* Real-time results */}
                {realtimeResults && realtimeResults.length > 0 && (
                  <div className="border-t p-4">
                    <h4 className="font-medium mb-3">Live Detection Results:</h4>
                    <div className="space-y-2">
                      {realtimeResults.map((result, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded border flex justify-between items-center">
                          <div>
                            <span className="font-mono bg-black text-white px-2 py-0.5 rounded mr-2">
                              {result.plate_number}
                            </span>
                            <span className="text-sm text-gray-700">{result.traffic_violation}</span>
                          </div>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">LIVE</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Process buttons */}
            {selectedFile && !isProcessing && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={processVideo}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Process Video
                </button>
              </div>
            )}

            {/* Real-time detection button */}
            {!isProcessing && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">Real-time Detection</h2>
                <p className="text-gray-600 mb-4">
                  Use your webcam for real-time traffic violation detection. This will access your camera and analyze
                  the footage in real-time.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => startRealtimeDetection()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Real-time Detection
                  </button>
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {processingStage === "uploading" ? "Uploading Video..." : "Analyzing Footage..."}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {processingStage === "uploading" ? `${Math.round(uploadProgress)}%` : "Processing..."}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: processingStage === "uploading" ? `${uploadProgress}%` : "100%",
                    }}
                  ></div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {processingStage === "uploading"
                    ? "Uploading video to secure server..."
                    : "Running AI detection algorithms..."}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Processing Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {activeView === "results" && (
          <div className="space-y-6">
            {/* Results header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Detection Results</h2>
                  <p className="text-sm text-gray-500">
                    {violationResults ? `${violationResults.length} violations detected` : "No results available"}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <button
                      className="px-4 py-2 bg-white border rounded-lg text-sm font-medium flex items-center hover:bg-gray-50"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 p-2">
                        <div className="p-2 text-sm font-medium">Filter by violation</div>
                        <div className="p-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>No helmet</span>
                          </label>
                        </div>
                        <div className="p-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>Speeding</span>
                          </label>
                        </div>
                        <div className="p-2">
                          <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>Red light</span>
                          </label>
                        </div>
                        <div className="border-t mt-2 pt-2 flex justify-end p-2">
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Apply</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <div className="pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search plate number..."
                        className="py-2 px-2 border-none focus:ring-0 text-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results list */}
            {violationResults && violationResults.length > 0 ? (
              <div className="space-y-4">
                {violationResults.map((result, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="border-b bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 font-medium text-xs py-1 px-2 rounded mr-3">
                          {result.id}
                        </div>
                        <h3 className="font-medium">
                          License Plate:{" "}
                          <span className="font-mono bg-black text-white px-2 py-0.5 rounded ml-1">
                            {result.plate_number}
                          </span>
                        </h3>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(result.timestamp)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {result.location}
                        </div>
                        <button className="p-1 rounded-full hover:bg-gray-200">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <img
                          src={result.screenshot || "/placeholder.svg"}
                          alt="Violation screenshot"
                          className="w-full h-auto rounded border"
                        />
                        <div className="mt-2 text-sm text-gray-500 flex justify-between">
                          <span>Vehicle type: {result.vehicle_type}</span>
                          <span>Confidence: {formatConfidence(result.confidence)}</span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-medium mb-3">Detected Violations:</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.violations.map((violation, idx) => (
                            <span
                              key={idx}
                              className={`${getViolationColor(violation)} text-white text-sm px-3 py-1 rounded-full`}
                            >
                              {violation}
                            </span>
                          ))}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <h5 className="font-medium text-sm mb-2">Violation Details</h5>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Time of Violation:</strong> {formatDate(result.timestamp)}
                            </p>
                            <p>
                              <strong>Location:</strong> {result.location}
                            </p>
                            <p>
                              <strong>Vehicle Type:</strong> {result.vehicle_type}
                            </p>
                            <p>
                              <strong>Detection Confidence:</strong> {formatConfidence(result.confidence)}
                            </p>
                            {result.violations.includes("No helmet") && (
                              <p className="text-yellow-700">
                                <strong>Helmet Violation:</strong> Rider detected without proper helmet
                              </p>
                            )}
                            {result.violations.includes("Speeding") && (
                              <p className="text-red-700">
                                <strong>Speed Violation:</strong> Vehicle exceeding speed limit
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t p-3 bg-gray-50 flex justify-end">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Export Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Results Available</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Please upload and process a video to see detection results.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === "analytics" && (
          <div className="space-y-6">
            {/* Analytics header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Violation Analytics</h2>
                  <p className="text-sm text-gray-500">Summary of detected traffic violations</p>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    className="border rounded-lg py-2 px-3 text-sm"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analytics cards */}
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Total Violations</p>
                        <h3 className="text-2xl font-bold mt-1">{analytics.totalViolations}</h3>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">No Helmet</p>
                        <h3 className="text-2xl font-bold mt-1">{analytics.noHelmetCount}</h3>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Speeding</p>
                        <h3 className="text-2xl font-bold mt-1">{analytics.speedingCount}</h3>
                      </div>
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Processing Time</p>
                        <h3 className="text-2xl font-bold mt-1">{analytics.processingTime}s</h3>
                      </div>
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visualization placeholder */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-medium mb-4">Violation Distribution</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Visualization chart would appear here</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Traffic Violation Detection System &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
