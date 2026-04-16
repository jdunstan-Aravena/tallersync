import RegistroForm from "./RegistroForm"

type RegistroPageProps = {
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

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const resolvedSearchParams = await searchParams
  const callbackUrl = getCallbackUrl(resolvedSearchParams.callbackUrl)

  return <RegistroForm callbackUrl={callbackUrl} />
}
