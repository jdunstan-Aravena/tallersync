import LoginForm from "./LoginForm"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getCallbackUrl(value: string | string[] | undefined) {
  if (typeof value === "string" && value.length > 0) {
    return value
  }

  if (Array.isArray(value) && value[0]) {
    return value[0]
  }

  return "/"
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const callbackUrl = getCallbackUrl(resolvedSearchParams.callbackUrl)
  const registered = resolvedSearchParams.registered === "1"

  return <LoginForm callbackUrl={callbackUrl} registered={registered} />
}
