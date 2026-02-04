'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { CalendarIcon, Loader2, Plus, PlusIcon, Search, UploadCloud } from "lucide-react"
import { DialogActionFooter } from "../shared/dialog-action-footer"
import { FloatingLabelTextarea } from "../ui/floating-textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calender"
import SiteAddForm from "../shared/site-add-form"
import { Checkbox } from "../ui/checkbox"
import { createContact } from '@/store/slices/contactSlice'
import SweetAlertService from '@/lib/sweetAlert'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover as ComboboxPopover,
    PopoverContent as ComboboxPopoverContent,
    PopoverTrigger as ComboboxPopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { Guard } from '@/app/types/guard'
import { fetchGuards } from '@/store/slices/guardSlice'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { Contact } from '@/app/types/contact'

interface ContactCreateDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    refreshData?: () => void
    contactableType?: 'guard' | 'client' | 'site'
    contactableId?: number
}

interface ContactFormData {
    contactable_type: 'guard' | 'client' | 'site'
    contactable_id: number
    name: string
    phone: string
    email: string
    is_active: boolean
}

export function ContactCreateForm({ 
    trigger, 
    isOpen, 
    onOpenChange, 
    refreshData,
    contactableType = 'guard',
    contactableId 
}: ContactCreateDialogProps) {
    const dispatch = useAppDispatch()
    
    // Form state
    const [formData, setFormData] = useState<ContactFormData>({
        contactable_type: contactableType,
        contactable_id: contactableId || 0,
        name: '',
        phone: '',
        email: '',
        is_active: true,
    })
    
    // Loading state
    const [isLoading, setIsLoading] = useState(false)
    
    // Guard combobox state
    const [guardSearch, setGuardSearch] = useState('')
    const [isGuardOpen, setIsGuardOpen] = useState(false)
    const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null)
    
    // Get guards for combobox
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)

    useEffect(() => {
        // Fetch guards when combobox opens
        if (isGuardOpen && contactableType === 'guard') {
            const params = {
                per_page: 50,
                search: guardSearch,
                is_active: true
            }
            dispatch(fetchGuards(params))
        }
    }, [dispatch, isGuardOpen, guardSearch, contactableType])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }))
    }

    const handleGuardSelect = (guard: Guard) => {
        setSelectedGuard(guard)
        setFormData(prev => ({
            ...prev,
            contactable_id: guard.id
        }))
        setIsGuardOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.name || !formData.phone) {
            SweetAlertService.error(
                'Validation Error',
                'Please fill in all required fields (Name and Phone are required).'
            )
            return
        }

        if (contactableType === 'guard' && !formData.contactable_id) {
            SweetAlertService.error(
                'Validation Error',
                'Please select a guard for this contact.'
            )
            return
        }

        setIsLoading(true)

        try {
            // Create contact data according to your API structure
            const contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'> = {
            contactable_type: formData.contactable_type,
            contactable_id: formData.contactable_id,
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            is_active: formData.is_active,
        }

            

            await dispatch(createContact(contactData)).unwrap()

            SweetAlertService.success(
                'Contact Created',
                `${formData.name} has been created successfully.`,
                {
                    timer: 1500,
                    showConfirmButton: false,
                }
            )

            // Reset form
            setFormData({
                contactable_type: contactableType,
                contactable_id: contactableId || 0,
                name: '',
                phone: '',
                email: '',
                is_active: true,
            })
            setSelectedGuard(null)

            // Refresh data if callback provided
            if (refreshData) {
                refreshData()
            }

            // Close dialog
            if (onOpenChange) {
                onOpenChange(false)
            }
        } catch (error) {
            SweetAlertService.error(
                'Create Failed',
                'There was an error creating the contact. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            contactable_type: contactableType,
            contactable_id: contactableId || 0,
            name: '',
            phone: '',
            email: '',
            is_active: true,
        })
        setSelectedGuard(null)
    }

     const closeDialog = () => {
        if (onOpenChange) {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[80vw] max-w-[80vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Header */}
                <DialogHeader className="hidden">
                    <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image src="/images/logo.png" alt="" width={24} height={24} />
                    <span className="whitespace-nowrap">Add New Contact</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* First Row */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        
                        {/* Contact Type - Read Only if provided from parent */}
                        <div className={contactableType ? 'col-span-2' : 'col-span-1'}>
                            <FloatingLabelSelect 
                                label="Contact Type"
                                value={formData.contactable_type}
                                onChange={(e) => handleSelectChange('contactable_type', e.target.value)}
                                disabled={!!contactableType}
                            >
                                <option value="guard">Guard</option>
                                <option value="client">Client</option>
                                <option value="site">Site</option>
                            </FloatingLabelSelect>
                        </div>

                        {/* Guard Search Combobox - Only show if contactable_type is guard */}
                        {formData.contactable_type === 'guard' && (
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Select Guard *
                                </label>
                                <ComboboxPopover open={isGuardOpen} onOpenChange={setIsGuardOpen}>
                                    <ComboboxPopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isGuardOpen}
                                            className="w-full justify-between bg-white dark:bg-gray-800"
                                        >
                                            {selectedGuard ? selectedGuard.full_name : "Select a guard..."}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </ComboboxPopoverTrigger>
                                    <ComboboxPopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput 
                                                placeholder="Search guards..." 
                                                value={guardSearch}
                                                onValueChange={setGuardSearch}
                                            />
                                            <CommandList>
                                                {guardsLoading ? (
                                                    <CommandEmpty className="py-6 text-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                        <p className="mt-2 text-sm">Loading guards...</p>
                                                    </CommandEmpty>
                                                ) : guards.length === 0 ? (
                                                    <CommandEmpty>No guards found.</CommandEmpty>
                                                ) : (
                                                    <CommandGroup>
                                                        {guards.map((guard) => (
                                                            <CommandItem
                                                                key={guard.id}
                                                                value={guard.id.toString()}
                                                                onSelect={() => handleGuardSelect(guard)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-xs font-bold">
                                                                        {guard.full_name?.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{guard.full_name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {guard.guard_code} • {guard.phone}
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </ComboboxPopoverContent>
                                </ComboboxPopover>
                                
                                {selectedGuard && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{selectedGuard.full_name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {selectedGuard.guard_code} • {selectedGuard.phone}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedGuard(null)
                                                    setFormData(prev => ({ ...prev, contactable_id: 0 }))
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        

                        {/* Contact Name */}
                        <div className="col-span-1">
                            <FloatingLabelInput 
                                label="Contact Name *"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="col-span-1">
                            <FloatingLabelInput 
                                label="Email (Optional)"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Phone */}
                        <div className="col-span-1">
                            <FloatingLabelInput 
                                label="Phone *"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="col-span-2 flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => 
                                        handleCheckboxChange('is_active', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_active">Active Contact</Label>
                            </div>

                            
                        </div>

                        

                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                        
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Contact'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}