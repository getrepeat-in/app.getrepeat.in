import { withErrorHandler, successResponse, ValidationError } from "@/lib/api/response-handler";
import { AuthService } from "@/services/backend/auth.service";
import { validateRequiredFields } from "@/lib/api/helpers/validator";

const POST_LOGIN_REQUIRED_FIELDS = ["phone", "password"];

export const POST = withErrorHandler(async (req, { params }) => {
    const body = await req.json();
    const { phone, password } = body;
    
    const { isValid, message } = validateRequiredFields(body, POST_LOGIN_REQUIRED_FIELDS);
    if (!isValid) {
        throw new ValidationError(message);
    }
    
    const { slug } = await params;
    
    const userResponse = await AuthService.login(slug, { phone, password });
    return successResponse(userResponse, "User logged in successfully", 200);
});
