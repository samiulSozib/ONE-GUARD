import React from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { Circle, PlusIcon, Search, SearchIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { messageContacts } from '@/app/(admin)/messages/data'

const MessageContactList = () => {
    return (
        <div className='p-2'>
            <div className='flex flex-row justify-between items-center'>
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>SB</AvatarFallback>
                </Avatar>
                <PlusIcon className='h-4 w-4' />
            </div>
            <div className='mt-2'>
                <InputGroup className="w-full">
                    <InputGroupInput placeholder="Search..." />
                    <InputGroupAddon>
                        <Search className="h-4 w-4" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <div className='grid grid-col-1 gap-5 mt-3 w-full'>
                {messageContacts.map((contact) => (
                <div key={contact.id} className='flex flex-row gap-2'>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>SB</AvatarFallback>
                    </Avatar>
                    <div className='ml-2 text-xs flex flex-col'>
                        <span className='font-semibold'>{contact.name}</span>
                        <span>{contact.last_message}</span>
                    </div>
                    <div className='flex flex-col text-[10px]'>
                        <span>3 days ago</span>
                        <Circle className='h-4 w-4' color='#000000'/>
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}

export default MessageContactList
