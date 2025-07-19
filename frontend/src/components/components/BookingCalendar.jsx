import { Calendar } from "lucide-react"

const BookingCalendar = ({ teacherId }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <Calendar className="h-5 w-5" />
        Available Time Slots
      </h3>
      <div className="space-y-4">
        <p className="text-gray-600">Select a date and time to book your session with this teacher.</p>

        {/* Calendar component placeholder */}
        <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Interactive calendar component would be implemented here</p>
          <p className="text-sm mt-2">Integration with a calendar library like react-calendar or date-fns</p>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700">
          Continue to Booking
        </button>
      </div>
    </div>
  )
}

export default BookingCalendar
