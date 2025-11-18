import { Complainant } from "@/app/types/complainant";

export const complainants: Complainant[] = [
  {
    id: 1,
    title: "Network issue in office",
    reporter: "101",
    reporter_name: "Samiul Bashar",
    against: "201",
    against_name: "IT Department",
    priority: "High",
    status: "In Progress",
    attachment: "/uploads/network_issue.png"
  },
  {
    id: 2,
    title: "Late attendance correction",
    reporter: "102",
    reporter_name: "Rahim Uddin",
    against: "301",
    against_name: "HR Department",
    priority: "Low",
    status: "Solved",
    attachment: "/uploads/network_issue.png"
  },
  {
    id: 3,
    title: "Office chair broken",
    reporter: "103",
    reporter_name: "Karim Ahmed",
    against: "401",
    against_name: "Admin Department",
    priority: "High",
    status: "Close",
    attachment: "/uploads/network_issue.png"
  },
  {
    id: 4,
    title: "Misbehavior complaint",
    reporter: "104",
    reporter_name: "Jamal Hossain",
    against: "105",
    against_name: "Colleague",
    priority: "Low",
    status: "Cancelled",
    attachment: "/uploads/network_issue.png"
  },
  {
    id: 5,
    title: "System not turning on",
    reporter: "106",
    reporter_name: "Tanvir Hasan",
    against: "201",
    against_name: "IT Department",
    priority: "High",
    status: "In Progress",
    attachment: "/uploads/system_issue.jpg"
  }
];
