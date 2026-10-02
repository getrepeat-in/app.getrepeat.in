import { withErrorHandler, successResponse, ValidationError } from "@/lib/api/response-handler";
import { AuthService } from "@/services/backend/auth.service"; 
import { validateRequiredFields } from "@/lib/api/helpers/validator";

const POST_GUEST_LOGIN_REQUIRED_FIELDS = ["name", "phone"];

export const POST = withErrorHandler(async (req, { params }) => {
    const body = await req.json();
    const { name, phone } = body;
    
    const { isValid, message } = validateRequiredFields(body, POST_GUEST_LOGIN_REQUIRED_FIELDS);
    if (!isValid) {
        throw new ValidationError(message);
    }
    
    const { slug } = await params;
    const userResponse = await AuthService.guestLogin(slug, { name, phone });
    return successResponse(userResponse, "Guest login successful", 200);
});
