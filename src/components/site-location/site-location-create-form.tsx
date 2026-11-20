'use client'

import { ReactNode, useEffect, useState } from 'react'
import Image from 'next/image'
import { Crosshair } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { createSiteLocation } from '@/store/slices/siteLocationSlice'
import { SiteLocation } from '@/app/types/siteLocation.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import SweetAlertService from '@/lib/sweetAlert'
import { DialogActionFooter } from '@/components/shared/dialog-action-footer'
import { FloatingLabelTextarea } from '@/components/ui/floating-textarea'

const schema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(200),
  description: z.string().max(500).optional().nullable(),
  latitude: z.number().refine((v) => !Number.isNaN(v), { message: 'Latitude is required' }),
  longitude: z.number().refine((v) => !Number.isNaN(v), { message: 'Longitude is required' }),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface SiteLocationCreateFormProps {
  trigger: ReactNode
  siteId: number
  siteName?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (location: SiteLocation) => void
}

export function SiteLocationCreateForm({
  trigger,
  siteId,
  siteName,
  isOpen,
  onOpenChange,
  onSuccess,
}: SiteLocationCreateFormProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
      is_active: true,
    },
    mode: 'onBlur',
  })

  const formValues = watch()

  useEffect(() => {
    if (!isOpen) {
      reset({
        title: '',
        description: '',
        latitude: undefined as unknown as number,
        longitude: undefined as unknown as number,
        is_active: true,
      })
    }
  }, [isOpen, reset])

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      SweetAlertService.error('Unavailable', 'Geolocation is not supported by this browser.')
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', Number(pos.coords.latitude.toFixed(6)), { shouldValidate: true })
        setValue('longitude', Number(pos.coords.longitude.toFixed(6)), { shouldValidate: true })
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        SweetAlertService.error('Location Error', 'Could not get your current location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!siteId) {
      SweetAlertService.error('Site Required', 'Select a site before creating a location.')
      return
    }
    setIsLoading(true)
    try {
      const result = await dispatch(
        createSiteLocation({
          site_id: siteId,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          latitude: data.latitude,
          longitude: data.longitude,
          is_active: data.is_active,
        })
      )

      if (createSiteLocation.fulfilled.match(result)) {
        SweetAlertService.success(
          'Location Created',
          `${data.title} has been created successfully.`
        ).then(() => {
          reset()
          onSuccess?.(result.payload as SiteLocation)
          onOpenChange?.(false)
        })
      } else {
        throw result.payload
      }
    } catch (error: unknown) {
      const message =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : 'Failed to create location.'
      SweetAlertService.error('Creation Failed', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] w-[90vw] max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4 pb-2 border-b">
          <Image src="/images/logo.png" alt="" width={24} height={24} />
          <span>Add Site Location</span>
        </div>
        {siteName && (
          <p className="text-sm text-muted-foreground mb-4">
            Site: <span className="font-medium text-foreground">{siteName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="loc-title"
              {...register('title')}
              placeholder="e.g. Main Gate"
              disabled={isLoading}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <FloatingLabelTextarea
            label="Description (Optional)"
            rows={2}
            {...register('description')}
            disabled={isLoading}
            className="resize-none"
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentLocation}
              disabled={isLoading || geoLoading}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              {geoLoading ? 'Locating…' : 'Use current location'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="loc-lat">
                Latitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="loc-lat"
                type="number"
                step="any"
                value={formValues.latitude ?? ''}
                onChange={(e) =>
                  setValue('latitude', e.target.value === '' ? (undefined as unknown as number) : Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
                placeholder="40.7128"
                disabled={isLoading}
                className={errors.latitude ? 'border-red-500' : ''}
              />
              {errors.latitude && (
                <p className="text-sm text-red-500">{errors.latitude.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-lng">
                Longitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="loc-lng"
                type="number"
                step="any"
                value={formValues.longitude ?? ''}
                onChange={(e) =>
                  setValue('longitude', e.target.value === '' ? (undefined as unknown as number) : Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
                placeholder="-74.0060"
                disabled={isLoading}
                className={errors.longitude ? 'border-red-500' : ''}
              />
              {errors.longitude && (
                <p className="text-sm text-red-500">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="loc-active"
              checked={formValues.is_active}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="loc-active" className="cursor-pointer">
              Active location
            </Label>
          </div>

          <DialogActionFooter
            cancelText="Cancel"
            submitText="Create Location"
            isSubmitting={isLoading}
            submitColor="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
