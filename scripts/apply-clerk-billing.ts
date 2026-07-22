import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Feature {
  slug: string;
  name: string;
  description?: string;
}

interface Price {
  currency: string;
  amount: number;
  interval: 'month' | 'year';
  display_amount?: string;
}

interface Plan {
  slug: string;
  name: string;
  description?: string;
  payer_type: string;
  prices: Price[];
  features: string[];
}

interface BillingConfig {
  user_enabled: boolean;
  organization_enabled: boolean;
  currency: string;
  features: Feature[];
  plans: Plan[];
}

interface ClerkConfigFile {
  $schema?: string;
  version?: string;
  billing: BillingConfig;
}

const REQUIRED_FEATURES = [
  'basic_editor',
  'image_ai',
  'advanced_image',
  'advanced_video',
  'audio_extraction',
  'subtitle_overlay',
];

const EXPECTED_PLANS: Record<string, {
  name: string;
  payerType: string;
  expectedFeatures: string[];
  expectedPrices: { interval: 'month' | 'year'; amount: number }[];
}> = {
  free: {
    name: 'Free',
    payerType: 'user',
    expectedFeatures: ['basic_editor'],
    expectedPrices: [
      { interval: 'month', amount: 0 },
    ],
  },
  pro: {
    name: 'Pro',
    payerType: 'user',
    expectedFeatures: ['basic_editor', 'image_ai', 'advanced_image', 'advanced_video'],
    expectedPrices: [
      { interval: 'month', amount: 1500 },
      { interval: 'year', amount: 15000 },
    ],
  },
  ultra: {
    name: 'Ultra',
    payerType: 'user',
    expectedFeatures: ['basic_editor', 'image_ai', 'advanced_image', 'advanced_video', 'audio_extraction', 'subtitle_overlay'],
    expectedPrices: [
      { interval: 'month', amount: 3000 },
      { interval: 'year', amount: 30000 },
    ],
  },
};

function logSuccess(msg: string) {
  console.log(`\x1b[32m✔\x1b[0m ${msg}`);
}

function logError(msg: string) {
  console.error(`\x1b[31m✖\x1b[0m ${msg}`);
}

function logInfo(msg: string) {
  console.log(`\x1b[36mℹ\x1b[0m ${msg}`);
}

