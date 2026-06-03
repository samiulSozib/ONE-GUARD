import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, Phone, Mail, MapPin, Calendar, Shield, FileText, File, Image, FileArchive, ExternalLink } from "lucide-react"
import React, { useState } from "react"
import { useAlert } from "@/components/contexts/AlertContext"
import MessageForm from "../message-form"
import { Guard, GuardDocument } from "@/app/types/guard"

interface PersonalInformationProps {
  guard: Guard;
}

const PersonalInformation = ({ guard }: PersonalInformationProps) => {
  const [showMessageForm, setShowMessageForm] = useState(false)
  const { showAlert } = useAlert()

  // Get all documents from both possible locations
  const getAllDocuments = (): GuardDocument[] => {
    const docs: GuardDocument[] = [];
    
    // Check guard.documents
    if (guard.documents && Array.isArray(guard.documents)) {
      docs.push(...guard.documents);
    }
    
    // Check guard.profile_data?.documents
    if (guard.profile_data?.documents && Array.isArray(guard.profile_data.documents)) {
      docs.push(...guard.profile_data.documents);
    }
    
    // Check guard.profile?.documents
    if (guard.profile?.documents && Array.isArray(guard.profile.documents)) {
      docs.push(...guard.profile.documents);
    }
    
    return docs;
  };

  const documents = getAllDocuments();

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    
    if (dateString.includes('T')) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Get document icon based on file extension
  const getDocumentIcon = (fileName?: string | null) => {
    if (!fileName) return <File className="h-4 w-4" />;
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="h-4 w-4" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Format file name for display
  const formatFileName = (fileName?: string | null) => {
    if (!fileName) return "Document";
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    return nameWithoutExt
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get document URL
  const getDocumentUrl = (doc: GuardDocument): string | null => {
    return doc.file_path || doc.url || null;
  };

  // Get document type label
  const getDocumentTypeLabel = (doc: GuardDocument): string => {
    const documentType = doc.document_type || doc.type;
    if (!documentType) return "Document";
    
    const labels: Record<string, string> = {
      'id_proof': 'ID Proof',
      'driver_license': 'Driver License',
      'certification': 'Certification',
      'training_certificate': 'Training Certificate',
      'background_check': 'Background Check',
      'medical_certificate': 'Medical Certificate',
      'uniform_receipt': 'Uniform Receipt',
      'contract': 'Contract',
      'other': 'Other Document'
    };
    return labels[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle document download
  const handleDownload = async (doc: GuardDocument) => {
    const fileUrl = getDocumentUrl(doc);
    const fileName = doc.file_name || doc.name || "document";
    
    if (!fileUrl) {
      showAlert("No file URL available", "error");
      return;
    }
    
    try {
      showAlert(`Downloading ${fileName}...`, "info");
      
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showAlert(`${fileName} downloaded successfully!`, "success");
    } catch (error) {
      console.error('Download error:', error);
      showAlert(`Failed to download ${fileName}. Please try again.`, "error");
    }
  };

  // Handle open in new tab
  const handleOpenInNewTab = (doc: GuardDocument) => {
    const fileUrl = getDocumentUrl(doc);
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      showAlert("No file URL available", "error");
    }
  };

  // Personal information array
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
  ];

  // Employment information array
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
  ];

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
      {/* Left Card - Personal Info */}
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

          {/* Documents Section - Show all documents */}
          {documents.length > 0 && (
            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">Documents ({documents.length}):</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {documents.map((doc, index) => {
                  const fileUrl = getDocumentUrl(doc);
                  return (
                    <div key={doc.id || index} className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getDocumentIcon(doc.file_name || doc.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={doc.file_name || doc.name || undefined}>
                              {formatFileName(doc.file_name || doc.name)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getDocumentTypeLabel(doc)}
                            </p>
                          </div>
                        </div>
                        {fileUrl && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenInNewTab(doc)}
                              title="Open in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                              onClick={() => handleDownload(doc)}
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

      {/* Right Card Section */}
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
        )}
      </Card>
    </div>
  )
}

export default PersonalInformation