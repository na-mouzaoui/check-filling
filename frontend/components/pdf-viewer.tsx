"use client"

import { useState, useEffect, useRef } from 'react'

interface PDFViewerProps {
  fileUrl: string
  width: number
  onLoadSuccess?: (data: { numPages: number; pageWidth: number; pageHeight: number }) => void
  className?: string
}

export function PDFViewer({ fileUrl, width, onLoadSuccess, className }: PDFViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const [PDFComponents, setPDFComponents] = useState<any>(null)
  const [documentKey, setDocumentKey] = useState(0)
  const [scale, setScale] = useState(1)
  const loadingTaskRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Import react-pdf only on client side
    const loadPDF = async () => {
      try {
        const { pdfjs, Document, Page } = await import('react-pdf')
        
        // Use workerSrc only (not workerPort) to avoid worker destruction issues
        const localWorkerSrc = '/pdf.worker.min.mjs'
        pdfjs.GlobalWorkerOptions.workerSrc = localWorkerSrc

        // Import styles
        await import('react-pdf/dist/Page/AnnotationLayer.css')
        await import('react-pdf/dist/Page/TextLayer.css')

        setPDFComponents({ Document, Page })
      } catch (error) {
        console.error('Error loading PDF components:', error)
      }
    }
    
    loadPDF()

    return () => {
      // Cleanup on unmount
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy().catch(() => {})
      }
    }
  }, [])

  // Force remount when fileUrl changes to properly cleanup previous document
  useEffect(() => {
    if (fileUrl && PDFComponents) {
      setDocumentKey(prev => prev + 1)
    }
  }, [fileUrl, PDFComponents])

  if (!isClient || !PDFComponents) {
    return <div className="flex items-center justify-center p-4">Chargement du PDF...</div>
  }

  const { Document, Page } = PDFComponents

  const handleLoadSuccess = (pdf: any) => {
    loadingTaskRef.current = pdf
    if (onLoadSuccess) {
      // Get the first page to extract dimensions
      pdf.getPage(1).then((page: any) => {
        const viewport = page.getViewport({ scale: 1 })
        // Calculate scale to fit the desired width
        const calculatedScale = width / viewport.width
        setScale(calculatedScale)
        onLoadSuccess({ 
          numPages: pdf.numPages,
          pageWidth: viewport.width,
          pageHeight: viewport.height
        })
      })
    }
  }

  return (
    <Document
      key={documentKey}
      file={fileUrl}
      onLoadSuccess={handleLoadSuccess}
      className={className}
      loading={<div className="flex items-center justify-center p-4">Chargement du PDF...</div>}
      error={<div className="flex items-center justify-center p-4 text-red-500">Erreur de chargement du PDF</div>}
    >
      <Page
        pageNumber={1}
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  )
}
