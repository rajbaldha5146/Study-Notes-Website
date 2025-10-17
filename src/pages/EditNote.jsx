import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { getNote, updateNote } from '../services/api'
import toast from 'react-hot-toast'

export default function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: 'javascript',
    episode: ''
  })
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      const note = await getNote(id)
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.join(', ') : '',
        category: note.category || 'javascript',
        episode: note.episode || ''
      })
    } catch (error) {
      toast.error('Failed to fetch note')
      navigate('/app')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const noteData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        episode: formData.episode ? parseInt(formData.episode) : undefined
      }
      
      await updateNote(id, noteData)
      toast.success('Note updated successfully!')
      navigate(`/app/note/${id}`)
    } catch (error) {
      toast.error('Failed to update note')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/app/note/${id}`)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Note</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              preview 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter note title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Episode Number
              </label>
              <input
                type="number"
                name="episode"
                value={formData.episode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="e.g., 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="react">React</option>
                <option value="nodejs">Node.js</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="javascript, closures, functions"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="border-b border-gray-700 px-6 py-3">
            <h3 className="text-lg font-medium text-white">Content</h3>
            <p className="text-sm text-gray-400">Write your note in Markdown format</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-96">
            {/* Editor */}
            <div className={`${preview ? 'hidden lg:block' : ''}`}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-96 p-6 bg-gray-900 text-white border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm placeholder-gray-500"
                placeholder="Write your content here using Markdown..."
                required
              />
            </div>
            
            {/* Preview */}
            <div className={`border-l border-gray-700 bg-gray-900 ${!preview ? 'hidden lg:block' : ''}`}>
              <div className="p-6 prose prose-sm max-w-none prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      return (
                        <code
                          className={`${className} ${inline ? 'bg-gray-700 text-gray-200 px-1 py-0.5 rounded text-sm' : 'block bg-gray-800 text-white p-4 rounded-lg overflow-x-auto'}`}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {formData.content || '*Preview will appear here...*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Updating...' : 'Update Note'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}