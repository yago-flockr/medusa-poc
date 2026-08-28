import { InfoList } from "@/components/display/info-list"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <InfoList.Root className="text-sm" data-testid="account-email-editor">
      <InfoList.Row>
        <InfoList.Label className="uppercase">Email</InfoList.Label>
        <InfoList.Text data-testid="current-info">
          {customer.email}
        </InfoList.Text>
      </InfoList.Row>
    </InfoList.Root>
  )
}

export default ProfileEmail
