import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle } from "lucide-react"
import React, { useState } from "react"
import { useAlert } from "@/components/contexts/AlertContext"
import MessageForm from "../message-form"

const PersonalInformation = () => {
  const [showMessageForm, setShowMessageForm] = useState(false)
  const { showAlert } = useAlert()

  const personalInfo = [
    
    { label: "Phone number:", value: "+156216845" },
    { label: "Email:", value: "Info@gmail.com" },
    { label: "Gender:", value: "Male" },
    { label: "Language:", value: "English" },
  ]

  const employmentInfo = [
    { label: "Join Date:", value: "Jul 2, 2024" },
    { label: "Client Type:", value: "Unarmed" },
    { label: "Country:", value: "United Kingdom" },
    { label: "State:", value: "Wiltshire" },
    { label: "City:", value: "Jefferson" },
    { label: "Address:", value: "159, Ocean Avenue, Miami, FL 12345" },
    { label: "Notes:", value: "This is the demo purpose data" },
  ]

  const handleShowAlert = () => {
    showAlert(`Alert successfully sent`, "error")
  }

  const handleSendMessage = () => {
    setShowMessageForm(true)
  }

  const handleCancelMessage = () => {
    setShowMessageForm(false)
  }

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Left Card - Personal Info */}
      <Card className="col-span-12 md:col-span-5 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        <div className="space-y-2 text-sm">
          {personalInfo.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
              <span className="font-medium text-gray-800 dark:text-white">{item.value}</span>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Document:</span>
            <button className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 hover:underline">
              Download <Download size={16} />
            </button>
          </div>
        </div>

        

        {/* Action Buttons */}
        <div className="flex justify-between mt-4 w-full gap-2">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-1"
            onClick={handleSendMessage}
          >
            Send a message
          </Button>
          
        </div>
      </Card>

      {/* Right Card Section */}
      <Card className="col-span-12 md:col-span-7 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        {!showMessageForm ? (
          <div className="text-sm">
            {employmentInfo.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-start py-1">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-800 dark:text-white text-right">
                    {item.value}
                  </span>
                </div>
                {index !== employmentInfo.length - 1 && (
                  <hr className="border-gray-200 dark:border-gray-700 my-1" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <MessageForm onCancel={handleCancelMessage} />
        )}
      </Card>
    </div>
  )
}

export default PersonalInformation


