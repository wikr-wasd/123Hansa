import { VercelRequest, VercelResponse } from '@vercel/node';

interface CRMContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  interests?: string[];
  source: string;
  listingId?: string;
  properties?: Record<string, any>;
}

interface CRMRequest {
  contact: CRMContact;
  crmType: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { contact, crmType }: CRMRequest = req.body;

    // Validate required fields
    if (!contact.email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Route to appropriate CRM
    let result;
    switch (crmType.toLowerCase()) {
      case 'hubspot':
        result = await sendToHubSpot(contact);
        break;
      case 'salesforce':
        result = await sendToSalesforce(contact);
        break;
      case 'pipedrive':
        result = await sendToPipedrive(contact);
        break;
      case 'activecampaign':
        result = await sendToActiveCampaign(contact);
        break;
      case 'klaviyo':
        result = await sendToKlaviyo(contact);
        break;
      case 'mailchimp':
        result = await sendToMailChimp(contact);
        break;
      default:
        throw new Error(`Unsupported CRM type: ${crmType}`);
    }

    res.status(200).json({
      success: true,
      data: result,
      message: `Contact successfully sent to ${crmType}`,
    });

  } catch (error) {
    console.error('CRM integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send contact to CRM',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// HubSpot integration
async function sendToHubSpot(contact: CRMContact) {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const portalId = process.env.HUBSPOT_PORTAL_ID;

  if (!apiKey || !portalId) {
    throw new Error('HubSpot API credentials not configured');
  }

  const contactData = {
    properties: {
      email: contact.email,
      firstname: contact.firstName || '',
      lastname: contact.lastName || '',
      phone: contact.phone || '',
      company: contact.company || '',
      lifecyclestage: 'lead',
      lead_source: contact.source,
      listing_id: contact.listingId || '',
      ...contact.properties,
    },
  };

  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HubSpot API error: ${errorData.message}`);
  }

  return await response.json();
}

// Salesforce integration
async function sendToSalesforce(contact: CRMContact) {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;

  if (!clientId || !clientSecret || !securityToken) {
    throw new Error('Salesforce API credentials not configured');
  }

  // First, get access token
  const authResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!authResponse.ok) {
    throw new Error('Failed to authenticate with Salesforce');
  }

  const { access_token, instance_url } = await authResponse.json();

  // Create lead
  const leadData = {
    FirstName: contact.firstName || '',
    LastName: contact.lastName || contact.email.split('@')[0],
    Email: contact.email,
    Phone: contact.phone || '',
    Company: contact.company || 'Unknown',
    LeadSource: contact.source,
    Description: `Listing ID: ${contact.listingId || 'N/A'}`,
  };

  const leadResponse = await fetch(`${instance_url}/services/data/v54.0/sobjects/Lead/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  if (!leadResponse.ok) {
    const errorData = await leadResponse.json();
    throw new Error(`Salesforce API error: ${errorData[0]?.message || 'Unknown error'}`);
  }

  return await leadResponse.json();
}

// Pipedrive integration
async function sendToPipedrive(contact: CRMContact) {
  const apiKey = process.env.PIPEDRIVE_API_KEY;
  const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

  if (!apiKey || !companyDomain) {
    throw new Error('Pipedrive API credentials not configured');
  }

  const personData = {
    name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email,
    email: [{ value: contact.email, primary: true }],
    phone: contact.phone ? [{ value: contact.phone, primary: true }] : [],
    org_name: contact.company || '',
    marketing_status: 'subscribed',
    add_time: new Date().toISOString(),
  };

  const response = await fetch(`https://${companyDomain}.pipedrive.com/api/v1/persons?api_token=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Pipedrive API error: ${errorData.error}`);
  }

  return await response.json();
}

// ActiveCampaign integration
async function sendToActiveCampaign(contact: CRMContact) {
  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY;
  const apiUrl = process.env.ACTIVECAMPAIGN_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('ActiveCampaign API credentials not configured');
  }

  const contactData = {
    contact: {
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      fieldValues: [
        {
          field: 'company',
          value: contact.company || '',
        },
        {
          field: 'lead_source',
          value: contact.source,
        },
      ],
    },
  };

  const response = await fetch(`${apiUrl}/api/3/contacts`, {
    method: 'POST',
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`ActiveCampaign API error: ${errorData.message}`);
  }

  return await response.json();
}

// Klaviyo integration
async function sendToKlaviyo(contact: CRMContact) {
  const apiKey = process.env.KLAVIYO_API_KEY;

  if (!apiKey) {
    throw new Error('Klaviyo API credentials not configured');
  }

  const profileData = {
    data: {
      type: 'profile',
      attributes: {
        email: contact.email,
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        phone_number: contact.phone || '',
        organization: contact.company || '',
        properties: {
          lead_source: contact.source,
          listing_id: contact.listingId || '',
          ...contact.properties,
        },
      },
    },
  };

  const response = await fetch('https://a.klaviyo.com/api/profiles/', {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      'revision': '2024-02-15',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Klaviyo API error: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
  }

  return await response.json();
}

// MailChimp integration
async function sendToMailChimp(contact: CRMContact) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error('MailChimp API credentials not configured');
  }

  const serverPrefix = apiKey.split('-')[1];
  const memberData = {
    email_address: contact.email,
    status: 'subscribed',
    merge_fields: {
      FNAME: contact.firstName || '',
      LNAME: contact.lastName || '',
      PHONE: contact.phone || '',
      COMPANY: contact.company || '',
    },
    tags: [contact.source, 'website-lead'],
  };

  const response = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: 'POST',
    headers: {
      'Authorization': `apikey ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`MailChimp API error: ${errorData.title}`);
  }

  return await response.json();
}