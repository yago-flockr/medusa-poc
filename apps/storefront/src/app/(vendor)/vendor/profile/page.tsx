"use client"

import { DataState } from "@/components/display/data-state"
import { InfoList } from "@/components/display/info-list"
import { VendorSection } from "@/vendor/components/section"
import { ProfileForm } from "@/vendor/forms/profile-form"
import { useUpdateProfile } from "@/vendor/hooks/mutations/profile"
import { useGetMe } from "@/vendor/hooks/queries/vendor"
import type { UpdateVendorProfileInput } from "@dtc/api-contracts/vendor/profile"

export default function VendorProfilePage() {
  const getMe = useGetMe()
  const updateProfile = useUpdateProfile()
  const vendor = getMe.data?.vendor
  const vendorUser = getMe.data?.vendor_user
  const isLoading = getMe.isLoading || !getMe.data

  const handleSaveProfile = (values: UpdateVendorProfileInput) => {
    updateProfile.mutate(values, { onSuccess: () => getMe.refetch() })
  }

  return (
    <>
      <VendorSection
        title="Vendor information"
        description="View your vendor information"
      >
        <DataState isLoading={isLoading}>
          <DataState.Loading />
          <DataState.Content>
            <InfoList.Root>
              <InfoList.Row>
                <InfoList.Label>Vendor name</InfoList.Label>
                <InfoList.Text>{vendor?.name ?? ""}</InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Handle</InfoList.Label>
                <InfoList.Text>{vendor?.handle ?? ""}</InfoList.Text>
              </InfoList.Row>
            </InfoList.Root>
          </DataState.Content>
        </DataState>
      </VendorSection>
      <VendorSection
        title="User information"
        description={vendorUser ? `Signed in as ${vendorUser.email}` : undefined}
      >
        <DataState isLoading={isLoading}>
          <DataState.Loading />
          <DataState.Content>
            <ProfileForm
              defaultValues={{
                first_name: vendorUser?.first_name ?? "",
                last_name: vendorUser?.last_name ?? "",
              }}
              isLoading={updateProfile.isPending}
              error={updateProfile.error?.message}
              onSubmit={handleSaveProfile}
            />
          </DataState.Content>
        </DataState>
      </VendorSection>
    </>
  )
}
