"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Download, Upload, FileJson, Check, AlertCircle, Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ExportImportProps {
  onExport: (options: ExportOptions) => string
  onImport: (data: string) => { success: boolean; message: string }
  onClearData: () => void
}

interface ExportOptions {
  habits: boolean
  tasks: boolean
  settings: boolean
  quotes: boolean
  achievements: boolean
}

export function ExportImport({ onExport, onImport, onClearData }: ExportImportProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    habits: true,
    tasks: true,
    settings: true,
    quotes: true,
    achievements: true,
  })
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = onExport(exportOptions)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `focuslab-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportDialog(false)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = onImport(content)
      setImportResult(result)
      if (result.success) {
        setTimeout(() => {
          setShowImportDialog(false)
          setImportResult(null)
        }, 2000)
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    onClearData()
    setShowClearDialog(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} className="h-8">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="h-8">
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Import
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </DialogTitle>
            <DialogDescription>Select which data you want to export</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {Object.entries(exportOptions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, [key]: checked === true }))}
                />
                <Label htmlFor={key} className="capitalize cursor-pointer">
                  {key}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <FileJson className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data
            </DialogTitle>
            <DialogDescription>Upload a previously exported JSON file</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                "hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <Database className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Click to select file</p>
              <p className="text-xs text-muted-foreground mt-1">Supports .json files</p>
            </div>

            {importResult && (
              <Alert className={cn("mt-4", importResult.success ? "border-green-500" : "border-destructive")}>
                {importResult.success ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <AlertDescription>{importResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all your habits, tasks, and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
