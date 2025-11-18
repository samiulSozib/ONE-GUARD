"use client"

import { MessagesSquareIcon, Pencil, Star } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { MessageReplyForm } from "../clients/message-rep;y-form"

export function Messages() {
  return (
    <div className="w-full  transition-colors duration-300">
      <div className="p-2">
        <div className="flex flex-row gap-3 bg-blue-200 dark:bg-black p-8 rounded-md mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#74CAFF" />
            <path d="M29 32.5H19C16 32.5 14 31 14 27.5V20.5C14 17 16 15.5 19 15.5H29C32 15.5 34 17 34 20.5V27.5C34 31 32 32.5 29 32.5Z" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M29 21L25.87 23.5C24.84 24.32 23.15 24.32 22.12 23.5L19 21" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div className="flex flex-col gap-2">
            <p className="text-black dark:text-white font-bold text-xl">Title</p>
            <div className="flex flex-row items-center justify-between">
              <p className="text-gray-500 dark:text-gray-200">Site: GBR</p>
              <div className="flex flex-row items-center justify-between gap-3">
                <p className="text-gray-400 dark:text-gray-200 text-sm">09 Mar 2020 </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
                <MessageReplyForm trigger={
                  <p className="font-bold text-green-500 cursor-pointer">Reply</p>
                }/>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda eos velit voluptates cum tenetur veniam suscipit. Vero cum labore sit, autem nihil explicabo recusandae? Iusto illo hic corporis fugit molestiae?</p>
          </div>
        </div>

        <div className="flex flex-row gap-3 bg-blue-200 dark:bg-black p-8 rounded-md mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#74CAFF" />
            <path d="M29 32.5H19C16 32.5 14 31 14 27.5V20.5C14 17 16 15.5 19 15.5H29C32 15.5 34 17 34 20.5V27.5C34 31 32 32.5 29 32.5Z" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M29 21L25.87 23.5C24.84 24.32 23.15 24.32 22.12 23.5L19 21" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div className="flex flex-col gap-2">
            <p className="text-black dark:text-white font-bold text-xl">Title</p>
            <div className="flex flex-row items-center justify-between">
              <p className="text-gray-500 dark:text-gray-200">Site: GBR</p>
              <div className="flex flex-row items-center justify-between gap-3">
                <p className="text-gray-400 dark:text-gray-200 text-sm">09 Mar 2020 </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
                <MessageReplyForm trigger={
                  <p className="font-bold text-green-500 cursor-pointer">Reply</p>
                }/>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda eos velit voluptates cum tenetur veniam suscipit. Vero cum labore sit, autem nihil explicabo recusandae? Iusto illo hic corporis fugit molestiae?</p>
          </div>
        </div>

        <div className="flex flex-row gap-3 p-8 rounded-md mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#74CAFF" />
            <path d="M29 32.5H19C16 32.5 14 31 14 27.5V20.5C14 17 16 15.5 19 15.5H29C32 15.5 34 17 34 20.5V27.5C34 31 32 32.5 29 32.5Z" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M29 21L25.87 23.5C24.84 24.32 23.15 24.32 22.12 23.5L19 21" stroke="#D0F2FF" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div className="flex flex-col gap-2 w-full">
            <p className="text-black dark:text-white font-bold text-xl">Title</p>
            <div className="flex flex-row items-center justify-between">
              <p className="text-gray-500 dark:text-gray-200">Site: GBR</p>
              <div className="flex flex-row items-center justify-between gap-3">
                <p className="text-gray-400 dark:text-gray-200 text-sm">09 Mar 2020 </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
                <p className="font-bold text-green-500">Reply</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-200">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda eos
              velit voluptates cum tenetur veniam suscipit. Vero cum labore sit, autem
              nihil explicabo recusandae? Iusto illo hic corporis fugit molestiae?
            </p>

            {/* REPLY SECTION */}
            <div className="flex flex-row gap-3 mt-5 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <Avatar>
                <AvatarImage src="/images/logo.png"/>
              </Avatar>
              <div className="flex flex-col w-full">
                <div className="flex flex-row justify-between items-center">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    Admin Panel
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-300">
                    09 Mar 2020
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
                  Lorem Ipsum is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry standard dummy text ever
                  since the 1500s, when an unknown printer took a galley of type and
                  scrambled it to make a type specimen book.
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}


