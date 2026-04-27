import { useBookmarks } from '../../hooks/useBookmarks'

export default function BookmarkButton({ countryCode, articleId, size = 'md' }) {
  const { isBookmarked, toggle } = useBookmarks()
  const saved = isBookmarked(countryCode, articleId)

  return (
    <button
      onClick={() => toggle(countryCode, articleId)}
      title={saved ? 'Remove bookmark' : 'Bookmark this article'}
      className={`flex items-center gap-1.5 rounded-lg border transition-all duration-200
        ${size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}
        ${saved
          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
        }`}
    >
      <span>{saved ? '★' : '☆'}</span>
      <span className="font-medium">{saved ? 'Saved' : 'Save'}</span>
    </button>
  )
}
