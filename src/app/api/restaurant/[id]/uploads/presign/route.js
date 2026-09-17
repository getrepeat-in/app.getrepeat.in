import dbConnect from "@/lib/db";
import ImageAsset from "@/models/Image";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { getPresignedUploadUrl } from "@/services/backend/s3";
import { ALLOWED_TYPES, ALLOWED_FOLDERS } from "@/services/backend/s3/helpers/constants";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError 
} from "@/lib/api/response-handler";

export const POST = withErrorHandler(async (request, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId });
  await dbConnect();

  const body = await request.json();
  const { filename, contentType, path = "general", sizeBytes = 0, width = 800, height = 600 } = body;

  if (!filename || !contentType) {
    throw new BadRequestError("filename and contentType are required");
  }

  const extension = ALLOWED_TYPES[contentType];
  if (!extension) {
    throw new BadRequestError("Unsupported image type. Allowed types: " + Object.keys(ALLOWED_TYPES).join(", "));
  }

  const targetFolder = String(path).trim();
  if (!ALLOWED_FOLDERS.includes(targetFolder)) {
    throw new BadRequestError("Invalid upload folder. Allowed folders: " + ALLOWED_FOLDERS.join(", "));
  }

  const { uploadUrl, key, cleanFilename } = await getPresignedUploadUrl({
    restaurantId,
    targetFolder,
    filename,
    contentType,
  });

  const imageAsset = await ImageAsset.create({
    restaurant: restaurantId,
    original: {
      key,
      filename: cleanFilename,
      mimeType: contentType,
      width,
      height,
      sizeBytes,
    },
    status: "PENDING",
  });

  return successResponse(
    {
      imageId: imageAsset._id,
      key,
      uploadUrl,
      contentType,
    },
    "Presigned URL generated successfully"
  );
});