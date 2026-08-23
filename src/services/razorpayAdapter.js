// STARDUST - Razorpay Provider Adapter
// Decouples payment gateway operations from STARDUST client-side UI logic.
// Implements secure, credential-free sandboxing and defines future live/test hooks.

const RAZORPAY_CONFIG = {
  // Reads key ID from Vite client environment variables if provided
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || null,
  
  // Never expose VITE_RAZORPAY_KEY_SECRET on client-side JS bundles.
  // Secure serverless/backend integration should handle verification signing.
  isSandbox: !import.meta.env.VITE_RAZORPAY_KEY_ID
};

/**
 * Maps incoming Razorpay webhook payloads to APEX-compatible engine events.
 * Handles currency mapping converting paise (Razorpay integer) to INR (STARDUST integer).
 * 
 * @param {object} razorpayEvent The incoming Razorpay webhook event object
 * @returns {object} APEX Engine-compatible threat event payload
 */
export const mapWebhookEventToApex = (razorpayEvent) => {
  if (!razorpayEvent || typeof razorpayEvent !== "object") {
    throw new Error("Invalid Razorpay webhook payload format: must be a non-null object");
  }

  const { event: eventName, payload } = razorpayEvent;
  
  if (!eventName || !payload) {
    throw new Error("Invalid Razorpay webhook payload format: missing event or payload fields");
  }

  // Support mapping standard Razorpay events
  switch (eventName) {
    case "payment.failed": {
      const payment = payload.payment.entity;
      if (!payment) throw new Error("Missing payment entity inside webhook payload");
      
      return {
        type: "PAYMENT_FAILED",
        customer: payment.notes?.customer_name || payment.email || "Unknown Client",
        amount: Math.round(payment.amount / 100), // convert paise to INR
        reason: payment.error_code || "UNKNOWN",
        gatewayId: payment.id,
        timestamp: new Date().toISOString()
      };
    }
    
    case "subscription.charged":
    case "subscription.pending": {
      const subscription = payload.subscription.entity;
      const payment = payload.payment?.entity;
      if (!subscription) throw new Error("Missing subscription entity inside webhook payload");

      return {
        type: "SUBSCRIPTION_FAILED",
        customer: subscription.notes?.customer_name || payment?.email || "Subscriber Account",
        amount: Math.round(subscription.charge_amount / 100) || 9800,
        reason: payment?.error_code || "CARD_EXPIRED",
        gatewayId: subscription.id,
        timestamp: new Date().toISOString()
      };
    }

    case "invoice.expired":
    case "invoice.partially_paid": {
      const invoice = payload.invoice.entity;
      if (!invoice) throw new Error("Missing invoice entity inside webhook payload");

      return {
        type: "INVOICE_OVERDUE",
        customer: invoice.customer_details?.name || "Corporate Merchant",
        amount: Math.round(invoice.amount / 100),
        reason: "UNKNOWN",
        gatewayId: invoice.id,
        timestamp: new Date().toISOString()
      };
    }

    default:
      throw new Error(`Unsupported Razorpay webhook event mapping: "${eventName}"`);
  }
};

/**
 * Executes a payment retry capture request.
 * If running client-side without credentials, operates in safe Sandbox mode.
 * If running live, proxies the request to a secure backend route to protect secrets.
 * 
 * @param {string} paymentId The target failed payment ID
 * @param {number} amount Transaction amount in INR
 * @returns {Promise<object>} Capture result status
 */
export const executePaymentRetry = async (paymentId, amount) => {
  if (RAZORPAY_CONFIG.isSandbox) {
    console.warn(`[RAZORPAY ADAPTER] Sandbox active. Simulating payment capture retry for ID: ${paymentId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          simulated: true,
          status: "authorized",
          paymentId: `pay_sandbox_${Math.floor(Math.random() * 1000000)}`,
          amount,
          message: "Sandbox payment capture request authorized by mock gateway."
        });
      }, 500);
    });
  }

  // Live Integration Configuration:
  // We trigger the capture request securely via our backend proxy endpoint
  // to avoid exposing private secrets on client-side JS bundles.
  try {
    const response = await fetch("/api/razorpay/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        amount: amount * 100, // convert back to paise for Razorpay API
        keyId: RAZORPAY_CONFIG.keyId
      })
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Dispatches a request to create a Razorpay payment link.
 * If running client-side without credentials, generates a sandbox link.
 * If running live, proxies the request to a secure backend route.
 * 
 * @param {number} amount Link amount in INR
 * @param {string} customerName Client recipient name
 * @param {string} email Client email address
 * @returns {Promise<object>} Link creation details
 */
export const generateRecoveryLink = async (amount, customerName, email) => {
  if (RAZORPAY_CONFIG.isSandbox) {
    console.warn(`[RAZORPAY ADAPTER] Sandbox active. Simulating Payment Link generation for ₹${amount}.`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          simulated: true,
          short_url: `https://rzp.io/i/sandbox_link_${Date.now()}`,
          payment_link_id: `plink_${Math.floor(Math.random() * 1000000)}`
        });
      }, 500);
    });
  }

  try {
    const response = await fetch("/api/razorpay/payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount * 100, // paise
        customerName,
        email,
        keyId: RAZORPAY_CONFIG.keyId
      })
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Returns configuration metadata details (useful for diagnostics dashboards)
 */
export const getAdapterMetadata = () => {
  return {
    provider: "Razorpay",
    sandboxMode: RAZORPAY_CONFIG.isSandbox,
    keyIdConfigured: !!RAZORPAY_CONFIG.keyId,
    endpointMapping: "/api/razorpay/*"
  };
};
