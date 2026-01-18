'use client'

import { useState, useEffect } from 'react'
import api, { Review, ReviewsResponse } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Load reviews
  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      const data = await api.getProductReviews(productId)
      setReviewsData(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.createReview(productId, { rating, title, content })
      setTitle('')
      setContent('')
      setRating(5)
      setShowForm(false)
      loadReviews()
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(productId, reviewId)
      loadReviews()
    } catch (err) {
      // Already marked or error
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      await api.deleteReview(productId, reviewId)
      loadReviews()
    } catch (err) {
      console.error('Failed to delete review:', err)
    }
  }

  const userHasReviewed = reviewsData?.reviews.some(r => r.userId === user?.id)

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const stats = reviewsData?.stats || { average: 0, count: 0, distribution: {} }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Stats Overview */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900">
            {stats.average > 0 ? stats.average.toFixed(1) : '-'}
          </div>
          <div className="flex items-center justify-center md:justify-start mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`text-2xl ${star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-600 mt-1">{stats.count} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = stats.distribution[star] || 0
            const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-12">{star} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Write Review Button */}
      {isAuthenticated && !userHasReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Write a Review
        </button>
      )}

      {!isAuthenticated && (
        <p className="mb-6 text-gray-600">
          <a href="/login" className="text-indigo-600 hover:underline">Sign in</a> to write a review
        </p>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviewsData?.reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl block mb-2">📝</span>
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviewsData?.reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={user?.id === review.userId}
              onHelpful={() => handleHelpful(review.id)}
              onDelete={() => handleDelete(review.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Review Card Component
function ReviewCard({
  review,
  isOwner,
  onHelpful,
  onDelete,
}: {
  review: Review
  isOwner: boolean
  onHelpful: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {review.userName[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{review.userName}</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {review.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Verified Purchase
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      <p className="text-gray-600 whitespace-pre-wrap">{review.content}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <button
          onClick={onHelpful}
          className="text-sm text-gray-500 hover:text-indigo-600 transition flex items-center gap-1"
        >
          👍 Helpful ({review.helpful})
        </button>
        {isOwner && (
          <button
            onClick={onDelete}
            className="text-sm text-red-500 hover:text-red-600 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductReviews
