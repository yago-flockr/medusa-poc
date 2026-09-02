"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataState } from "@/components/display/data-state"
import { InfoList } from "@/components/display/info-list"
import { VendorSection } from "@/vendor/components/section"
import {
  ProfileForm,
  profileFormToInput,
  profileInputToForm,
} from "@/vendor/forms/profile-form"
import { useGetVendorsMe } from "@/vendor/hooks/queries/vendor"
import { usePatchVendorsMe } from "@/vendor/hooks/mutations/profile"

export default function VendorProfilePage() {
  const getVendorsMe = useGetVendorsMe()
  const patchVendorsMe = usePatchVendorsMe()

  return (
    <>
      <VendorSection
        title="Vendor information"
        description="View your vendor information"
      >
        <DataState isLoading={getVendorsMe.isLoading || !getVendorsMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <InfoList.Root>
              <InfoList.Row>
                <InfoList.Label>Vendor name</InfoList.Label>
                <InfoList.Text>{getVendorsMe.data?.vendor.name ?? ""}</InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Handle</InfoList.Label>
                <InfoList.Text>{getVendorsMe.data?.vendor.handle ?? ""}</InfoList.Text>
              </InfoList.Row>
            </InfoList.Root>
          </DataState.Content>
        </DataState>
      </VendorSection>
      <VendorSection
        title="User information"
        description={
          getVendorsMe.data?.vendor_user
            ? `Signed in as ${getVendorsMe.data?.vendor_user.email}`
            : undefined
        }
      >
        <DataState isLoading={getVendorsMe.isLoading || !getVendorsMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <ProfileForm
              defaultValues={profileInputToForm({
                first_name: getVendorsMe.data?.vendor_user.first_name ?? null,
                last_name: getVendorsMe.data?.vendor_user.last_name ?? null,
              })}
              isLoading={patchVendorsMe.isPending}
              onSubmit={(values) =>
                patchVendorsMe.mutate(profileFormToInput(values))
              }
            />
            {patchVendorsMe.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>
                  {patchVendorsMe.error.message}
                </AlertDescription>
              </Alert>
            )}
          </DataState.Content>
        </DataState>
      </VendorSection>
    </>
  )
}
