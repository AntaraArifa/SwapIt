import { Star } from "lucide-react"

const ReviewsList = ({ reviews }) => {
  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      studentName: "Sarah Johnson",
      rating: 5,
      comment:
        "Excellent teacher! Very patient and explains concepts clearly. I learned so much in just a few sessions.",
      date: "2024-01-15",
    },
    {
      id: 2,
      studentName: "Mike Chen",
      rating: 5,
      comment: "Great experience learning guitar. The lessons were well-structured and fun!",
      date: "2024-01-10",
    },
    {
      id: 3,
      studentName: "Emma Davis",
      rating: 4,
      comment: "Very knowledgeable and helpful. Would definitely recommend to others.",
      date: "2024-01-05",
    },
  ]

  const reviewsToShow = reviews.length > 0 ? reviews : mockReviews

  return (
    <div className="space-y-4">
      {reviewsToShow.map((review) => (
        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
              {review.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              <p className="text-gray-600">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReviewsList
