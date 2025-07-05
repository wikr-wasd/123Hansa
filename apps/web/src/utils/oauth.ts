// OAuth utility functions for authentication

export type OAuthProvider = 'google' | 'linkedin' | 'meta' | 'github' | 'apple';

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  state: string;
}

// Generate secure random state for OAuth
export const generateOAuthState = (): string => {
  return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};

// Build OAuth authorization URL
export const buildOAuthUrl = (provider: OAuthProvider, config: OAuthConfig): string => {
  const baseUrls = {
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    meta: 'https://www.facebook.com/v18.0/dialog/oauth',
    github: 'https://github.com/login/oauth/authorize',
    apple: 'https://appleid.apple.com/auth/authorize',
  };

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: config.responseType,
    state: config.state,
  });

  // Add provider-specific parameters
  if (provider === 'google') {
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  } else if (provider === 'linkedin') {
    params.append('response_type', 'code');
  } else if (provider === 'meta') {
    params.append('response_type', 'code');
  } else if (provider === 'github') {
    params.append('allow_signup', 'true');
  } else if (provider === 'apple') {
    params.append('response_mode', 'form_post');
  }

  return `${baseUrls[provider]}?${params.toString()}`;
};

// Get OAuth configuration for each provider
export const getOAuthConfig = (provider: OAuthProvider): OAuthConfig => {
  const baseRedirectUri = import.meta.env.VITE_OAUTH_REDIRECT_BASE_URL || window.location.origin;
  const state = generateOAuthState();
  
  // Store state in sessionStorage for verification
  sessionStorage.setItem(`oauth_state_${provider}`, state);

  const configs: Record<OAuthProvider, OAuthConfig> = {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: `${baseRedirectUri}/auth/callback/google`,
      scope: 'openid email profile',
      responseType: 'code',
      state,
    },
    linkedin: {
      clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
      redirectUri: `${baseRedirectUri}/auth/callback/linkedin`,
      scope: 'r_liteprofile r_emailaddress',
      responseType: 'code',
      state,
    },
    meta: {
      clientId: import.meta.env.VITE_META_CLIENT_ID || '',
      redirectUri: `${baseRedirectUri}/auth/callback/meta`,
      scope: 'email',
      responseType: 'code',
      state,
    },
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      redirectUri: `${baseRedirectUri}/auth/callback/github`,
      scope: 'user:email',
      responseType: 'code',
      state,
    },
    apple: {
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID || '',
      redirectUri: `${baseRedirectUri}/auth/callback/apple`,
      scope: 'name email',
      responseType: 'code',
      state,
    },
  };

  return configs[provider];
};

// Initiate OAuth flow
export const initiateOAuth = (provider: OAuthProvider): void => {
  const config = getOAuthConfig(provider);
  
  if (!config.clientId) {
    throw new Error(`${provider} OAuth client ID is not configured`);
  }

  const authUrl = buildOAuthUrl(provider, config);
  
  // Store the current page for redirect after auth
  sessionStorage.setItem('oauth_redirect_after_auth', window.location.pathname);
  
  // Redirect to OAuth provider
  window.location.href = authUrl;
};

// Verify OAuth state parameter
export const verifyOAuthState = (provider: OAuthProvider, receivedState: string): boolean => {
  const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
  
  if (!storedState || storedState !== receivedState) {
    return false;
  }

  // Clean up stored state
  sessionStorage.removeItem(`oauth_state_${provider}`);
  return true;
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (provider: OAuthProvider, code: string): Promise<any> => {
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  
  const response = await fetch(`${API_URL}/auth/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      code,
      redirectUri: getOAuthConfig(provider).redirectUri,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to exchange code for token');
  }

  return await response.json();
};

// Get user info from OAuth provider
export const getOAuthUserInfo = async (provider: OAuthProvider, accessToken: string): Promise<any> => {
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  
  const response = await fetch(`${API_URL}/auth/oauth/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      accessToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get user info');
  }

  return await response.json();
};

// Handle OAuth callback
export const handleOAuthCallback = async (provider: OAuthProvider, code: string, state: string): Promise<any> => {
  // Verify state parameter
  if (!verifyOAuthState(provider, state)) {
    throw new Error('Invalid OAuth state parameter');
  }

  // Exchange code for token
  const tokenResponse = await exchangeCodeForToken(provider, code);
  
  // Get user info
  const userInfo = await getOAuthUserInfo(provider, tokenResponse.access_token);
  
  // Create or login user
  const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  
  const authResponse = await fetch(`${API_URL}/auth/oauth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      userInfo,
      accessToken: tokenResponse.access_token,
    }),
  });

  if (!authResponse.ok) {
    const errorData = await authResponse.json();
    throw new Error(errorData.error || 'Failed to authenticate user');
  }

  const authData = await authResponse.json();
  
  // Store auth data in localStorage
  localStorage.setItem('auth_token', authData.token);
  localStorage.setItem('user_data', JSON.stringify(authData.user));
  
  // Get redirect path
  const redirectPath = sessionStorage.getItem('oauth_redirect_after_auth') || '/dashboard';
  sessionStorage.removeItem('oauth_redirect_after_auth');
  
  return {
    user: authData.user,
    token: authData.token,
    redirectPath,
  };
};

// Check if OAuth provider is configured
export const isOAuthProviderConfigured = (provider: OAuthProvider): boolean => {
  const envVars = {
    google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    meta: import.meta.env.VITE_META_CLIENT_ID,
    github: import.meta.env.VITE_GITHUB_CLIENT_ID,
    apple: import.meta.env.VITE_APPLE_CLIENT_ID,
  };

  return !!envVars[provider];
};

// Get available OAuth providers
export const getAvailableOAuthProviders = (): OAuthProvider[] => {
  const providers: OAuthProvider[] = ['google', 'linkedin', 'meta', 'github', 'apple'];
  return providers.filter(provider => isOAuthProviderConfigured(provider));
};

// Clear OAuth data
export const clearOAuthData = (): void => {
  const providers: OAuthProvider[] = ['google', 'linkedin', 'meta', 'github', 'apple'];
  
  providers.forEach(provider => {
    sessionStorage.removeItem(`oauth_state_${provider}`);
  });
  
  sessionStorage.removeItem('oauth_redirect_after_auth');
};