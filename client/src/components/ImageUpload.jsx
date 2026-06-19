import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be under 2MB')
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (error) throw error

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      onChange(data.publicUrl)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative">
          <img src={value} alt="Product"
            className="w-full h-40 object-cover rounded-xl border border-gray-200" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all ${uploading ? 'opacity-50' : ''}`}>
          <div className="text-3xl mb-2">📷</div>
          <div className="text-sm font-medium text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </div>
          <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}