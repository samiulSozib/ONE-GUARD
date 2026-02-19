'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ReactNode } from 'react'
import Image from "next/image"
import { FloatingLabelInput } from "../ui/floating-input"
import { FloatingLabelSelect } from "../ui/floating-select"
import { Loader2, Search } from "lucide-react"
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
import { Guard } from '@/app/types/guard'
import { Client } from '@/app/types/client'
import { Site } from '@/app/types/site'
import { fetchGuards } from '@/store/slices/guardSlice'
import { fetchClients } from '@/store/slices/clientSlice'
import { fetchSites } from '@/store/slices/siteSlice'
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

// Define types for each contactable entity
type ContactableEntity = Guard | Client | Site;

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
    
    // Search and selection state
    const [searchTerm, setSearchTerm] = useState('')
    const [isEntityOpen, setIsEntityOpen] = useState(false)
    const [selectedEntity, setSelectedEntity] = useState<ContactableEntity | null>(null)
    
    // Get data from Redux store based on contactable type
    const { guards, isLoading: guardsLoading } = useAppSelector((state) => state.guard)
    const { clients, isLoading: clientsLoading } = useAppSelector((state) => state.client)
    const { sites, isLoading: sitesLoading } = useAppSelector((state) => state.site)

    // Update form data when props change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            contactable_type: contactableType,
            contactable_id: contactableId || 0
        }))
    }, [contactableType, contactableId])

    // Fetch entities when combobox opens based on type
    useEffect(() => {
        if (isEntityOpen) {
            const params = {
                per_page: 50,
                search: searchTerm,
                is_active: true
            }
            
            switch (formData.contactable_type) {
                case 'guard':
                    dispatch(fetchGuards(params))
                    break
                case 'client':
                    dispatch(fetchClients(params))
                    break
                case 'site':
                    dispatch(fetchSites(params))
                    break
            }
        }
    }, [dispatch, isEntityOpen, searchTerm, formData.contactable_type])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // FIXED: Handle select change with event object
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            contactable_id: 0 // Reset contactable_id when type changes
        }))
        // Reset selected entity when type changes
        setSelectedEntity(null)
    }

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }))
    }

    const handleEntitySelect = (entity: ContactableEntity) => {
        setSelectedEntity(entity)
        setFormData(prev => ({
            ...prev,
            contactable_id: entity.id
        }))
        setIsEntityOpen(false)
    }

    // Get the current list of entities based on type
    const getCurrentEntities = (): ContactableEntity[] => {
        switch (formData.contactable_type) {
            case 'guard':
                return guards
            case 'client':
                return clients
            case 'site':
                return sites
            default:
                return []
        }
    }

    // Get loading state based on type
    const getIsLoading = (): boolean => {
        switch (formData.contactable_type) {
            case 'guard':
                return guardsLoading
            case 'client':
                return clientsLoading
            case 'site':
                return sitesLoading
            default:
                return false
        }
    }

    // Get display name for entity
    const getEntityDisplayName = (entity: ContactableEntity): string => {
        switch (formData.contactable_type) {
            case 'guard':
                return (entity as Guard).full_name || ''
            case 'client':
                return (entity as Client).full_name || (entity as Client).full_name || ''
            case 'site':
                return (entity as Site).site_name || (entity as Site).site_name || ''
            default:
                return ''
        }
    }

    // Get secondary info for entity (code, phone, etc)
    const getEntitySecondaryInfo = (entity: ContactableEntity): string => {
        switch (formData.contactable_type) {
            case 'guard':
                const guard = entity as Guard
                return `${guard.guard_code || ''} ${guard.phone ? '• ' + guard.phone : ''}`.trim()
            case 'client':
                const client = entity as Client
                return client.phone || client.email || ''
            case 'site':
                const site = entity as Site
                return site.site_name 
            default:
                return ''
        }
    }

    // Get entity initial for avatar
    const getEntityInitial = (entity: ContactableEntity): string => {
        const name = getEntityDisplayName(entity)
        return name.charAt(0).toUpperCase()
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

        if (!formData.contactable_id) {
            SweetAlertService.error(
                'Validation Error',
                `Please select a ${formData.contactable_type} for this contact.`
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
            setSelectedEntity(null)

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
        setSelectedEntity(null)
    }

    const closeDialog = () => {
        if (onOpenChange) {
            onOpenChange(false)
        }
    }

    // Get placeholder text for combobox
    const getComboboxPlaceholder = (): string => {
        return `Select a ${formData.contactable_type}...`
    }

    // Get empty message for combobox
    const getEmptyMessage = (): string => {
        const type = formData.contactable_type
        return `No ${type}s found.`
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
                        
                        {/* Contact Type - FIXED: onChange now uses event object */}
                        <div className={contactableType ? 'col-span-2' : 'col-span-1'}>
                            <FloatingLabelSelect 
                                label="Contact Type"
                                name="contactable_type"
                                value={formData.contactable_type}
                                onChange={handleSelectChange}
                            >
                                <option value="guard">Guard</option>
                                <option value="client">Client</option>
                                <option value="site">Site</option>
                            </FloatingLabelSelect>
                        </div>

                        {/* Entity Search Combobox - Dynamic based on contactable_type */}
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Select {formData.contactable_type.charAt(0).toUpperCase() + formData.contactable_type.slice(1)} *
                            </label>
                            <ComboboxPopover open={isEntityOpen} onOpenChange={setIsEntityOpen}>
                                <ComboboxPopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isEntityOpen}
                                        className="w-full justify-between bg-white dark:bg-gray-800"
                                    >
                                        {selectedEntity 
                                            ? getEntityDisplayName(selectedEntity) 
                                            : getComboboxPlaceholder()}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </ComboboxPopoverTrigger>
                                <ComboboxPopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput 
                                            placeholder={`Search ${formData.contactable_type}s...`} 
                                            value={searchTerm}
                                            onValueChange={setSearchTerm}
                                        />
                                        <CommandList>
                                            {getIsLoading() ? (
                                                <CommandEmpty className="py-6 text-center">
                                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                    <p className="mt-2 text-sm">Loading...</p>
                                                </CommandEmpty>
                                            ) : getCurrentEntities().length === 0 ? (
                                                <CommandEmpty>{getEmptyMessage()}</CommandEmpty>
                                            ) : (
                                                <CommandGroup>
                                                    {getCurrentEntities().map((entity) => (
                                                        <CommandItem
                                                            key={entity.id}
                                                            value={entity.id.toString()}
                                                            onSelect={() => handleEntitySelect(entity)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-xs font-bold">
                                                                    {getEntityInitial(entity)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {getEntityDisplayName(entity)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {getEntitySecondaryInfo(entity)}
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
                            
                            {selectedEntity && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{getEntityDisplayName(selectedEntity)}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {getEntitySecondaryInfo(selectedEntity)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedEntity(null)
                                                setFormData(prev => ({ ...prev, contactable_id: 0 }))
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

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