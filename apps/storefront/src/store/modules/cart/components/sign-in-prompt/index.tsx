import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { Button } from "@/components/ui/button"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between bg-background">
      <div>
        <h2 className="text-xl font-medium">Already have an account?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in for a better experience.
        </p>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            className="h-10"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
