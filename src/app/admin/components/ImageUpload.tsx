"use client";

/**
 * Legacy ImageUpload — now wraps AdminImageUpload for checkout products.
 * Kept for backward compatibility with CheckoutPageForm.
 */

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AdminImageUpload } from "./AdminImageUpload";

interface Props {
  productId?: Id<"checkoutProducts">;
  currentImageUrl?: string;
  onUploaded?: (storageId: Id<"_storage">) => void;
}

export function ImageUpload({ productId, currentImageUrl, onUploaded }: Props) {
  const saveImage = useMutation(api.checkoutProducts.saveImage);
  const removeImage = useMutation(api.checkoutProducts.removeImage);

  return (
    <AdminImageUpload
      currentUrl={currentImageUrl}
      onUploaded={async (storageId) => {
        if (productId) await saveImage({ productId, storageId });
        onUploaded?.(storageId);
      }}
      onRemoved={productId ? async () => {
        await removeImage({ productId });
      } : undefined}
      alt="Product afbeelding"
    />
  );
}
