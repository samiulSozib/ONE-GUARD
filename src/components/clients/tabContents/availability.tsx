import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const availabilityData = [
  {
    day: "Monday",
    startTime: "19:18",
    endTime: "22:18",
  },
  {
    day: "Tuesday",
    startTime: "19:18",
    endTime: "22:18",
  },
  {
    day: "Wednesday",
    startTime: "19:18",
    endTime: "22:18",
  },
  {
    day: "Thursday",
    startTime: "-",
    endTime: "-",
  },
  {
    day: "Friday",
    startTime: "19:18",
    endTime: "22:18",
  },
  {
    day: "Saturday",
    startTime: "19:18",
    endTime: "22:18",
  },
  {
    day: "Sunday",
    startTime: "-",
    endTime: "-",
  },
]

export function Availability() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100 hover:bg-gray-100"> {/* Added background color */}
          <TableHead className="w-[150px] text-gray-900 font-semibold">Day</TableHead> {/* Darker text */}
          <TableHead className="text-center text-gray-900 font-semibold">Start Time</TableHead>
          <TableHead className="text-center text-gray-900 font-semibold">End Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {availabilityData.map((schedule) => (
          <TableRow key={schedule.day} className="h-16 hover:bg-gray-500 hover:text-white"> {/* Added hover effect */}
            <TableCell className="font-medium py-4">{schedule.day}</TableCell>
            <TableCell className="text-center py-4">{schedule.startTime}</TableCell>
            <TableCell className="text-center py-4">{schedule.endTime}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}