'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Product } from '@/lib/types'
import { createProduct } from '@/lib/db'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddProductFormProps {
  onSuccess: (product: Product) => void
}

export default function AddProductForm({ onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    priceUsd: '',
    costUsd: '',
    unit: 'unit' as 'unit' | 'kg' | 'liter' | 'meter',
    quantity: '',
    minStockLevel: '',
    isReturnable: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      unit: value as typeof formData.unit
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }
    if (!formData.sku.trim()) {
      setError('SKU is required')
      return
    }
    if (!formData.priceUsd) {
      setError('Price is required')
      return
    }

    const priceUsd = parseFloat(formData.priceUsd)
    const costUsd = formData.costUsd ? parseFloat(formData.costUsd) : undefined
    const quantity = formData.quantity ? parseInt(formData.quantity) : 0

    if (isNaN(priceUsd) || priceUsd <= 0) {
      setError('Price must be a valid positive number')
      return
    }

    if (costUsd && isNaN(costUsd)) {
      setError('Cost must be a valid number')
      return
    }

    setLoading(true)
    try {
      const newProduct = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sku: formData.sku.trim(),
        category: formData.category.trim() || 'Uncategorized',
        priceUsd,
        costUsd,
        unit: formData.unit,
        quantity,
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : 5,
        isReturnable: formData.isReturnable,
      }, '')

      setSuccess(true)
      setFormData({
        name: '',
        description: '',
        sku: '',
        category: '',
        priceUsd: '',
        costUsd: '',
        unit: 'unit',
        quantity: '',
        minStockLevel: '',
        isReturnable: false,
      })

      setTimeout(() => {
        onSuccess(newProduct)
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Add a new product to your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Product created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Coca-Cola 2L"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., COKE-2L-001"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description (optional)"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Beverages"
                disabled={loading}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pricing (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceUsd">Selling Price (USD) *</Label>
                <Input
                  id="priceUsd"
                  name="priceUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceUsd}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costUsd">Cost Price (USD)</Label>
                <Input
                  id="costUsd"
                  name="costUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costUsd}
                  onChange={handleChange}
                  placeholder="0.00 (optional)"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Type</Label>
                <Select value={formData.unit} onValueChange={handleSelectChange}>
                  <SelectTrigger disabled={loading}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Units</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="liter">Liters (L)</SelectItem>
                    <SelectItem value="meter">Meters (m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  placeholder="5"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isReturnable"
                  checked={formData.isReturnable}
                  onChange={handleChange}
                  disabled={loading}
                  className="rounded"
                />
                <span className="text-sm">Is Returnable (e.g., bottles, containers)</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
