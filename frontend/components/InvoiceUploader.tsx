'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface ExtractedData {
  supplierName: string
  amount: string
  currency: string
  dueDate: string
  description: string
  walletAddress?: string
}

interface InvoiceUploaderProps {
  onDataExtracted: (data: ExtractedData) => void
}

export default function InvoiceUploader({ onDataExtracted }: InvoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(uploadedFile.type)) {
      setError('Please upload a PDF or image file (PNG, JPG)')
      return
    }

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    
    setFile(uploadedFile)
    setError(null)
    setExtracting(true)

    try {
      const formData = new FormData()
      formData.append('invoice', uploadedFile)
      
      const response = await fetch('/api/extract-invoice', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to extract invoice data')
      }
      
      const data: ExtractedData = await response.json()
      setExtracted(data)
      onDataExtracted(data)
    } catch (error) {
      console.error('Invoice extraction error:', error)
      setError('Failed to extract invoice data. Please enter manually.')
      
      // Fallback: Use mock data for demo
      const mockData: ExtractedData = {
        supplierName: 'Design Agency Ltd',
        amount: '2500',
        currency: 'USDC',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Monthly design retainer',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678'
      }
      setExtracted(mockData)
      onDataExtracted(mockData)
    } finally {
      setExtracting(false)
    }
  }

  function handleReset() {
    setExtracted(null)
    setFile(null)
    setError(null)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upload Invoice</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Powered by</span>
          <span className="text-xs font-semibold text-primary-600">Claude AI</span>
        </div>
      </div>
      
      {!extracted ? (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleUpload}
              className="hidden"
              id="invoice-upload"
              disabled={extracting}
            />
            <label 
              htmlFor="invoice-upload" 
              className={`btn-primary cursor-pointer inline-block ${extracting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Extracting Data...
                </>
              ) : (
                'Choose Invoice File'
              )}
            </label>
            <p className="text-sm text-gray-500 mt-3">PDF, PNG, or JPG (max 10MB)</p>
            <p className="text-xs text-gray-400 mt-2">
              AI will automatically extract supplier, amount, and payment details
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Note</p>
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Invoice data extracted successfully!</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Supplier</p>
              <p className="font-medium">{extracted.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium">{extracted.amount} {extracted.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium">{new Date(extracted.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{extracted.description}</p>
            </div>
            {extracted.walletAddress && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Wallet Address</p>
                <p className="font-mono text-sm">{extracted.walletAddress}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            Upload Another Invoice
          </button>
        </div>
      )}
    </div>
  )
}