import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL:'http://127.0.0.1:4173', trace:'retain-on-failure' },
  projects:[
    {name:'desktop',use:{browserName:'chromium',viewport:{width:1280,height:800}}},
    {name:'mobile',use:{...devices['iPhone 13'],browserName:'chromium'}},
    {name:'webkit-mobile',use:{...devices['iPhone 13'],browserName:'webkit'}},
    {name:'webkit-compact',use:{browserName:'webkit',viewport:{width:320,height:568},deviceScaleFactor:2,isMobile:true,hasTouch:true}}
  ],
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:120000}
});
