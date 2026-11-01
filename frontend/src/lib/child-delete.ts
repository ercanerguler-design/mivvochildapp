import { db } from "@/lib/db";
import { forgetDevice } from "@/lib/device-status";
import { deleteSosForChildren } from "@/lib/sos";

/**
 * Permanently deletes a child profile and everything recorded for it. Alerts, messages and
 * contacts go with the profile (database cascade); device status and help calls live in their
 * own tables and are removed here. The child's device token stops working because the profile
 * no longer exists, so the phone asks to be paired again.
 */
export async function deleteChildCompletely(childId: string) {
  await forgetDevice(childId).catch(() => undefined);
  await deleteSosForChildren([childId]).catch(() => undefined);
  await db.childProfile.delete({ where: { id: childId } });
}
