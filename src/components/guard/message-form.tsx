import React from 'react'
import { Button } from '../ui/button'

const MessageForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Send a Message</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">Message Title</label>
        <input
          type="text"
          placeholder="Enter message title"
          className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">Description</label>
        <textarea
          placeholder="Write your message here..."
          rows={5}
          className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 w-full">
        <Button
          variant="outline"
          className="border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button className="bg-green-600 hover:bg-blue-700 text-white flex-1">Send</Button>
      </div>
    </div>
  )
}

export default MessageForm
