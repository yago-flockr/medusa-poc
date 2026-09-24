"use client"

import { DataState } from "@/components/display/data-state"
import { InfoList } from "@/components/display/info-list"
import { Section } from "@/components/display/section"
import {
  ProfileForm,
  profileFormToInput,
  profileInputToForm,
} from "@/affiliate/forms/profile-form"
import { useGetAffiliatesMe } from "@/affiliate/hooks/queries/me"
import { usePatchAffiliatesMe } from "@/affiliate/hooks/mutations/profile"
import { toast } from "sonner"

export default function AffiliateProfilePage() {
  const getAffiliatesMe = useGetAffiliatesMe()
  const patchAffiliatesMe = usePatchAffiliatesMe()

  const affiliate = getAffiliatesMe.data?.affiliate

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Affiliate information"
        description="Staff set your referral code and commission rate."
      >
        <DataState isLoading={getAffiliatesMe.isLoading || !affiliate}>
          <DataState.Loading />
          <DataState.Content>
            <InfoList.Root>
              <InfoList.Row>
                <InfoList.Label>Referral code</InfoList.Label>
                <InfoList.Text>{affiliate?.handle ?? ""}</InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Email</InfoList.Label>
                <InfoList.Text>{affiliate?.email ?? ""}</InfoList.Text>
              </InfoList.Row>
              <InfoList.Row>
                <InfoList.Label>Commission rate</InfoList.Label>
                <InfoList.Text>
                  {affiliate
                    ? `${(affiliate.commission_rate * 100).toFixed(0)}%`
                    : ""}
                </InfoList.Text>
              </InfoList.Row>
            </InfoList.Root>
          </DataState.Content>
        </DataState>
      </Section>

      <Section
        title="Your details"
        description="Update the name we show you by."
      >
        <DataState isLoading={getAffiliatesMe.isLoading || !affiliate}>
          <DataState.Loading />
          <DataState.Content>
            {affiliate && (
              <ProfileForm
                defaultValues={profileInputToForm(affiliate)}
                isLoading={patchAffiliatesMe.isPending}
                onSubmit={(values) =>
                  patchAffiliatesMe.mutate(profileFormToInput(values), {
                    onSuccess: () => toast.success("Profile updated"),
                  })
                }
              />
            )}
          </DataState.Content>
        </DataState>
      </Section>
    </div>
  )
}
