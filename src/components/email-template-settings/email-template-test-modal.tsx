// components/email-template/email-template-test-modal.tsx
'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { EmailTemplate } from "@/app/types/email-template"
import { useState, useEffect } from "react"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { sendTestEmail } from "@/store/slices/emailTemplateSlice"
import SweetAlertService from "@/lib/sweetAlert"
import { Loader2, Send, Mail, X, Plus, Trash2 } from "lucide-react"

interface EmailTemplateTestModalProps {
    isOpen: boolean
    onClose: () => void
    template: EmailTemplate | null
}

interface VariableValue {
    key: string
    value: string
}

export function EmailTemplateTestModal({ isOpen, onClose, template }: EmailTemplateTestModalProps) {
    const dispatch = useAppDispatch()
    const [isSending, setIsSending] = useState(false)
    const [testEmail, setTestEmail] = useState("")
    const [variableValues, setVariableValues] = useState<VariableValue[]>([])
    const [emailError, setEmailError] = useState("")

    useEffect(() => {
        if (isOpen && template) {
            // Initialize variable values from template variables
            const initialVariables = (template.variables || []).map(variable => ({
                key: variable,
                value: `[Test ${variable}]`
            }))
            setVariableValues(initialVariables)
            setTestEmail("")
            setEmailError("")
        }
    }, [isOpen, template])

    const handleVariableChange = (index: number, value: string) => {
        const updated = [...variableValues]
        updated[index].value = value
        setVariableValues(updated)
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            setEmailError("Email is required")
            return false
        }
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address")
            return false
        }
        setEmailError("")
        return true
    }

    const handleSubmit = async () => {
        if (!validateEmail(testEmail)) return
        if (!template) return

        setIsSending(true)
        try {
            // Prepare variables object
            const variables: Record<string, string> = {}
            variableValues.forEach(v => {
                variables[v.key] = v.value
            })

            // Add common variables if not present
            if (!variables.app_name) variables.app_name = "1Guard Security"
            if (!variables.app_url) variables.app_url = window.location.origin

            const result = await dispatch(sendTestEmail({
                id: template.id,
                data: {
                    test_email: testEmail,
                    variables: variables
                }
            }))

            if (sendTestEmail.fulfilled.match(result)) {
                SweetAlertService.success(
                    'Test Email Sent',
                    `Test email has been sent to ${testEmail}`,
                    { timer: 2000, showConfirmButton: false }
                )
                onClose()
            } else {
                throw result.payload
            }
        } catch (error) {
            SweetAlertService.error(
                'Failed to Send',
                error instanceof Error ? error.message : 'Unable to send test email. Please try again.'
            )
        } finally {
            setIsSending(false)
        }
    }

    if (!template) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[90vw] max-w-[90vw] dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-[#5F0015]" />
                        Send Test Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Template Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{template.name}</p>
                        <code className="text-xs text-gray-500">{template.code}</code>
                    </div>

                    {/* Test Email */}
                    <div className="space-y-2">
                        <Label htmlFor="test-email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Test Email Address *
                        </Label>
                        <Input
                            id="test-email"
                            type="email"
                            placeholder="Enter email address to send test"
                            value={testEmail}
                            onChange={(e) => {
                                setTestEmail(e.target.value)
                                if (emailError) validateEmail(e.target.value)
                            }}
                            className={emailError ? "border-red-500" : ""}
                        />
                        {emailError && (
                            <p className="text-xs text-red-500">{emailError}</p>
                        )}
                    </div>

                    {/* Variables */}
                    {variableValues.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Variable Values (Optional)
                            </Label>
                            <p className="text-xs text-gray-500">
                                Customize the variable values for this test email. Leave as default for sample values.
                            </p>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {variableValues.map((variable, index) => (
                                    <div key={variable.key} className="space-y-1">
                                        <Label className="text-xs font-mono text-gray-600">
                                            {`{{${variable.key}}}`}
                                        </Label>
                                        <Input
                                            value={variable.value}
                                            onChange={(e) => handleVariableChange(index, e.target.value)}
                                            placeholder={`Value for ${variable.key}`}
                                            className="text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Common Variables Hint */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            <strong>Note:</strong> Common variables like {'{{app_name}}'} and {'{{app_url}}'} are automatically added.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSending} className="bg-[#5F0015] hover:bg-[#5F0015]/90">
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Test Email
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}