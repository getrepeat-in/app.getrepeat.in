import { withErrorHandler, successResponse, ValidationError } from "@/lib/api/response-handler";
import { AuthService } from "@/services/backend/auth.service"; 
import { validateRequiredFields } from "@/lib/api/helpers/validator";

const POST_REGISTER_REQUIRED_FIELDS = ["name", "phone", "password"];

export const POST = withErrorHandler(async (req, { params }) => {
    const body = await req.json();
    const { name, phone, password } = body;
    
    const { isValid, message } = validateRequiredFields(body, POST_REGISTER_REQUIRED_FIELDS);
    if (!isValid) {
        throw new ValidationError(message);
    }
    
    const { slug } = await params;
    const userResponse = await AuthService.register(slug, { name, phone, password });
    return successResponse(userResponse, "User registered successfully", 201);
});