export function validateBillingConfig(filePath: string): boolean {
  console.log(`\n--- Validating Clerk Billing Config: ${filePath} ---`);
  
  if (!fs.existsSync(filePath)) {
    logError(`File not found: ${filePath}`);
    return false;
  }

  let rawData: string;
  try {
    rawData = fs.readFileSync(filePath, 'utf-8');
  } catch (err: any) {
    logError(`Failed to read file ${filePath}: ${err.message}`);
    return false;
  }

  let parsed: ClerkConfigFile;
  try {
    parsed = JSON.parse(rawData);
    logSuccess('JSON syntax is valid');
  } catch (err: any) {
    logError(`JSON parse error: ${err.message}`);
    return false;
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.billing) {
    logError('Root object must contain a "billing" configuration block');
    return false;
  }

  const { billing } = parsed;
  let hasErrors = false;

  // 1. Verify Features
  logInfo('Verifying feature definitions...');
  if (!Array.isArray(billing.features)) {
    logError('"billing.features" must be an array');
    return false;
  }

  const definedFeatureSlugs = new Set<string>();
  for (const feature of billing.features) {
    if (!feature.slug || typeof feature.slug !== 'string') {
      logError(`Invalid feature entry missing "slug": ${JSON.stringify(feature)}`);
      hasErrors = true;
      continue;
    }
    if (definedFeatureSlugs.has(feature.slug)) {
      logError(`Duplicate feature slug detected: "${feature.slug}"`);
      hasErrors = true;
    }
    definedFeatureSlugs.add(feature.slug);
  }

  for (const reqFeature of REQUIRED_FEATURES) {
    if (!definedFeatureSlugs.has(reqFeature)) {
      logError(`Missing required feature slug: "${reqFeature}"`);
      hasErrors = true;
    } else {
      logSuccess(`Feature slug verified: "${reqFeature}"`);
    }
  }

  // 2. Verify Plans and Entitlements
  logInfo('Verifying user plans and feature entitlements...');
  if (!Array.isArray(billing.plans)) {
    logError('"billing.plans" must be an array');
    return false;
  }

  const planMap = new Map<string, Plan>();
  for (const plan of billing.plans) {
    if (!plan.slug) {
      logError(`Invalid plan entry missing "slug": ${JSON.stringify(plan)}`);
      hasErrors = true;
      continue;
    }
    planMap.set(plan.slug, plan);
  }

  for (const [planSlug, expected] of Object.entries(EXPECTED_PLANS)) {
    const plan = planMap.get(planSlug);
    if (!plan) {
      logError(`Missing required plan: "${planSlug}"`);
      hasErrors = true;
      continue;
    }

    logSuccess(`Plan "${planSlug}" exists`);

    // Check payer_type
    if (plan.payer_type !== expected.payerType) {
      logError(`Plan "${planSlug}" payer_type is "${plan.payer_type}", expected "${expected.payerType}"`);
      hasErrors = true;
    }

    // Check feature attachments
    const attachedFeatures = new Set(plan.features || []);
    for (const expFeat of expected.expectedFeatures) {
      if (!attachedFeatures.has(expFeat)) {
        logError(`Plan "${planSlug}" is missing feature entitlement: "${expFeat}"`);
        hasErrors = true;
      } else {
        logSuccess(`Plan "${planSlug}" entitlement confirmed: "${expFeat}"`);
      }
    }

    // Check for unmapped features in plan attachment
    for (const feat of plan.features || []) {
      if (!definedFeatureSlugs.has(feat)) {
        logError(`Plan "${planSlug}" references undefined feature slug: "${feat}"`);
        hasErrors = true;
      }
    }

    // Check prices
    if (!Array.isArray(plan.prices)) {
      logError(`Plan "${planSlug}" must have a "prices" array`);
      hasErrors = true;
    } else {
      for (const expPrice of expected.expectedPrices) {
        const found = plan.prices.find((p) => p.interval === expPrice.interval);
        if (!found) {
          logError(`Plan "${planSlug}" missing price for interval "${expPrice.interval}"`);
          hasErrors = true;
        } else if (found.amount !== expPrice.amount) {
          logError(`Plan "${planSlug}" price for "${expPrice.interval}" is ${found.amount}, expected ${expPrice.amount}`);
          hasErrors = true;
        } else {
          logSuccess(`Plan "${planSlug}" price confirmed: ${expPrice.interval} = $${expPrice.amount / 100}`);
        }
      }
    }
  }

  if (hasErrors) {
    logError('Billing configuration validation FAILED with errors.');
    return false;
  }

  logSuccess('All billing configuration checks PASSED successfully!\n');
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  const defaultPath = fs.existsSync(path.resolve(process.cwd(), '.agents/docs/billing.json'))
    ? path.resolve(process.cwd(), '.agents/docs/billing.json')
    : path.resolve(process.cwd(), 'billing.json');
  const targetFile = fileArgIdx !== -1 ? args[fileArgIdx + 1] : defaultPath;

  const isValid = validateBillingConfig(targetFile);

  if (!isValid) {
    process.exit(1);
  }

  if (args.includes('--dry-run') || args.includes('--patch') || args.includes('--apply')) {
    const isDryRun = args.includes('--dry-run');
    const cmd = `clerk config patch --file "${targetFile}" ${isDryRun ? '--dry-run' : ''}`;
    console.log(`Executing: ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit' });
      logSuccess(`Clerk config patch ${isDryRun ? '(dry-run) ' : ''}completed.`);
    } catch (err: any) {
      logError(`Failed to execute clerk CLI: ${err.message}`);
      console.log('Note: Ensure "clerk" CLI is installed and authenticated via `clerk login`.');
      process.exit(1);
    }
  } else {
    console.log('💡 To preview changes with Clerk CLI:');
    console.log(`   npx clerk config patch --file .agents/docs/billing.json --dry-run`);
    console.log('💡 To apply changes with Clerk CLI:');
    console.log(`   npx clerk config patch --file .agents/docs/billing.json\n`);
  }
}

if (require.main === module) {
  main();
}
