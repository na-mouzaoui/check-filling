"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"
import type { Bank } from "@/lib/db"
import { splitAmountInWords } from "@/lib/text-utils"
import dynamic from "next/dynamic"
import { CheckCanvas } from "./check-canvas"

// Import PDFViewer dynamically with ssr disabled
const PDFViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4">Chargement...</div>
})

interface CheckPreviewProps {
  amount: string
  amountInWords: string
  payee: string
  city: string
  date: string
  reference: string
  bank: string
  showRectangles?: boolean
}

export function CheckPreview({
  amount,
  amountInWords,
  payee,
  city,
  date,
  reference,
  bank,
  showRectangles = false,
}: CheckPreviewProps) {
  const [bankData, setBankData] = useState<Bank | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageWidth, setPageWidth] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bank) {
      fetch("/api/banks")
        .then((res) => res.json())
        .then((data) => {
          const selectedBank = data.banks.find((b: Bank) => b.name === bank)
          setBankData(selectedBank || null)
        })
    }
  }, [bank])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setPageWidth(width)
      }
    }
    // Delay to ensure container is fully rendered
    const timer = setTimeout(updateWidth, 100)
    window.addEventListener('resize', updateWidth)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateWidth)
    }
  }, [bankData])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const positions = bankData?.positions

  if (positions) {
    const { line1: amountLine1, line2: amountLine2 } = positions.amountInWordsLine2
      ? splitAmountInWords(amountInWords, positions.amountInWords.width, positions.amountInWords.fontSize)
      : { line1: amountInWords, line2: "" }

    return (
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Aperçu du chèque</h2>
        <CheckCanvas
          pdfUrl={bankData?.pdfUrl}
          pageWidth={pageWidth}
          containerRef={containerRef}
          positions={positions}
          showRectangles={showRectangles}
          values={{
            city,
            date: formatDate(date),
            payee,
            amount: amount || "",
            amountLine1,
            amountLine2,
          }}
          PDFComponent={PDFViewer}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
        />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Prévisualisation</h2>
      <div className="relative flex h-[600px] items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-100">
        <p className="text-muted-foreground">
          Sélectionnez une banque et configurez le calibrage pour voir la prévisualisation
        </p>
      </div>
    </Card>
  )
}
