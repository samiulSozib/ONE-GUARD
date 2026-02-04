// components/clients/view/tabContents/personal-information.tsx
"use client";

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, Phone, MapPin, Building, Calendar, Globe, User, FileText } from "lucide-react"
import React, { useState } from "react"
import { useAlert } from "@/components/contexts/AlertContext"
import MessageForm from "../message-form"
import { Client } from "@/app/types/client"

interface PersonalInformationProps {
  client: Client;
}

const PersonalInformation = ({ client }: PersonalInformationProps) => {
  const [showMessageForm, setShowMessageForm] = useState(false)
  const { showAlert } = useAlert()

  const personalInfo = [
    { label: "Phone number:", value: client.phone, icon: <Phone size={16} /> },
    { label: "Email:", value: client.email, icon: <Mail size={16} /> },
    { label: "Client Code:", value: client.client_code, icon: <User size={16} /> },
  ]

  const employmentInfo = [
    { label: "Company Name:", value: client.company_name, icon: <Building size={16} /> },
    { label: "Business Type:", value: client.business_type, icon: <FileText size={16} /> },
    { label: "Industry:", value: client.industry, icon: <Building size={16} /> },
    { label: "Country:", value: client.country, icon: <Globe size={16} /> },
    { label: "City:", value: client.city, icon: <MapPin size={16} /> },
    { label: "Address:", value: client.address, icon: <MapPin size={16} /> },
    { label: "Registration Date:", value: client.registration_date ? new Date(client.registration_date).toLocaleDateString() : "N/A", icon: <Calendar size={16} /> },
    { label: "Created Date:", value: new Date(client.created_at).toLocaleDateString(), icon: <Calendar size={16} /> },
  ]

  const handleShowAlert = () => {
    showAlert(`Alert successfully sent to ${client.full_name}`, "error")
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
        <div className="space-y-3 text-sm">
          {personalInfo.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="text-gray-400">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-gray-600 dark:text-gray-300 text-xs">{item.label}</div>
                <div className="font-medium text-gray-800 dark:text-white">{item.value || "N/A"}</div>
              </div>
            </div>
          ))}

          {/* Document Download */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-gray-400" />
              <div>
                <div className="text-gray-600 dark:text-gray-300 text-xs">Document:</div>
                <div className="font-medium text-gray-800 dark:text-white">Client Agreement.pdf</div>
              </div>
            </div>
            <button className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 hover:underline">
              <Download size={16} />
              Download
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
          
          <Button
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex-1"
            onClick={handleShowAlert}
          >
            Send alert
          </Button>
        </div>
      </Card>

      {/* Right Card Section */}
      <Card className="col-span-12 md:col-span-7 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        {!showMessageForm ? (
          <div className="text-sm">
            {employmentInfo.map((item, index) => (
              <div key={index}>
                <div className="flex items-start gap-3 py-2">
                  <div className="text-gray-400 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                      <span className="font-medium text-gray-800 dark:text-white text-right">
                        {item.value || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                {index !== employmentInfo.length - 1 && (
                  <hr className="border-gray-200 dark:border-gray-700 my-1" />
                )}
              </div>
            ))}
            
            {/* Notes Section */}
            {client.notes && (
              <>
                <hr className="border-gray-200 dark:border-gray-700 my-3" />
                <div className="flex items-start gap-3 py-2">
                  <FileText size={16} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Notes:</span>
                    </div>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-700 dark:text-gray-300">
                        {client.notes}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // <MessageForm onCancel={handleCancelMessage} client={client} />
          <></>
        )}
      </Card>
    </div>
  )
}

export default PersonalInformation