import { getProveedores, getTecnicos } from "./actions"
import CreatePurchaseOrderFormClient from "./CreatePurchaseOrderFormClient"
import type { PurchaseSuggestionGroup } from "../dashboard-data"

type CreatePurchaseOrderFormProps = {
  group: PurchaseSuggestionGroup
}

export default async function CreatePurchaseOrderForm({ group }: CreatePurchaseOrderFormProps) {
  const [tecnicos, proveedores] = await Promise.all([getTecnicos(), getProveedores()])

  return <CreatePurchaseOrderFormClient group={group} tecnicos={tecnicos} proveedores={proveedores} />
}
