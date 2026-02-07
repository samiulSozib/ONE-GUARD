import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, Phone, Mail, MapPin, Calendar, Shield, FileText } from "lucide-react"
import React, { useState } from "react"
import { useAlert } from "@/components/contexts/AlertContext"
import MessageForm from "../message-form"
import { Guard } from "@/app/types/guard"

interface PersonalInformationProps {
  guard: Guard;
}

const PersonalInformation = ({ guard }: PersonalInformationProps) => {
  const [showMessageForm, setShowMessageForm] = useState(false)
  const { showAlert } = useAlert()

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    
    // For joining date: "Jul 2, 2024" format
    if (dateString.includes('T')) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    // For date of birth: "10/28/1993" format
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Personal information array with real data
  const personalInfo = [
    { 
      label: "Guard Card Number:", 
      value: guard.guard_code || "N/A",
      icon: <Shield className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Driver License Number:", 
      value: guard.driver_license || "N/A",
      icon: <FileText className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Issuing Source:", 
      value: guard.issuing_source || "N/A",
      icon: <FileText className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Phone number:", 
      value: guard.phone || "N/A",
      icon: <Phone className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Email:", 
      value: guard.email || "N/A",
      icon: <Mail className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Gender:", 
      value: guard.gender ? guard.gender.charAt(0).toUpperCase() + guard.gender.slice(1) : "N/A",
      icon: null
    },
    { 
      label: "Date of Birth:", 
      value: guard.date_of_birth ? formatDate(guard.date_of_birth) : "N/A",
      icon: <Calendar className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Language:", 
      value: guard.profile_data?.languages ? guard.profile_data.languages.join(", ") : "N/A",
      icon: null
    },
  ]

  // Employment information array with real data
  const employmentInfo = [
    { 
      label: "Join Date:", 
      value: guard.joining_date ? formatDate(guard.joining_date) : "N/A",
      icon: null
    },
    
    { 
      label: "Height:", 
      value: guard.profile_data?.height || "N/A",
      icon: null
    },
    { 
      label: "Weight:", 
      value: guard.profile_data?.weight || "N/A",
      icon: null
    },
    { 
      label: "Guard Type:", 
      value: guard.guard_type?.name || "Unarmed",
      icon: null
    },
    { 
      label: "Country:", 
      value: guard.country || "N/A",
      icon: <MapPin className="h-4 w-4 text-gray-500" />
    },
    
    { 
      label: "City:", 
      value: guard.city || "N/A",
      icon: <MapPin className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Address:", 
      value: guard.address || "N/A",
      icon: <MapPin className="h-4 w-4 text-gray-500" />
    },
    { 
      label: "Zip Code:", 
      value: guard.zip_code || "N/A",
      icon: null
    },
    { 
      label: "Notes:", 
      value: guard.profile_data?.notes || "No notes available",
      icon: null
    },
  ]

  const handleShowAlert = () => {
    showAlert(`Alert successfully sent to ${guard.full_name}`, "error")
  }

  const handleSendMessage = () => {
    setShowMessageForm(true)
  }

  const handleCancelMessage = () => {
    setShowMessageForm(false)
  }

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Left Card - Personal Info - EXACTLY matching first design */}
      <Card className="col-span-12 md:col-span-5 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        <div className="space-y-3 text-sm">
          {personalInfo.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-0.5">
              <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                {item.icon && <span className="w-5">{item.icon}</span>}
                {item.label}
              </span>
              <span className="font-medium text-gray-800 dark:text-white text-right max-w-[60%]">
                {item.value}
              </span>
            </div>
          ))}

          {/* Document Download */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-600 dark:text-gray-300">Document:</span>
            <button className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 hover:underline text-sm">
              Download <Download size={14} />
            </button>
          </div>
        </div>

        {/* Delay Alert */}
        <div className="flex items-center gap-2 mt-5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded-md">
          <AlertCircle className="text-yellow-500" size={16} />
          <span>Delay in sending the report (approximately 2 hours)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4 w-full gap-2">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-1 text-xs h-9"
            onClick={handleSendMessage}
          >
            Send a message
          </Button>
          <Button
            onClick={handleShowAlert}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex-1 text-xs h-9"
          >
            Send alert
          </Button>
        </div>
      </Card>

      {/* Right Card Section - EXACTLY matching first design */}
      <Card className="col-span-12 md:col-span-7 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        {!showMessageForm ? (
          <div className="text-sm">
            {employmentInfo.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-start py-2">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1 min-w-[120px]">
                    {item.icon && <span className="w-5">{item.icon}</span>}
                    {item.label}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white text-right flex-1 max-w-[70%]">
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
          <></>
          // <MessageForm onCancel={handleCancelMessage} guard={guard} />
        )}
      </Card>
    </div>
  )
}

export default PersonalInformation