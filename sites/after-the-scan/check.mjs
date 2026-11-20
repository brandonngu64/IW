import assert from 'node:assert/strict';
import { readFile, readdir, access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import vm from 'node:vm';

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, 'dist');
const files = await readdir(dist);
const pages = new Map();
for (const name of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(resolve(dist, name), 'utf8');
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate HTML IDs`);
  assert.match(html, /<html lang="en">/, `${name}: document language missing`);
  assert.match(html, /name="viewport"/, `${name}: viewport missing`);
  assert.match(html, /class="skip-link"/, `${name}: skip link missing`);
  pages.set(name, { html, ids: new Set(ids) });
}
for (const [name, { html }] of pages) {
  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|data:)/.test(link)) continue;
    const [path, hash] = link.split('#');
    const target = path || name;
    await access(resolve(dist, target));
    if (hash) assert(pages.get(target)?.ids.has(hash), `${name}: missing target ${link}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) assert.match(match[0], /\balt="[^"]*"/, `${name}: image needs alt text`);
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(match[0], /rel="noopener noreferrer"/, `${name}: external link needs rel`);
}
const script = await readFile(resolve(dist, 'app.js'), 'utf8');
for (const [, hash] of script.matchAll(/href="#([^"]+)"/g)) assert(pages.get('index.html').ids.has(hash), `app.js: broken citation #${hash}`);
assert(!/localStorage|sessionStorage|document\.cookie|fetch\(/.test(script), 'Site interactions should not store or transmit choices');
const catalog = JSON.parse(await readFile(resolve(root, 'citation-data.json'), 'utf8'));
assert.equal(catalog.style, 'APA 7');
assert.deepEqual(catalog.sources.map(source => source.sortKey), catalog.sources.map(source => source.sortKey).sort(), 'APA reference names are not alphabetized');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const references = new Map(Array.from(pages.get('index.html').html.matchAll(/<li id="(source-[^"]+)" data-apa-author="([^"]+)" data-apa-year="([^"]+)" data-apa-short="([^"]*)">([\s\S]*?)<\/li>/g), match => [match[1], {author:decode(match[2]),year:match[3],shortAuthor:decode(match[4]),entry:match[5]}]));
assert.equal(references.size, 11, 'Expected one APA entry per audited source');
assert.deepEqual(Array.from(references.keys()), catalog.sources.map(source => source.id), 'APA reference order differs from the citation catalog');
for (const source of catalog.sources) {
  const reference = references.get(source.id);
  assert.equal(reference.author, source.author, `Reference author differs for ${source.id}`);
  assert.equal(reference.year, source.year, `Reference year differs for ${source.id}`);
  assert(reference.entry.includes(source.reference), `Reference formatting differs for ${source.id}`);
  assert(reference.entry.includes(`href="${source.url.replaceAll('&','&amp;')}"`), `Reference URL differs for ${source.id}`);
}
assert.equal(references.get('source-gao09').year, '2008a');
assert.equal(references.get('source-gao08').year, '2008b');
assert.equal(references.get('source-pclob702').year, '2014a');
assert.equal(references.get('source-pclob215').year, '2014b');
const interactiveContent = vm.runInNewContext(script.slice(0, script.indexOf('function setupTabs')) + '\nJSON.stringify({milestones,stages})');
const interactionData = JSON.parse(interactiveContent);
const citationFragments = [...pages.values()].map(page => page.html);
for (const group of Object.values(interactionData)) for (const item of Object.values(group)) citationFragments.push(item.text);
let citationCount = 0;
for (const fragment of citationFragments) {
  const citations = Array.from(fragment.matchAll(/<a class="citation" href="(?:index\.html)?#([^"]+)" data-apa-year="([^"]+)"[^>]*>([^<]+)<\/a>/g));
  assert.equal(citations.length, Array.from(fragment.matchAll(/<a class="citation"/g)).length, 'Citation syntax is inconsistent');
  for (const match of citations) {
    const reference = references.get(match[1]);
    assert(reference, `Citation target is missing: ${match[1]}`);
    assert.equal(match[2], reference.year, `Citation year does not match reference ${match[1]}`);
    const text = decode(match[3]);
    const authors = [reference.author, reference.shortAuthor, reference.shortAuthor ? `${reference.author} [${reference.shortAuthor}]` : ''].filter(Boolean);
    assert(authors.some(author => text === `${author}, ${reference.year}` || text.startsWith(`${author}, ${reference.year}, `)), `APA author–date citation mismatch: ${text}`);
    citationCount++;
  }
}
console.log(`PASS: ${references.size} APA references and ${citationCount} author–date citations agree across both pages and all interactive panels.`);
console.log('PASS: local assets, page anchors, source citations, image alternatives, and privacy checks.');

if (!process.argv.includes('--browser')) process.exit(0);

// Browser QA uses local Chrome only, with no npm dependencies.
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
await access(chromePath);
const qa = resolve(root, '.qa');
await mkdir(qa, { recursive: true });
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--hide-scrollbars', '--remote-debugging-port=9223', `--user-data-dir=${resolve(qa, 'chrome-profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(done => setTimeout(done, ms));
let ws;
try {
  let browserInfo;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { browserInfo = await (await fetch('http://127.0.0.1:9223/json/version')).json(); break; } catch { await pause(100); }
  }
  assert(browserInfo, 'Chrome debugging endpoint did not start');
  const target = await (await fetch('http://127.0.0.1:9223/json/new?http://127.0.0.1:4173', { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { ws.addEventListener('open', done, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let serial = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
      const { done, reject, timer } = pending.get(message.id);
      clearTimeout(timer); pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : done(message.result);
    }
  });
  const command = (method, params = {}) => new Promise((done, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 10000);
    pending.set(id, { done, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const click = async selector => {
    const point = await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  };
  const key = async key => { await command('Input.dispatchKeyEvent', { type: 'keyDown', key }); await command('Input.dispatchKeyEvent', { type: 'keyUp', key }); };
  const screenshot = async name => {
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(resolve(qa, name), Buffer.from(result.data, 'base64'));
  };
  await command('Page.enable'); await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: 'http://127.0.0.1:4173' });
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await evaluate('document.readyState === "complete"')) break;
    await pause(100);
  }
  assert.equal(await evaluate('document.title'), 'How the Iraq War Affected Digital Privacy Rights');
  assert(await evaluate('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)'), 'Image failed to load');
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Desktop horizontal overflow');
  await screenshot('desktop.png');
  for (const year of ['2001', '2003', '2008', '2015']) {
    await click(`[data-year="${year}"]`);
    assert.equal(await evaluate('document.querySelector(".timeline-year").textContent'), year);
    assert.equal(await evaluate('document.querySelectorAll("[data-year][aria-selected=true]").length'), 1);
  }
  await key('Home');
  assert.equal(await evaluate('document.querySelector(".timeline-year").textContent'), '2001', 'Timeline Home key');
  await key('ArrowRight');
  assert.equal(await evaluate('document.querySelector(".timeline-year").textContent'), '2003', 'Timeline Right key');
  await click('[data-step="collect"]');
  await key('ArrowDown');
  assert.equal(await evaluate('document.getElementById("process-panel").getAttribute("aria-labelledby")'), 'step-connect');
  assert.equal(await evaluate('document.querySelector("#process-panel .citation").getAttribute("href")'), '#source-gao09');
  await click('[data-step="classify"]');
  assert.equal(await evaluate('document.getElementById("process-panel").getAttribute("aria-labelledby")'), 'step-classify');
  assert.equal(await evaluate('document.querySelector("#process-panel .citation").getAttribute("href")'), '#source-hristova');
  await screenshot('explainer.png');
  await click('[data-answer="yes"]');
  assert.match(await evaluate('document.getElementById("quiz-feedback").textContent'), /dates do not line up/);
  await click('[data-answer="no"]');
  assert.match(await evaluate('document.getElementById("quiz-feedback").textContent'), /Correct/);
  await click('.privacy-questions summary');
  assert(await evaluate('document.querySelector(".privacy-questions details").open'));
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  await pause(100);
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile horizontal overflow');
  await screenshot('mobile.png');
  await click('.menu-toggle');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'true');
  await key('Escape');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false');
  assert.equal(await evaluate('document.querySelector(".process-tabs").getAttribute("aria-orientation")'), 'horizontal');
  await click('[data-step="collect"]'); await key('ArrowRight');
  assert.equal(await evaluate('document.querySelector("[data-step][aria-selected=true]").dataset.step'), 'connect', 'Mobile Right key');
  await screenshot('mobile-explainer.png');
  await command('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Small mobile horizontal overflow');
  await command('Page.navigate', { url: 'http://127.0.0.1:4173/methods.html' });
  for (let attempt = 0; attempt < 50; attempt++) { if (await evaluate('document.readyState === "complete"')) break; await pause(100); }
  assert.match(await evaluate('document.title'), /About this class project/);
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Methods mobile horizontal overflow');
  await command('Page.navigate', { url: pathToFileURL(resolve(dist, 'index.html')).href });
  for (let attempt = 0; attempt < 50; attempt++) { if (await evaluate('document.readyState === "complete"')) break; await pause(100); }
  assert(await evaluate('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)'), 'Direct-file assets failed to load');
  await click('[data-year="2015"]');
  assert.match(await evaluate('document.getElementById("timeline-panel").textContent'), /USA FREEDOM Act/);
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: Chrome desktop, 390px and 320px layouts; timeline/stage controls; keyboard tabs; quiz; accordion; mobile menu; methods page; direct-file use; no runtime errors.');
  console.log(`Screenshots: ${qa}`);
} finally {
  ws?.close(); chrome.kill();
}
