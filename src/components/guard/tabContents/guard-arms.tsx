import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Trash, TrashIcon } from "lucide-react"

const trainingData = [
    {
        title: "Management",
        startDate: "Jan 1, 2023",
        endDate: "Jun 13, 2024",
    },
   
]

export function GuardArms() {
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="text-gray-900 font-semibold">Title</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Start Date</TableHead>
                    <TableHead className="text-gray-900 font-semibold">End Date</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {trainingData.map((training, index) => (
                    <TableRow key={index} className="h-16 hover:bg-gray-500 hover:text-white">
                        <TableCell className="font-medium py-4">{training.title}</TableCell>
                        <TableCell className="py-4">{training.startDate}</TableCell>
                        <TableCell className="py-4">{training.endDate}</TableCell>
                        
                        <TableCell className="py-4">

                            <Trash2 color="red" size="lg" className="h-6 w-6" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}