import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { bedrockAIService } from "@/services/backend/ai/bedrock.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId });
  const data = await req.json();
  const { items } = data;
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("An array of items is required.");
  }

  const itemsForAI = items.map(item => ({
    item_id: item.id || item._id || item.item_id,
    name: item.name
  }));

  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < itemsForAI.length; i += chunkSize) {
    chunks.push(itemsForAI.slice(i, i + chunkSize));
  }

  let allGeneratedItems = [];
  for (const chunk of chunks) {
    const generatedChunk = await bedrockAIService.generateMenuDescriptions(chunk);
    const mappedChunk = generatedChunk.map(g => ({
      id: g.item_id,
      description: g.description
    }));
    
    allGeneratedItems.push(...mappedChunk);
  }

  if (allGeneratedItems.length === 0) {
    throw new BadRequestError("Failed to generate descriptions for the provided items.");
  }

  const result = await MenuService.bulkUpdateDescriptions(restaurantId, allGeneratedItems);

  return successResponse(
    {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      generatedCount: allGeneratedItems.length
    },
    "Successfully generated and updated descriptions in bulk"
  );
});
