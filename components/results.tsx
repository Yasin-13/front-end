"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface ResultsProps {
  results: Array<{
    plate_number: string
    traffic_violation: string
  }>
}

export function Results({ results }: ResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResults = results.filter((result) =>
    result.plate_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const violationCount = results.filter((result) => result.traffic_violation === "Yes").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Detection Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm">
                Total Plates: {results.length}
              </Badge>
              <Badge variant="destructive" className="text-sm">
                Violations: {violationCount}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                No Violations: {results.length - violationCount}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search plate number..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Traffic Violation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{result.plate_number}</TableCell>
                      <TableCell>
                        {result.traffic_violation === "Yes" ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      {searchTerm ? "No matching license plates found" : "No results available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

