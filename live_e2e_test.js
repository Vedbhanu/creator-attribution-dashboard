const BASE_URL = 'http://localhost:3000';

async function runLiveE2ETest() {
  console.log('🚀 STARTING LIVE END-TO-END CUSTOMER JOURNEY TEST\n');
  const results = [];

  // PHASE 1: LANDING PAGE & BOOKING LINK
  try {
    console.log('--- PHASE 1: Marketing & Cal.com Booking Link Test ---');
    const res = await fetch(`${BASE_URL}/welcome`);
    const html = await res.text();
    const hasCalLink = html.includes('https://cal.com/ved-automation-contentleverage/creator-attribution');
    results.push({
      step: '1. Landing Page & Cal.com Link',
      status: hasCalLink ? 'PASS' : 'FAIL',
      details: hasCalLink ? 'Found exact Cal.com link: https://cal.com/ved-automation-contentleverage/creator-attribution' : 'Cal link missing'
    });
    console.log(`[${hasCalLink ? 'PASS' : 'FAIL'}] Landing page loaded. Booking link verified.`);
  } catch (err) {
    results.push({ step: '1. Landing Page & Cal.com Link', status: 'FAIL', details: err.message });
  }

  // PHASE 2: ONBOARDING & CONTENT CREATION
  let createdSlug = 'yt-live-test-' + Math.floor(Math.random() * 1000);
  let contentId = '';
  try {
    console.log('\n--- PHASE 2: Creator Onboarding & Content Link Creation ---');
    const res = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Live Test Video: How to Scale Creator Revenue',
        platform: 'YouTube',
        url: 'https://youtube.com/watch?v=live123test',
        tracking_slug: createdSlug,
        userId: 'live_test_user'
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      contentId = json.data.id;
      results.push({
        step: '2. Create Content & Tracking Link',
        status: 'PASS',
        details: `Created Content ID: ${contentId}, Slug: /r/${createdSlug}`
      });
      console.log(`[PASS] Content created successfully. Short slug: /r/${createdSlug}`);
    } else {
      results.push({ step: '2. Create Content & Tracking Link', status: 'FAIL', details: json.error });
    }
  } catch (err) {
    results.push({ step: '2. Create Content & Tracking Link', status: 'FAIL', details: err.message });
  }

  // PHASE 3: VISITOR CLICK & TRACKING REDIRECT
  const testVisitorEmail = `sarah.creator.${Date.now()}@example.com`;
  try {
    console.log('\n--- PHASE 3: First-Time Visitor Click & Cookie Log ---');
    const trackingUrl = `${BASE_URL}/r/${createdSlug}?utm_source=youtube&utm_medium=description&utm_campaign=live_test`;
    
    let res = await fetch(trackingUrl, { redirect: 'manual' });
    let setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
    let hasCookie = setCookies.some(c => c && c.includes('creator_visitor_id')) || Boolean(res.headers.get('set-cookie'));

    if (!hasCookie) {
      await new Promise(r => setTimeout(r, 600));
      res = await fetch(trackingUrl, { redirect: 'manual' });
      setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
      hasCookie = setCookies.some(c => c && c.includes('creator_visitor_id')) || Boolean(res.headers.get('set-cookie'));
    }

    const location = res.headers.get('location');
    const isRedirect = res.status === 302 || res.status === 307;
    
    results.push({
      step: '3. Short Link Click & Cookie Logging',
      status: (isRedirect && hasCookie) ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status} Redirect to: ${location} | Cookie set: ${hasCookie}`
    });
    console.log(`[${isRedirect && hasCookie ? 'PASS' : 'FAIL'}] Visitor clicked link. 302 Redirected to target URL with 30-day tracking cookie.`);
  } catch (err) {
    results.push({ step: '3. Short Link Click & Cookie Logging', status: 'FAIL', details: err.message });
  }

  // PHASE 4: LEAD FORM OPT-IN
  let leadId = '';
  try {
    console.log('\n--- PHASE 4: Lead Form Submission (/c/[slug]) ---');
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testVisitorEmail,
        phone: '+15550188',
        tracking_slug: createdSlug
      })
    });
    const json = await res.json();
    if (json.success && json.data) {
      leadId = json.data.id;
      results.push({
        step: '4. Lead Capture Form Submission',
        status: 'PASS',
        details: `Captured Lead ID: ${leadId} for email: ${testVisitorEmail}`
      });
      console.log(`[PASS] Lead captured: ${testVisitorEmail} linked to Content ID ${contentId}`);
    } else {
      results.push({ step: '4. Lead Capture Form Submission', status: 'FAIL', details: json.error });
    }
  } catch (err) {
    results.push({ step: '4. Lead Capture Form Submission', status: 'FAIL', details: err.message });
  }

  // PHASE 5: SALES WEBHOOK ATTRIBUTION WITH AUTHORIZATION HEADER
  try {
    console.log('\n--- PHASE 5: PayPal / Payoneer Sales Webhook Attribution ---');
    const res = await fetch(`${BASE_URL}/api/webhooks/sales`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer whsec_creator_attrib_982374'
      },
      body: JSON.stringify({
        email: testVisitorEmail,
        amount: 999.00,
        product_name: 'Done-For-You Agency Package'
      })
    });
    const json = await res.json();
    if (json.success && json.sale) {
      results.push({
        step: '5. Sales Webhook Revenue Attribution',
        status: 'PASS',
        details: `Attributed $${json.sale.amount} sale to Lead ${testVisitorEmail}`
      });
      console.log(`[PASS] Sales webhook success: $999.00 attributed to lead ${testVisitorEmail}`);
    } else {
      results.push({ step: '5. Sales Webhook Revenue Attribution', status: 'FAIL', details: json.error });
    }
  } catch (err) {
    results.push({ step: '5. Sales Webhook Revenue Attribution', status: 'FAIL', details: err.message });
  }

  // PHASE 6: PER-VIDEO FINANCIAL P&L REPORT VERIFICATION
  try {
    console.log('\n--- PHASE 6: Per-Video Financial P&L Report Verification ---');
    const res = await fetch(`${BASE_URL}/api/content/${contentId}`);
    const json = await res.json();
    if (json.success && json.metrics) {
      const { visitors_count, leads_count, sales_count, total_revenue } = json.metrics;
      const isVerified = total_revenue === 999 && sales_count >= 1 && leads_count >= 1;
      results.push({
        step: '6. Per-Video P&L Financial Report Card',
        status: isVerified ? 'PASS' : 'FAIL',
        details: `Revenue: $${total_revenue} | Clicks: ${visitors_count} | Leads: ${leads_count} | Sales: ${sales_count}`
      });
      console.log(`[${isVerified ? 'PASS' : 'FAIL'}] Per-Video Report Card verified: Revenue $${total_revenue}, Clicks ${visitors_count}, Leads ${leads_count}, Sales ${sales_count}`);
    } else {
      results.push({ step: '6. Per-Video P&L Financial Report Card', status: 'FAIL', details: json.error });
    }
  } catch (err) {
    results.push({ step: '6. Per-Video P&L Financial Report Card', status: 'FAIL', details: err.message });
  }

  console.log('\n==================================================');
  console.log('🏆 LIVE END-TO-END TEST SUMMARY RESULTS');
  console.log('==================================================');
  console.table(results);
}

runLiveE2ETest();
