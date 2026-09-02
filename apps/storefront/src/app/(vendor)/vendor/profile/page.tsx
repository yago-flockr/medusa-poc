"use client"

import { DataState } from "@/components/display/data-state"
import { InfoList } from "@/components/display/info-list"
import { VendorSection } from "@/vendor/components/section"
import { useGetMe } from "@/vendor/hooks/queries/vendor"

export default function VendorProfilePage() {
  const getMe = useGetMe()

  return (
    <>
      <VendorSection
        title="Vendor information"
        description="View your vendor information"
      >
        <DataState isLoading={getMe.isLoading || !getMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <InfoList.Root>
              <InfoList.Row>
                <InfoList.Label>Vendor name</InfoList.Label>
                <InfoList.Text>{getMe.data?.vendor.name ?? ""}</InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Handle</InfoList.Label>
                <InfoList.Text>{getMe.data?.vendor.handle ?? ""}</InfoList.Text>
              </InfoList.Row>
            </InfoList.Root>
          </DataState.Content>
        </DataState>
      </VendorSection>
      <VendorSection
        title="User information"
        description={
          getMe.data?.vendor_user
            ? `Signed in as ${getMe.data?.vendor_user.email}`
            : undefined
        }
      >
        <DataState isLoading={getMe.isLoading || !getMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <InfoList.Root>
              <InfoList.Row>
                <InfoList.Label>First name</InfoList.Label>
                <InfoList.Text>
                  {getMe.data?.vendor_user.first_name ?? ""}
                </InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Last name</InfoList.Label>
                <InfoList.Text>
                  {getMe.data?.vendor_user.last_name ?? ""}
                </InfoList.Text>
              </InfoList.Row>
            </InfoList.Root>
          </DataState.Content>
        </DataState>
      </VendorSection>
    </>
  )
}
