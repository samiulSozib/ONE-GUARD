"use client"

import { MessagesSquareIcon, Pencil, Star } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { MessageReplyForm } from "../clients/message-rep;y-form"
import { Card } from "../ui/card"
import MessageContactList from "./message-contact-list"
import MessageBox from "./message-box"

export function Messages() {
  return (
    <Card className="w-full  transition-colors duration-300">
      <div className="p-2 grid grid-cols-12">
     
        <div className="col-span-3 border-r-2">
          <MessageContactList/>
        </div>

        <div className="col-span-9">
          <MessageBox/>
        </div>


      </div>
    </Card>
  )
}


