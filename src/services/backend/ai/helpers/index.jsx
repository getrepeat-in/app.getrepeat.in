export function safeParseModelJson(text) {
    try {
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
}