import { GoogleAuth } from "google-auth-library";

function getAuth() {
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  return new GoogleAuth({
    projectId,
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
}

export async function sendFcmToTokens(args: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const auth = getAuth();
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const results = await Promise.allSettled(
    args.tokens.map(async (token) => {
      const payload = {
        message: {
          token,
          notification: { title: args.title, body: args.body },
          data: args.data || {},
          webpush: { fcm_options: { link: args.data?.url || "/chat" } },
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`FCM ${res.status}: ${text}`);
      return text;
    })
  );

  return results;
}
