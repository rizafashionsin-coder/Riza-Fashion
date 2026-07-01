import { Buffer } from 'node:buffer';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, env);

    // Handle CORS preflight options request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Endpoint 1: Initiate Payment (v2)
      if (url.pathname === '/api/pay' && request.method === 'POST') {
        const body = await request.json();
        const { transactionId, userId, amount, phone, redirectUrl } = body;

        if (!transactionId || !userId || !amount || !redirectUrl) {
          return errorResponse("Missing required parameters: transactionId, userId, amount, redirectUrl", 400, corsHeaders);
        }

        const token = await getAccessToken(env);

        // PhonePe expects amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(amount * 100);

        // Select environment base URL
        const payUrl = env.PHONEPE_ENV === 'production'
          ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
          : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

        // Construct PhonePe v2 request body
        const payload = {
          merchantOrderId: transactionId,
          amount: amountInPaise,
          paymentFlow: {
            type: "PG_CHECKOUT",
            merchantUrls: {
              redirectUrl: redirectUrl
            }
          }
        };

        console.log(`Initiating PhonePe v2 payment for Txn ${transactionId} via ${payUrl}`);

        const response = await fetch(payUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (response.ok && resData.redirectUrl) {
          return new Response(JSON.stringify({
            success: true,
            url: resData.redirectUrl,
            message: "Payment initiated successfully"
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: resData.message || "Failed to initiate payment with PhonePe",
            raw: resData
          }), {
            status: response.status || 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Endpoint 2: Check Payment Status (v2)
      if (url.pathname.startsWith('/api/status/') && request.method === 'GET') {
        const pathParts = url.pathname.split('/');
        const transactionId = pathParts[pathParts.length - 1];

        if (!transactionId) {
          return errorResponse("Missing transactionId", 400, corsHeaders);
        }

        const token = await getAccessToken(env);

        // Select environment base URL
        const statusUrl = env.PHONEPE_ENV === 'production'
          ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${transactionId}/status`
          : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${transactionId}/status`;

        console.log(`Checking PhonePe v2 transaction status for Txn ${transactionId} via ${statusUrl}`);

        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        });

        const resData = await response.json();

        // Normalize response to maintain compatibility with the frontend
        const isCompleted = resData.state === "COMPLETED";
        const normalizedResponse = {
          success: isCompleted,
          code: isCompleted ? "PAYMENT_SUCCESS" : (resData.state === "FAILED" ? "PAYMENT_ERROR" : "PAYMENT_PENDING"),
          message: isCompleted ? "Payment Successful" : (resData.state || "Payment status unknown"),
          data: {
            amount: resData.amount || 0
          },
          raw: resData
        };

        return new Response(JSON.stringify(normalizedResponse), {
          status: response.status || 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route fallback: Not found
      return errorResponse("Not Found", 404, corsHeaders);

    } catch (error) {
      console.error("Worker Execution Error:", error);
      return errorResponse(error.message || "Internal Server Error", 500, corsHeaders);
    }
  }
};

// OAuth token generator helper
async function getAccessToken(env) {
  const clientId = env.PHONEPE_MERCHANT_ID;
  const clientVersion = env.PHONEPE_SALT_INDEX;
  const clientSecret = env.PHONEPE_SALT_KEY;

  if (!clientId || !clientVersion || !clientSecret) {
    throw new Error("Server configuration error: Client ID, version, or secret not set in Worker settings/secrets");
  }

  const tokenUrl = env.PHONEPE_ENV === 'production'
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

  const body = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to generate PhonePe OAuth token: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// CORS Helper
function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  
  // Whitelisted origins
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://riza-fashions-c2d77.web.app",
    "https://rizaecom-62115.web.app",
    "https://rizafashions.in",
    "https://www.rizafashions.in"
  ];

  if (env.FRONTEND_URL) {
    allowedOrigins.push(env.FRONTEND_URL);
  }

  const isAllowed = allowedOrigins.includes(origin) || 
                    (origin && (
                      origin.startsWith("http://localhost:") || 
                      origin.startsWith("http://127.0.0.1:") || 
                      origin.endsWith(".web.app")
                    ));

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : (env.FRONTEND_URL || '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Verify, X-Merchant-Id',
    'Access-Control-Max-Age': '86400',
  };
}

// Error JSON helper
function errorResponse(message, statusCode, corsHeaders) {
  return new Response(JSON.stringify({
    success: false,
    message: message
  }), {
    status: statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
