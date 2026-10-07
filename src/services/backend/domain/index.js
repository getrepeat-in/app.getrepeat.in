import axios from 'axios';

const VERCEL_API_URL = 'https://api.vercel.com/v9/projects';

export class DomainService {
  static async addDomainToVercel(domain) {
    const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    const TEAM_ID = process.env.VERCEL_TEAM_ID;
    const AUTH_HEADER = { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` };

    if (!PROJECT_ID || !process.env.VERCEL_ACCESS_TOKEN) {
      console.warn("Vercel credentials missing. Skipping Vercel domain provision in dev.");
      return { success: true, fake: true };
    }

    try {
      const response = await axios.post(
        `${VERCEL_API_URL}/${PROJECT_ID}/domains`,
        { name: domain },
        {
          params: TEAM_ID ? { teamId: TEAM_ID } : {},
          headers: AUTH_HEADER,
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      throw new Error(`Failed to add domain to Vercel: ${errorMessage}`);
    }
  }

  static async removeDomainFromVercel(domain) {
    const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    const TEAM_ID = process.env.VERCEL_TEAM_ID;
    const AUTH_HEADER = { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` };

    if (!PROJECT_ID || !process.env.VERCEL_ACCESS_TOKEN) {
      return { success: true };
    }

    try {
      const response = await axios.delete(
        `${VERCEL_API_URL}/${PROJECT_ID}/domains/${domain}`,
        {
          params: TEAM_ID ? { teamId: TEAM_ID } : {},
          headers: AUTH_HEADER,
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      throw new Error(`Failed to remove domain from Vercel: ${errorMessage}`);
    }
  }

  static async verifyDomain(domain) {
    const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    const TEAM_ID = process.env.VERCEL_TEAM_ID;
    const AUTH_HEADER = { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` };

    if (!PROJECT_ID || !process.env.VERCEL_ACCESS_TOKEN) {
      return { success: true, verified: true, fake: true }; // Assume true in dev without credentials
    }

    try {
      // Vercel verify endpoint
      const response = await axios.post(
        `${VERCEL_API_URL}/${PROJECT_ID}/domains/${domain}/verify`,
        {},
        {
          params: TEAM_ID ? { teamId: TEAM_ID } : {},
          headers: AUTH_HEADER,
        }
      );
      
      // Response contains verified boolean
      return {
        success: true,
        verified: response.data.verified,
        status: response.data
      };
    } catch (error) {
      // Sometimes it returns 400 if it can't verify yet, we can check domain info
      try {
        const getResponse = await axios.get(
          `${VERCEL_API_URL}/${PROJECT_ID}/domains/${domain}`,
          {
            params: TEAM_ID ? { teamId: TEAM_ID } : {},
            headers: AUTH_HEADER,
          }
        );
        return {
          success: true,
          verified: getResponse.data.verified,
          status: getResponse.data
        };
      } catch (innerError) {
        const errorMessage = innerError.response?.data?.error?.message || innerError.message || 'Unknown error';
        throw new Error(`Failed to verify domain with Vercel: ${errorMessage}`);
      }
    }
  }
}