"use client"

import { RefObject } from "react"
import type { Bank } from "@/lib/db"
import { API_BASE } from "@/lib/config"

export type PDFComponent = React.ComponentType<{
  fileUrl: string
  width: number
  onLoadSuccess?: (data: { numPages: number; pageWidth: number; pageHeight: number }) => void
  className?: string
}>

interface CheckCanvasProps {
  pdfUrl?: string
  pageWidth: number
  pageHeight?: number
  containerRef: RefObject<HTMLDivElement | null>
  positions: Bank["positions"]
  showRectangles: boolean
  values: {
    city: string
    date: string
    payee: string
    amount: string
    amountLine1: string
    amountLine2?: string
  }
  PDFComponent: PDFComponent
  onDocumentLoadSuccess?: (data: { numPages: number; pageWidth: number; pageHeight: number }) => void
}

export function CheckCanvas({
  pdfUrl,
  pageWidth,
  pageHeight,
  containerRef,
  positions,
  showRectangles,
  values,
  PDFComponent,
  onDocumentLoadSuccess,
}: CheckCanvasProps) {
  const { city, date, payee, amount, amountLine1, amountLine2 } = values
  const normalizePdfUrl = (url?: string) => {
    if (!url) return undefined
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) return `${API_BASE}${url}`
    return `${API_BASE}/${url}`
  }

  const normalizedPdfUrl = normalizePdfUrl(pdfUrl)
  const safePageWidth = Math.max(pageWidth || 0, 320)
  const scaleRatio = pageWidth ? safePageWidth / pageWidth : 1
  const safePageHeight = pageHeight ? Math.max(Math.round(pageHeight * scaleRatio), 400) : 600

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded border-2 border-dashed border-gray-300 bg-white"
      style={{ width: `${safePageWidth}px`, height: `${safePageHeight}px` }}
    >
      {normalizedPdfUrl && (
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: `${safePageWidth}px`, height: `${safePageHeight}px` }}
        >
          <PDFComponent
            fileUrl={normalizedPdfUrl}
            width={safePageWidth}
            onLoadSuccess={onDocumentLoadSuccess}
            className="w-full h-full"
          />
        </div>
      )}

      {!normalizedPdfUrl && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p className="text-muted-foreground">Aucun PDF téléchargé pour cette banque</p>
        </div>
      )}

      {showRectangles ? (
        <>
          <div
            className="absolute border-2 border-blue-500 bg-blue-100/30"
            style={{
              left: `${positions.city.x}px`,
              top: `${positions.city.y}px`,
              width: `${positions.city.width}px`,
              height: `${positions.city.fontSize * 1.5}px`,
            }}
          >
            <div
              className="flex h-full items-center justify-center px-1 text-center font-medium text-blue-900"
              style={{ fontSize: `${positions.city.fontSize}px` }}
            >
              {city}
            </div>
          </div>

          <div
            className="absolute border-2 border-green-500 bg-green-100/30"
            style={{
              left: `${positions.date.x}px`,
              top: `${positions.date.y}px`,
              width: `${positions.date.width}px`,
              height: `${positions.date.fontSize * 1.5}px`,
            }}
          >
            <div
              className="flex h-full items-center justify-center px-1 text-center font-medium text-green-900"
              style={{ fontSize: `${positions.date.fontSize}px` }}
            >
              {date}
            </div>
          </div>

          <div
            className="absolute border-2 border-purple-500 bg-purple-100/30"
            style={{
              left: `${positions.payee.x}px`,
              top: `${positions.payee.y}px`,
              width: `${positions.payee.width}px`,
              height: `${positions.payee.fontSize * 1.5}px`,
            }}
          >
            <div
              className="flex h-full items-center justify-center px-1 text-center font-medium text-purple-900"
              style={{ fontSize: `${positions.payee.fontSize}px` }}
            >
              {payee}
            </div>
          </div>

          <div
            className="absolute border-2 border-orange-500 bg-orange-100/30"
            style={{
              left: `${positions.amountInWords.x}px`,
              top: `${positions.amountInWords.y}px`,
              width: `${positions.amountInWords.width}px`,
              height: `${positions.amountInWords.fontSize * 1.5}px`,
            }}
          >
            <div
              className="flex h-full items-center justify-start px-2 text-left font-medium text-orange-900"
              style={{ fontSize: `${positions.amountInWords.fontSize}px` }}
            >
              {amountLine1}
            </div>
          </div>

          {positions.amountInWordsLine2 && amountLine2 && (
            <div
              className="absolute border-2 border-orange-600 bg-orange-200/30"
              style={{
                left: `${positions.amountInWordsLine2.x}px`,
                top: `${positions.amountInWordsLine2.y}px`,
                width: `${positions.amountInWordsLine2.width}px`,
                height: `${positions.amountInWordsLine2.fontSize * 1.5}px`,
              }}
            >
              <div
                className="flex h-full items-center justify-start px-2 text-left font-medium text-orange-900"
                style={{ fontSize: `${positions.amountInWordsLine2.fontSize}px` }}
              >
                {amountLine2}
              </div>
            </div>
          )}

          <div
            className="absolute border-2 border-red-500 bg-red-100/30"
            style={{
              left: `${positions.amount.x}px`,
              top: `${positions.amount.y}px`,
              width: `${positions.amount.width}px`,
              height: `${positions.amount.fontSize * 1.5}px`,
            }}
          >
            <div
              className="flex h-full items-center justify-center px-1 text-center font-bold text-red-900"
              style={{ fontSize: `${positions.amount.fontSize}px` }}
            >
              {amount}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="check-text absolute font-medium text-gray-900"
            style={{
              left: `${positions.city.x}px`,
              top: `${positions.city.y}px`,
              width: `${positions.city.width}px`,
              height: `${positions.city.fontSize * 1.5}px`,
              fontSize: `${positions.city.fontSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px',
            }}
          >
            {city}
          </div>
          <div
            className="check-text absolute font-medium text-gray-900"
            style={{
              left: `${positions.date.x}px`,
              top: `${positions.date.y}px`,
              width: `${positions.date.width}px`,
              height: `${positions.date.fontSize * 1.5}px`,
              fontSize: `${positions.date.fontSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px',
            }}
          >
            {date}
          </div>
          <div
            className="check-text absolute font-medium text-gray-900"
            style={{
              left: `${positions.payee.x}px`,
              top: `${positions.payee.y}px`,
              width: `${positions.payee.width}px`,
              height: `${positions.payee.fontSize * 1.5}px`,
              fontSize: `${positions.payee.fontSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px',
            }}
          >
            {payee}
          </div>
          <div
            className="check-text absolute font-medium text-gray-900"
            style={{
              left: `${positions.amountInWords.x}px`,
              top: `${positions.amountInWords.y}px`,
              width: `${positions.amountInWords.width}px`,
              height: `${positions.amountInWords.fontSize * 1.5}px`,
              fontSize: `${positions.amountInWords.fontSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              textAlign: 'left',
              paddingLeft: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {amountLine1}
          </div>
          {positions.amountInWordsLine2 && amountLine2 && (
            <div
              className="check-text absolute font-medium text-gray-900"
              style={{
                left: `${positions.amountInWordsLine2.x}px`,
                top: `${positions.amountInWordsLine2.y}px`,
                width: `${positions.amountInWordsLine2.width}px`,
                height: `${positions.amountInWordsLine2.fontSize * 1.5}px`,
                fontSize: `${positions.amountInWordsLine2.fontSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                paddingLeft: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {amountLine2}
            </div>
          )}
          <div
            className="check-text absolute font-bold text-gray-900"
            style={{
              left: `${positions.amount.x}px`,
              top: `${positions.amount.y}px`,
              width: `${positions.amount.width}px`,
              height: `${positions.amount.fontSize * 1.5}px`,
              fontSize: `${positions.amount.fontSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px',
            }}
          >
            {amount}
          </div>
        </>
      )}
    </div>
  )
}
