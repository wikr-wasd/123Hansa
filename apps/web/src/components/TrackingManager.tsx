import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface TrackingManagerProps {
  children?: React.ReactNode;
}

const TrackingManager: React.FC<TrackingManagerProps> = ({ children }) => {
  useEffect(() => {
    // Initialize tracking scripts after component mounts
    initializeTracking();
  }, []);

  const initializeTracking = () => {
    // Google Analytics
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID) {
      initGoogleAnalytics();
    }

    // Meta Pixel
    if (import.meta.env.VITE_META_PIXEL_ID) {
      initMetaPixel();
    }

    // TikTok Pixel
    if (import.meta.env.VITE_TIKTOK_PIXEL_ID) {
      initTikTokPixel();
    }

    // LinkedIn Insight Tag
    if (import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID) {
      initLinkedInInsight();
    }

    // Snapchat Pixel
    if (import.meta.env.VITE_SNAPCHAT_PIXEL_ID) {
      initSnapchatPixel();
    }

    // Twitter Pixel
    if (import.meta.env.VITE_TWITTER_PIXEL_ID) {
      initTwitterPixel();
    }
  };

  const initGoogleAnalytics = () => {
    const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  };

  const initMetaPixel = () => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    
    !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', pixelId);
    (window as any).fbq('track', 'PageView');
  };

  const initTikTokPixel = () => {
    const pixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;
    
    !(function(w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
      ];
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function(t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function(e: any, n: any) {
        var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = document.createElement('script');
        o.type = 'text/javascript';
        o.async = true;
        o.src = i + '?sdkid=' + e + '&lib=' + t;
        var a = document.getElementsByTagName('script')[0];
        a.parentNode!.insertBefore(o, a);
      };
      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');
  };

  const initLinkedInInsight = () => {
    const partnerId = import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID;
    
    (window as any)._linkedin_partner_id = partnerId;
    (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(partnerId);
    
    (function(l: any) {
      if (!l) {
        (window as any).lintrk = function(a: any, b: any) {
          (window as any).lintrk.q.push([a, b]);
        };
        (window as any).lintrk.q = [];
      }
      var s = document.getElementsByTagName('script')[0];
      var b = document.createElement('script');
      b.type = 'text/javascript';
      b.async = true;
      b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      s.parentNode!.insertBefore(b, s);
    })((window as any).lintrk);
  };

  const initSnapchatPixel = () => {
    const pixelId = import.meta.env.VITE_SNAPCHAT_PIXEL_ID;
    
    (function(e: any, t: any, n: any) {
      if (e.snaptr) return;
      var a = e.snaptr = function() {
        a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
      };
      a.queue = [];
      var s = 'script';
      var r = t.createElement(s);
      r.async = true;
      r.src = n;
      var u = t.getElementsByTagName(s)[0];
      u.parentNode!.insertBefore(r, u);
    })(window, document, 'https://sc-static.net/scevent.min.js');

    (window as any).snaptr('init', pixelId, {
      user_email: '__INSERT_USER_EMAIL__'
    });
    (window as any).snaptr('track', 'PAGE_VIEW');
  };

  const initTwitterPixel = () => {
    const pixelId = import.meta.env.VITE_TWITTER_PIXEL_ID;
    
    !(function(e: any, t: any, n: any, s: any, u: any, a: any) {
      e.twq || (s = e.twq = function() {
        s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
      }, s.version = '1.1', s.queue = [], u = t.createElement(n), u.async = !0, u.src = 'https://static.ads-twitter.com/uwt.js', a = t.getElementsByTagName(n)[0], a.parentNode!.insertBefore(u, a));
    })(window, document, 'script', 0);
    
    (window as any).twq('init', pixelId);
    (window as any).twq('track', 'PageView');
  };

  // Track page views when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Google Analytics
      if (import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID && (window as any).gtag) {
        (window as any).gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }

      // Meta Pixel
      if (import.meta.env.VITE_META_PIXEL_ID && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }

      // TikTok Pixel
      if (import.meta.env.VITE_TIKTOK_PIXEL_ID && (window as any).ttq) {
        (window as any).ttq.page();
      }

      // LinkedIn Insight
      if (import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID && (window as any).lintrk) {
        (window as any).lintrk('track', { conversion_id: import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID });
      }

      // Snapchat Pixel
      if (import.meta.env.VITE_SNAPCHAT_PIXEL_ID && (window as any).snaptr) {
        (window as any).snaptr('track', 'PAGE_VIEW');
      }

      // Twitter Pixel
      if (import.meta.env.VITE_TWITTER_PIXEL_ID && (window as any).twq) {
        (window as any).twq('track', 'PageView');
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      <Helmet>
        {/* Google Tag Manager */}
        {import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID}`} />
            <script>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID}');
              `}
            </script>
          </>
        )}

        {/* Meta Pixel noscript */}
        {import.meta.env.VITE_META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${import.meta.env.VITE_META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}

        {/* LinkedIn Insight noscript */}
        {import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://px.ads.linkedin.com/collect/?pid=${import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID}&fmt=gif`}
            />
          </noscript>
        )}
      </Helmet>
      {children}
    </>
  );
};

export default TrackingManager;